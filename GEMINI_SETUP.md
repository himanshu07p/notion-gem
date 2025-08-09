# Quick Setup for Gemini Live Integration

## ✅ Your MCP Server is Ready!

Your Notion MCP server is built and ready to connect to Gemini Live. Here's how to set it up:

### 1. Create Environment File
Create a `.env` file with your API keys:
```bash
NOTION_API_KEY=secret_your_notion_integration_token
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Deploy to Vercel
```bash
npm run build
vercel --prod
```

### 3. Connect to Gemini Live

#### Option A: Direct MCP Connection (Recommended)
1. In Gemini Live, go to Settings > Extensions
2. Add new MCP server with your Vercel URL: `https://your-project.vercel.app/api/mcp`
3. Your Notion tools will be available for voice commands!

#### Option B: Local Testing
```bash
# Start local MCP server
npm run mcp

# Or start HTTP server for testing
npm run mcp-http
```

## 🎯 Available Voice Commands in Gemini Live

Once connected, you can say things like:
- "Read my Notion page about project planning"
- "Search my Notion for meeting notes from last week"
- "Create a new page in Notion for my ideas"
- "Update my tasks database with new items"
- "Analyze the content in my research database"

## 🔧 Your Tools
- ✅ notion_read_page - Read any page
- ✅ notion_search - Search your workspace  
- ✅ notion_create_page - Create new pages
- ✅ notion_update_page - Update content
- ✅ notion_read_database - Read database entries
- ✅ notion_query_database - Query with filters
- ✅ notion_create_database_entry - Add entries
- ✅ notion_update_database_entry - Update entries
- ✅ notion_analyze_content - AI content analysis

Your setup is complete! 🚀
