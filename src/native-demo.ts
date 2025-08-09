import dotenv from 'dotenv';
import { NotionNativeIntegration } from './NotionNativeIntegration';

// Load environment variables
dotenv.config();

async function runNativeDemo() {
  console.log('NOTION NATIVE AI INTEGRATION DEMO');
  console.log('=====================================\n');

  // Check if we have a page ID from command line
  const pageId = process.argv[2];
  
  if (!pageId) {
    console.log('HOW TO USE:');
    console.log('1. Go to any Notion page');
    console.log('2. Copy the page URL');
    console.log('3. Extract the page ID (the long string in the URL)');
    console.log('4. Run: npm run native [page-id]\n');
    
    console.log('EXAMPLE:');
    console.log('From URL: https://notion.so/My-Page-abc123def456...');
    console.log('Use: npm run native abc123def456...\n');
    
    console.log('Or create a test page and use its ID');
    return;
  }

  try {
    console.log(`Target Page ID: ${pageId}\n`);
    
    // Initialize native integration
    const integration = new NotionNativeIntegration();
    
    // Run the demo
    await integration.demonstrateNativeIntegration(pageId);
    
    console.log('\n SUCCESS! Your Notion page now contains native AI blocks!');
    console.log('Go to your Notion page to see the magic! ✨');
    
  } catch (error) {
    console.error('\nDEMO FAILED:');
    console.error('- Make sure the page ID is correct');
    console.error('- Ensure the page is shared with your Notion integration');
    console.error('- Check your API keys in .env file');
    console.error('\nError details:', error);
  }
}

if (require.main === module) {
  runNativeDemo();
}
