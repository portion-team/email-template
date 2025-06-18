import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Email Template Visual Tests', () => {
  const templatesDir = path.join(__dirname, '../templates');
  
  // Get all template directories
  const templateDirs = fs.readdirSync(templatesDir).filter(dir => {
    const fullPath = path.join(templatesDir, dir);
    return fs.statSync(fullPath).isDirectory();
  });

  templateDirs.forEach(templateDir => {
    test(`${templateDir} template visual test`, async ({ page }) => {
      const templatePath = path.join(templatesDir, templateDir, 'index.html');
      
      // Skip if index.html doesn't exist
      if (!fs.existsSync(templatePath)) {
        console.log(`Skipping ${templateDir} - no index.html found`);
        return;
      }

      // Load the template
      await page.goto(`file://${templatePath}`);
      
      // Wait for images to load
      await page.waitForTimeout(3000);
      
      // Check for broken images
      const images = await page.locator('img').all();
      console.log(`\n=== ${templateDir.toUpperCase()} TEMPLATE ===`);
      console.log(`Found ${images.length} images`);
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = await img.getAttribute('src');
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        const naturalHeight = await img.evaluate(el => el.naturalHeight);
        
        console.log(`Image ${i + 1}:`);
        console.log(`  - Source: ${src}`);
        console.log(`  - Natural size: ${naturalWidth}x${naturalHeight}`);
        
        if (naturalWidth === 0 && naturalHeight === 0) {
          console.log(`  - ❌ BROKEN: Image failed to load`);
        } else {
          console.log(`  - ✅ OK: Image loaded successfully`);
        }
      }
      
      // Check for missing CSS
      const stylesheets = await page.locator('link[rel="stylesheet"]').all();
      console.log(`Found ${stylesheets.length} stylesheets`);
      
      for (let i = 0; i < stylesheets.length; i++) {
        const link = stylesheets[i];
        const href = await link.getAttribute('href');
        console.log(`Stylesheet ${i + 1}: ${href}`);
      }
      
      // Take a screenshot for visual inspection
      await page.screenshot({ 
        path: `test-results/${templateDir}-screenshot.png`,
        fullPage: true 
      });
      
      // Check for common email client compatibility issues
      const bodyStyles = await page.$eval('body', el => getComputedStyle(el));
      const tableElements = await page.locator('table').count();
      
      console.log(`Tables found: ${tableElements} (good for email compatibility)`);
      console.log(`Body background: ${bodyStyles.backgroundColor}`);
      
      // Log any console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`Console error in ${templateDir}: ${msg.text()}`);
        }
      });
    });
  });
  
  // Test specific templates that were recently updated
  test('Welcome template detailed check', async ({ page }) => {
    const welcomePath = path.join(templatesDir, 'welcome', 'index.html');
    
    if (!fs.existsSync(welcomePath)) {
      console.log('Welcome template not found');
      return;
    }
    
    await page.goto(`file://${welcomePath}`);
    await page.waitForTimeout(3000);
    
    // Check specific elements
    const heading = page.locator('h1, h2, .heading');
    const buttons = page.locator('a[style*="background"], .button');
    const logoImage = page.locator('img[src*="logo"], img[alt*="logo"]');
    
    console.log('\n=== WELCOME TEMPLATE DETAILED CHECK ===');
    
    if (await heading.count() > 0) {
      const headingText = await heading.first().textContent();
      console.log(`Main heading: "${headingText}"`);
    }
    
    if (await buttons.count() > 0) {
      console.log(`Buttons found: ${await buttons.count()}`);
      for (let i = 0; i < await buttons.count(); i++) {
        const buttonText = await buttons.nth(i).textContent();
        const buttonHref = await buttons.nth(i).getAttribute('href');
        console.log(`  Button ${i + 1}: "${buttonText}" -> ${buttonHref}`);
      }
    }
    
    if (await logoImage.count() > 0) {
      const logoSrc = await logoImage.first().getAttribute('src');
      const logoLoaded = await logoImage.first().evaluate(el => el.naturalWidth > 0);
      console.log(`Logo: ${logoSrc} - ${logoLoaded ? '✅ Loaded' : '❌ Failed'}`);
    }
  });
  
  test('Promotional campaign template detailed check', async ({ page }) => {
    const promoPath = path.join(templatesDir, 'promotional_campaign', 'index.html');
    
    if (!fs.existsSync(promoPath)) {
      console.log('Promotional campaign template not found');
      return;
    }
    
    await page.goto(`file://${promoPath}`);
    await page.waitForTimeout(3000);
    
    console.log('\n=== PROMOTIONAL CAMPAIGN TEMPLATE DETAILED CHECK ===');
    
    // Check for specific promotional elements
    const discountText = page.locator('*:has-text("10%"), *:has-text("discount"), *:has-text("offer")');
    const ctaButtons = page.locator('a[style*="background-color"], .cta, .button');
    const images = page.locator('img');
    
    if (await discountText.count() > 0) {
      console.log(`Discount mentions found: ${await discountText.count()}`);
      for (let i = 0; i < Math.min(3, await discountText.count()); i++) {
        const text = await discountText.nth(i).textContent();
        console.log(`  - "${text.trim()}"`);
      }
    }
    
    if (await ctaButtons.count() > 0) {
      console.log(`CTA buttons found: ${await ctaButtons.count()}`);
      for (let i = 0; i < await ctaButtons.count(); i++) {
        const buttonText = await ctaButtons.nth(i).textContent();
        const buttonStyle = await ctaButtons.nth(i).getAttribute('style');
        console.log(`  CTA ${i + 1}: "${buttonText}" - Style: ${buttonStyle?.substring(0, 50)}...`);
      }
    }
    
    console.log(`Total images: ${await images.count()}`);
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const loaded = await img.evaluate(el => el.naturalWidth > 0);
      console.log(`  Image ${i + 1}: ${src} (alt: "${alt}") - ${loaded ? '✅' : '❌'}`);
    }
  });
}); 