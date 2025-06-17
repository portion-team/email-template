const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Sample data for testing templates
const sampleData = {
  welcome: {
    firstName: 'John',
    appUrl: 'https://portion-app.com',
    supportEmail: 'cx@portion-app.com'
  },
  subscription_confirmation: {
    firstName: 'Sarah',
    packageName: 'Premium Health Plan',
    packageDuration: '30 days',
    deliveryDays: 'Monday, Wednesday, Friday',
    startDate: '2024-01-15',
    totalAmount: '150.00',
    firstDeliveryDate: '2024-01-15',
    appUrl: 'https://portion-app.com',
    supportEmail: 'cx@portion-app.com'
  },
  payment_receipt: {
    firstName: 'Mike',
    transactionId: 'TXN-123456789',
    paymentDate: '2024-01-10',
    paymentMethod: 'Credit Card (**** 1234)',
    packageName: 'Premium Health Plan',
    subtotal: '130.43',
    vatAmount: '19.57',
    vatRate: '15',
    totalAmount: '150.00',
    firstDeliveryDate: '2024-01-15',
    appUrl: 'https://portion-app.com',
    supportEmail: 'cx@portion-app.com'
  },
  delivery_confirmation: {
    firstName: 'Emma',
    deliveryStatus: 'Out for Delivery',
    deliveryDate: '2024-01-15',
    deliveryTime: '2:00 PM - 4:00 PM',
    deliveryAddress: '123 Main St, Manama, Bahrain',
    trackingNumber: 'TRK-987654321',
    driverPhone: '+973 1234 5678',
    mealItems: ['Grilled Chicken Salad', 'Quinoa Bowl', 'Fresh Fruit Mix'],
    trackingUrl: 'https://portion-app.com/track/TRK-987654321',
    supportEmail: 'cx@portion-app.com'
  },
  subscription_expiring: {
    firstName: 'Alex',
    expiryDate: '2024-01-30',
    daysRemaining: '3',
    renewalDiscount: '20',
    renewalUrl: 'https://portion-app.com/renew',
    browsePackagesUrl: 'https://portion-app.com/packages',
    supportEmail: 'cx@portion-app.com'
  },
  subscription_expired: {
    firstName: 'Lisa',
    expiryDate: '2024-01-05',
    comebackDiscount: '25',
    restartUrl: 'https://portion-app.com/restart',
    supportEmail: 'cx@portion-app.com'
  },
  password_reset: {
    firstName: 'David',
    resetCode: 'ABC123',
    resetUrl: 'https://portion-app.com/reset-password?token=xyz789',
    expiryHours: '24',
    supportEmail: 'cx@portion-app.com'
  },
  acquisition_campaign: {
    discountPercentage: '30',
    customerCount: '5000',
    signupUrl: 'https://portion-app.com/signup',
    supportEmail: 'cx@portion-app.com'
  },
  retention_campaign: {
    firstName: 'Rachel',
    daysWithPortion: '45',
    mealsDelivered: '135',
    caloriesSaved: '2500',
    streakDays: '12',
    specialOffer: true,
    offerDiscount: '15',
    appUrl: 'https://portion-app.com',
    supportEmail: 'cx@portion-app.com'
  }
};

async function validateTemplates() {
  try {
    const templatesConfig = JSON.parse(fs.readFileSync('./templates.json', 'utf8'));
    
    console.log('🔍 Validating email templates...\n');
    
    let validCount = 0;
    let errorCount = 0;
    
    for (const template of templatesConfig.templates) {
      try {
        console.log(`Validating ${template.id}...`);
        
        // Read HTML file
        const htmlPath = path.join('./templates', template.htmlFile);
        if (!fs.existsSync(htmlPath)) {
          throw new Error(`HTML file not found: ${template.htmlFile}`);
        }
        
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Compile with Handlebars
        const compiledTemplate = Handlebars.compile(htmlContent);
        
        // Get sample data for this template
        const testData = sampleData[template.id] || {};
        
        // Render template
        const renderedHtml = compiledTemplate(testData);
        
        // Basic validation checks
        if (!renderedHtml.includes('<html')) {
          throw new Error('Template does not contain valid HTML structure');
        }
        
        if (!renderedHtml.includes('Portion')) {
          throw new Error('Template does not contain Portion branding');
        }
        
        // Check if all required variables are defined
        const missingVars = template.variables.filter(variable => {
          return !testData.hasOwnProperty(variable) && renderedHtml.includes(`{{${variable}}}`);
        });
        
        if (missingVars.length > 0) {
          console.log(`  ⚠️  Missing sample data for variables: ${missingVars.join(', ')}`);
        }
        
        // Save rendered template for preview (optional)
        const outputDir = './rendered';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }
        
        fs.writeFileSync(
          path.join(outputDir, `${template.id}.html`),
          renderedHtml
        );
        
        console.log(`  ✅ Valid - rendered to ./rendered/${template.id}.html`);
        validCount++;
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Validation Summary:`);
    console.log(`  ✅ Valid templates: ${validCount}`);
    console.log(`  ❌ Invalid templates: ${errorCount}`);
    console.log(`  📁 Rendered templates saved to ./rendered/`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All templates are valid!');
    } else {
      console.log('\n⚠️  Some templates have issues. Please fix them before uploading.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateTemplates();