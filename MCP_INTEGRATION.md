# Notion MCP Integration Guide

## What is MCP?

**Model Context Protocol (MCP)** is a new standard that allows AI tools to connect directly to external services like Notion. Instead of creating custom integrations, you can use MCP to give AI tools live access to your Notion workspace.

## What This Provides

Your Gemini AI assistant becomes available to **any MCP-compatible AI tool** with these capabilities:

### Available AI Tools:
- **`summarize_notion_page`** - Generate AI summaries of any Notion page
- **`generate_discussion_questions`** - Create study/review questions
- **`analyze_database`** - Analyze Notion databases with AI
- **`extract_key_information`** - Extract key insights from pages
- **`improve_page_content`** - Get content enhancement suggestions
- **`add_ai_summary_block`** - Add AI content directly to pages
- **`search_and_analyze`** - Search and analyze your workspace

## Quick Start

### 1. Start Your MCP Server
```bash
npm run mcp
```

This starts your MCP server at `http://localhost:3001`

### 2. Test the Connection
Visit `http://localhost:3001` to see available tools and connection info.

### 3. Connect from AI Tools

#### **For AI Tools with MCP Support:**

**Connection URL:** `http://localhost:3001/mcp`

**Configuration:**
```json
{
  "mcpServers": {
    "notion-gemini": {
      "url": "http://localhost:3001/mcp",
      "type": "http"
    }
  }
}
```

#### **For Claude Desktop (Anthropic):**
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "notion-gemini": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "http://localhost:3001/mcp/call",
        "-H", "Content-Type: application/json",
        "-d"
      ]
    }
  }
}
```

#### **For Cursor/Other IDEs:**
1. Go to Settings → MCP Servers
2. Add new server: `http://localhost:3001/mcp`
3. Save and restart

## Using Notion's Official MCP

Notion now provides official MCP support! Here's how to use it alongside your custom Gemini tools:

### Option 1: Use Notion's MCP + Your Custom Tools

**Notion MCP (Official):**
```json
{
  "mcpServers": {
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    },
    "notion-gemini": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

This gives you:
- **Notion MCP**: Read/write access to your Notion workspace
- **Your Gemini MCP**: AI analysis and enhancement tools

### Option 2: Connect Through Notion App

1. Open **Notion Settings**
2. Go to **Connections → Notion MCP**
3. Choose your AI tool (Claude, Cursor, etc.)
4. Complete OAuth flow

## How to Use in AI Tools

Once connected, you can ask your AI assistant:

### **Examples:**

*"Summarize my Quantum Mechanics page"*
```
AI uses: summarize_notion_page
Result: Intelligent summary of your page content
```

*"Generate study questions for page [page-id]"*
```
AI uses: generate_discussion_questions  
Result: Thought-provoking questions for review
```

*"Analyze my project database and find patterns"*
```
AI uses: analyze_database
Result: AI insights about your database content
```

*"Add an AI summary block to my page"*
```
AI uses: add_ai_summary_block
Result: Summary added directly to your Notion page
```

## Production Deployment

### For Public Access (AI tools outside your network):

**1. Deploy to Cloud:**
```bash
# Example: Railway
railway login
railway init
railway up

# Example: Render  
# Connect GitHub repo, auto-deploy
```

**2. Update Connection URLs:**
Replace `localhost:3001` with your public URL:
```json
{
  "mcpServers": {
    "notion-gemini": {
      "url": "https://your-app.railway.app/mcp"
    }
  }
}
```

### Environment Variables:
```bash
NOTION_API_KEY=your_notion_integration_token
GEMINI_API_KEY=your_google_ai_studio_key
PORT=3001
```

## Security Best Practices

1. **API Keys**: Never commit API keys to git
2. **CORS**: Configure appropriate CORS origins for production
3. **Rate Limiting**: Add rate limiting for public deployments
4. **Authentication**: Consider adding authentication for production use

## Integration Workflows

### **Scenario 1: AI-Powered Content Creation**
1. Create new Notion page
2. Ask AI: *"Generate content about [topic] and add it to my page"*
3. AI creates comprehensive content with summaries, questions, and analysis

### **Scenario 2: Study Assistant**
1. AI reads your study notes
2. Generates questions and key points
3. Creates study guides automatically

### **Scenario 3: Database Intelligence**
1. AI analyzes your project database
2. Identifies patterns and insights
3. Suggests improvements and next steps

## Testing & Debugging

### Test Individual Tools:
```bash
# Test summary tool
curl -X POST http://localhost:3001/mcp/tools/summarize_notion_page \
  -H "Content-Type: application/json" \
  -d '{"pageId": "your-page-id"}'

# Test questions tool
curl -X POST http://localhost:3001/mcp/tools/generate_discussion_questions \
  -H "Content-Type: application/json" \
  -d '{"pageId": "your-page-id"}'
```

### Check Server Status:
```bash
curl http://localhost:3001/health
```

### View Available Tools:
```bash
curl http://localhost:3001/mcp/tools
```

## Next Steps

1. **Start MCP Server**: `npm run mcp`
2. **Connect AI Tool**: Use connection URL in your AI tool
3. **Test Integration**: Ask AI to summarize a Notion page
4. **Deploy for Production**: Use cloud deployment for persistent access
5. **Expand Functionality**: Add more custom AI tools as needed

## Pro Tips

- **Page IDs**: Get Notion page IDs from URL or use search functionality
- **Permissions**: Ensure your Notion integration has access to relevant pages
- **Error Handling**: Check logs if tools fail - usually permission issues
- **Performance**: MCP calls are live - response time depends on content size

---

**Result**: Your AI tools now have direct, live access to your Notion workspace with custom Gemini-powered analysis capabilities!
