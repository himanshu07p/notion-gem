# 🤖 Connect Notion to Gemini Live - Setup Guide

## 🎯 What This Does

This connects your Notion workspace directly to Gemini Live, allowing you to:
- **Read** any Notion page by voice/chat
- **Search** across all your Notion content
- **Create** new pages with content
- **Update** page titles and properties
- **Analyze** content with AI summaries and insights
- **Query** databases and get results

## 🚀 Quick Setup (3 Steps)

### Step 1: Start the MCP Server
```bash
# In your project directory
npm run dev
```

### Step 2: Configure Environment Variables
Make sure your `.env` file has:
```
NOTION_API_KEY=secret_your_notion_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Connect to Gemini Live
1. Open Gemini Live or Gemini Pro
2. Configure the Model Context Protocol (MCP) connection:
   - **Server URL**: `http://localhost:3001`
   - **Tools Endpoint**: `http://localhost:3001/tools`

## 🎤 Voice Commands You Can Use

Once connected, you can say things like:

### 📖 Reading Content
- *"Read the content from page ID abc123..."*
- *"What's in my meeting notes page?"*
- *"Show me the latest project update"*

### 🔍 Searching
- *"Search for all pages about AI projects"*
- *"Find my notes on machine learning"*
- *"Show me databases related to tasks"*

### ✍️ Creating & Editing
- *"Create a new page called 'Project Roadmap' with bullet points about our goals"*
- *"Update the title of page xyz to 'Completed Project'"*
- *"Add content about quarterly objectives to my planning page"*

### 🧠 AI Analysis
- *"Summarize my project status page"*
- *"Generate discussion questions for my research notes"*
- *"Analyze the key information in my meeting minutes"*

## 🔧 Technical Details

### Available Tools for Gemini:
1. `notion_read_page` - Read any page content
2. `notion_search` - Search across workspace
3. `notion_create_page` - Create new pages
4. `notion_update_page` - Update existing pages
5. `notion_list_databases` - List all databases
6. `notion_query_database` - Query database entries
7. `notion_ai_summarize` - AI page summaries
8. `notion_ai_analyze` - Detailed AI analysis
9. `notion_get_page_url` - Get page URLs

### Server Endpoints:
- **Health Check**: `GET http://localhost:3001/health`
- **Available Tools**: `GET http://localhost:3001/tools`
- **Execute Tool**: `POST http://localhost:3001/tools/{toolName}`

## 🌐 Cloud Deployment (Optional)

To use this from anywhere (not just localhost):

### Deploy to Vercel:
```bash
git add . && git commit -m "Add MCP server"
git push
```

The MCP server will be available at:
`https://your-app.vercel.app/api/mcp`

### Update Gemini Connection:
Change server URL to: `https://your-app.vercel.app/api/mcp`

## 🛠️ Testing the Connection

### Test 1: Check Server Health
```bash
curl http://localhost:3001/health
```

### Test 2: List Available Tools
```bash
curl http://localhost:3001/tools
```

### Test 3: Read a Page (replace with your page ID)
```bash
curl -X POST http://localhost:3001/tools/notion_read_page \
  -H "Content-Type: application/json" \
  -d '{"pageId": "your-page-id-here"}'
```

## 🔑 Getting Page IDs

From any Notion page URL:
- URL: `https://notion.so/My-Page-1234567890abcdef1234567890abcdef`
- Page ID: `1234567890abcdef1234567890abcdef`

Or tell Gemini: *"Search for pages about [topic]"* to get page IDs.

## ✅ Verification

Once connected, ask Gemini:
- *"List my Notion databases"*
- *"Search for recent pages"*
- *"What tools do you have for Notion?"*

If Gemini can respond with Notion-specific information, your connection is working!

## 🆘 Troubleshooting

**Connection Issues:**
- Ensure the server is running (`npm run dev`)
- Check that port 3001 is not blocked
- Verify environment variables are set

**Authentication Errors:**
- Double-check your Notion API token
- Ensure the integration has access to your pages

**Tool Errors:**
- Verify page IDs are correct (32 characters, no dashes)
- Check that pages exist and are accessible

## 🎉 Ready!

Your Notion workspace is now voice-controllable through Gemini Live! Start by asking Gemini to search your Notion content or read a specific page.
