const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
AWS.config.update({
  region: 'us-east-2', // Update with your region
  // Make sure your AWS credentials are configured via AWS CLI or environment variables
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'EmailTemplates'; // Update with your actual table name

async function uploadTemplates() {
  try {
    // Read the templates configuration
    const templatesConfig = JSON.parse(fs.readFileSync('./templates.json', 'utf8'));
    
    console.log(`Found ${templatesConfig.templates.length} templates to upload...`);
    
    for (const template of templatesConfig.templates) {
      try {
        // Read the HTML file
        const htmlPath = path.join('./templates', template.htmlFile);
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Prepare the DynamoDB item
        const item = {
          templateId: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          version: template.version,
          htmlContent: htmlContent,
          variables: template.variables,
          active: template.active,
          createdAt: template.createdAt,
          updatedAt: new Date().toISOString(),
          // Add GitHub URL for reference
          githubUrl: `https://raw.githubusercontent.com/your-org/portion-email-templates/main/templates/${template.htmlFile}`
        };
        
        // Upload to DynamoDB
        const params = {
          TableName: TABLE_NAME,
          Item: item,
          // Use ConditionExpression to prevent overwriting existing templates
          // Remove this line if you want to update existing templates
          ConditionExpression: 'attribute_not_exists(templateId)'
        };
        
        await dynamodb.put(params).promise();
        console.log(`✅ Uploaded template: ${template.id}`);
        
      } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
          console.log(`⚠️  Template ${template.id} already exists, skipping...`);
        } else {
          console.error(`❌ Error uploading template ${template.id}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Template upload process completed!');
    
  } catch (error) {
    console.error('❌ Error reading templates configuration:', error.message);
  }
}

// Function to create the DynamoDB table if it doesn't exist
async function createTableIfNotExists() {
  const dynamodbClient = new AWS.DynamoDB();
  
  try {
    await dynamodbClient.describeTable({ TableName: TABLE_NAME }).promise();
    console.log(`✅ Table ${TABLE_NAME} already exists`);
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`Creating table ${TABLE_NAME}...`);
      
      const params = {
        TableName: TABLE_NAME,
        KeySchema: [
          {
            AttributeName: 'templateId',
            KeyType: 'HASH'
          }
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'templateId',
            AttributeType: 'S'
          }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      };
      
      await dynamodbClient.createTable(params).promise();
      console.log(`✅ Table ${TABLE_NAME} created successfully`);
      
      // Wait for table to be active
      await dynamodbClient.waitFor('tableExists', { TableName: TABLE_NAME }).promise();
      console.log(`✅ Table ${TABLE_NAME} is now active`);
    } else {
      throw error;
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting email template upload to DynamoDB...\n');
  
  try {
    await createTableIfNotExists();
    await uploadTemplates();
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

main();