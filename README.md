# Portion Email Templates

This repository contains all email templates for the Portion app, stored as HTML files with Handlebars templating.

## Structure

```
portion-email-templates/
├── templates/                 # HTML template files
│   ├── welcome.html
│   ├── subscription_confirmation.html
│   ├── payment_receipt.html
│   ├── delivery_confirmation.html
│   ├── subscription_expiring.html
│   ├── subscription_expired.html
│   ├── password_reset.html
│   ├── acquisition_campaign.html
│   └── retention_campaign.html
├── shared/                    # Shared components (future use)
├── rendered/                  # Generated preview files
├── templates.json             # Template metadata
├── upload_to_dynamodb.js      # Upload script
├── validate_templates.js      # Validation script
└── package.json
```

## Available Templates

### Transactional Templates
- **welcome** - Welcome new users to Portion
- **subscription_confirmation** - Confirm subscription details
- **payment_receipt** - Payment confirmation and receipt
- **delivery_confirmation** - Notify about meal delivery
- **password_reset** - Help users reset their password

### Retention Templates
- **subscription_expiring** - Remind about expiring subscription
- **subscription_expired** - Win back users with expired subscriptions

### Marketing Templates
- **acquisition_campaign** - Acquire new customers
- **retention_campaign** - Motivate existing customers

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials (for DynamoDB upload):
```bash
aws configure
```

## Usage

### Validate Templates
Test all templates with sample data:
```bash
npm run validate
```

This will:
- Validate HTML structure
- Check for required variables
- Generate preview files in `./rendered/`

### Upload to DynamoDB
Upload templates to AWS DynamoDB:
```bash
npm run upload
```

**Important:** Update the following in `upload_to_dynamodb.js`:
- `TABLE_NAME` - Your DynamoDB table name
- `region` - Your AWS region
- `githubUrl` - Your GitHub repository URL

## Template Variables

Each template uses Handlebars syntax for variables. Common variables include:

### User Variables
- `firstName` - User's first name
- `supportEmail` - Support email address
- `appUrl` - App URL for CTAs

### Subscription Variables
- `packageName` - Name of the package
- `packageDuration` - Duration of the package
- `totalAmount` - Total amount paid
- `expiryDate` - Subscription expiry date

### Delivery Variables
- `deliveryDate` - Delivery date
- `deliveryTime` - Delivery time window
- `deliveryAddress` - Delivery address
- `mealItems` - Array of meal items

## Adding New Templates

1. Create HTML file in `./templates/`
2. Add template metadata to `templates.json`
3. Add sample data to `validate_templates.js`
4. Run validation: `npm run validate`
5. Upload to DynamoDB: `npm run upload`

## Template Guidelines

- Use Handlebars syntax for variables: `{{variableName}}`
- Include Portion branding and colors
- Ensure mobile-responsive design
- Test with sample data before uploading
- Use semantic HTML structure
- Include fallback text for images

## DynamoDB Schema

Templates are stored with the following structure:
```json
{
  "templateId": "welcome",
  "name": "Welcome Email",
  "description": "Welcome new users to Portion",
  "category": "onboarding",
  "version": "1.0.0",
  "htmlContent": "<html>...</html>",
  "variables": ["firstName", "appUrl", "supportEmail"],
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "githubUrl": "https://raw.githubusercontent.com/..."
}
```

## Migration from Hardcoded Templates

The app previously used hardcoded templates in `EmailTemplateService`. This system replaces those with GitHub-based templates stored in DynamoDB.

### Old System (Deprecated)
```dart
EmailTemplateService.TEMPLATE_WELCOME
EmailTemplateService.TEMPLATE_SUBSCRIPTION_CONFIRMATION
// etc...
```

### New System
Templates are now fetched from DynamoDB and cached locally, with the source HTML stored in this GitHub repository.