# Notion AI Assistant - Usage Guide

## 🎯 What You Can Do Without UI Extensions

Since Notion doesn't currently allow uploading custom manifest files for UI extensions, here are the ways you can use your AI assistant:

## 🌐 Option 1: Web Interface (Easiest)

### Quick Actions Interface
Visit: **https://notion-gem.vercel.app/quick-actions**

**Features:**
- 📋 **Summarize** - Get concise summaries of content
- ❓ **Generate Questions** - Create discussion questions
- 🔍 **Analyze Content** - Detailed analysis with insights
- ✨ **Improve Content** - Enhance clarity, grammar, style
- 🎯 **Custom Analysis** - Use your own prompts

**How to Use:**
1. Enter your Notion API token (from your integration settings)
2. Either:
   - Enter a Notion Page ID for page analysis
   - Paste text content for direct analysis
3. Choose an action or create a custom prompt
4. Click to get AI-powered results

### Main Interface
Visit: **https://notion-gem.vercel.app/ai-interface.html**

## 🔗 Option 2: Direct API Calls

### AI Actions Endpoint
`POST https://notion-gem.vercel.app/api/ai-actions`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer your_notion_token
```

**Request Body Examples:**

#### Summarize a Page
```json
{
  "action": "summarize",
  "pageId": "your-page-id-here"
}
```

#### Analyze Text Content
```json
{
  "action": "analyze",
  "content": "Your text content here..."
}
```

#### Generate Discussion Questions
```json
{
  "action": "questions",
  "pageId": "your-page-id-here"
}
```

#### Custom Analysis
```json
{
  "action": "custom",
  "content": "Your content...",
  "prompt": "What are the key takeaways from this content?"
}
```

### Available Actions
- `summarize` - Generate summaries
- `questions` - Create discussion questions  
- `analyze` - Detailed content analysis
- `improve` - Enhance content quality
- `custom` - Use your own prompts

## 🤖 Option 3: Webhook Integration

Your integration automatically receives webhooks when:
- Pages are created
- Pages are updated
- Blocks are created

The webhook endpoint processes these events at:
`https://notion-gem.vercel.app/actions`

## 📝 Getting Your Page ID

1. Open your Notion page
2. Copy the URL
3. Extract the page ID (32-character string after the last `/`)

Example: 
- URL: `https://notion.so/My-Page-1234567890abcdef1234567890abcdef`
- Page ID: `1234567890abcdef1234567890abcdef`

## 🔑 Getting Your Notion Token

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Find your "Shrishti" integration
3. Copy the "Internal Integration Secret"
4. It starts with `secret_`

## 💡 Tips for Best Results

1. **For Page Analysis**: Make sure your integration has access to the page
2. **For Text Analysis**: Paste content directly for faster processing
3. **Custom Prompts**: Be specific about what you want to analyze
4. **Token Security**: Never share your API token publicly

## 🚀 Advanced Usage

### Bookmarklet (Coming Soon)
Create a browser bookmark that opens the quick actions interface with the current Notion page ID pre-filled.

### Browser Extension (Future)
A browser extension could add AI buttons directly to Notion pages.

### Notion Database Integration
Use the database analysis features to get insights from your Notion databases.

## 🆘 Troubleshooting

**"Unauthorized" Error:**
- Check your Notion token
- Ensure the integration has access to the page/database

**"Page not found" Error:**
- Verify the page ID is correct
- Make sure the page exists and is accessible

**API Timeout:**
- Large pages may take longer to process
- Try analyzing smaller sections of content

## 📞 Support

- GitHub Issues: [https://github.com/himanshu07p/notion-gem/issues](https://github.com/himanshu07p/notion-gem/issues)
- Documentation: Check the README.md in the repository
