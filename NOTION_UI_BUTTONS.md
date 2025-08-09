# 🤖 Creating AI Buttons in Notion Interface

This guide shows you how to add AI buttons directly to Notion's interface, just like Notion AI!

##  What This Creates

Your AI assistant will appear as:
- **AI Summary** button in Notion pages
- **AI Questions** button for generating discussion questions  
- **AI Analysis** button for creating detailed analysis
- **`/gemini-ai`** slash command for quick access

## Setup Process

### Step 1: Start the Notion App Server

```bash
npm run app
```

This starts a server at `http://localhost:3000` that will handle Notion's UI interactions.

### Step 2: Create Notion Integration

1. Go to [notion.so/my-integrations](https://notion.so/my-integrations)
2. Click **"+ New integration"**
3. Fill in basic details:
   - **Name**: "Gemini AI Assistant"
   - **Description**: "AI-powered assistant using Google Gemini"
   - **Logo**: Upload an AI-related icon

### Step 3: Configure App Capabilities

In the integration settings:

**Capabilities:**
-  Read content
-  Insert content  
-  Read user information

**Content Capabilities:**
-  Read pages
-  Update page content
-  Create pages

### Step 4: Add UI Extensions (This is the key!)

**Block Actions:**
Add these buttons that will appear in Notion:

```json
{
  "id": "ai_summarize",
  "name": " AI Summary",
  "description": "Generate AI summary of this content"
}
```

```json
{
  "id": "ai_questions", 
  "name": " AI Questions",
  "description": "Generate discussion questions"
}
```

```json
{
  "id": "ai_analysis",
  "name": " AI Analysis", 
  "description": "Create detailed AI analysis"
}
```

**Slash Commands:**
```json
{
  "id": "gemini_ai",
  "name": "Gemini AI",
  "description": "Access Gemini AI features"
}
```

### Step 5: Set Webhook URLs

Configure these endpoints in your integration:

- **Actions Endpoint**: `http://localhost:3000/actions`
- **Slash Commands Endpoint**: `http://localhost:3000/slash-commands`
- **OAuth Redirect**: `http://localhost:3000/auth/callback`

### Step 6: Deploy to Production (Required for Notion Review)

For Notion to approve your integration, you need public URLs:

**Option A: Use ngrok (Quick Testing)**
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

Then update webhook URLs to use the ngrok URL (e.g., `https://abc123.ngrok.io/actions`)

**Option B: Deploy to Cloud (Production)**
Deploy to services like:
- Vercel
- Netlify Functions  
- AWS Lambda
- Railway
- Render

### Step 7: Submit for Review

1. Test your integration thoroughly
2. Submit to Notion for review
3. Wait for approval (usually 1-2 weeks)
4. Once approved, install in your workspace

### Step 8: Install & Use

1. Install the approved integration in your workspace
2. Share relevant pages with the integration
3. See AI buttons appear in Notion! ✨

##  How It Works

Once installed:

1. **In any Notion page**: Click the "📋 AI Summary" button
2. **AI processes the content**: Your Gemini AI analyzes the page
3. **Content added natively**: Summary appears as Notion blocks
4. **Slash commands**: Type `/gemini-ai` for quick access

##  Development Mode

For immediate testing without Notion review:

1. Run `npm run app` 
2. Visit `http://localhost:3000/ai-interface`
3. Test functionality using the web interface
4. Use `npm run native [page-id]` for direct integration

##  Current Limitations

- **Development**: Currently runs on localhost (not accessible to Notion)
- **Review Required**: Notion must approve the integration for UI buttons
- **OAuth**: Full OAuth flow needed for production deployment

##  Next Steps

1. **Run the app server**: `npm run app`
2. **Test locally**: Visit the AI interface  
3. **Deploy publicly**: Use ngrok or cloud deployment
4. **Create Notion integration**: Follow steps above
5. **Submit for review**: Wait for Notion approval
6. **Install & enjoy**: AI buttons in Notion! 🎉

##  Alternative: Bookmarklet (Immediate Solution)

While waiting for Notion review, create a bookmarklet for instant AI features:

```javascript
javascript:(function(){
  fetch('http://localhost:3000/actions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      action_id: 'ai_summarize',
      context: {page_id: window.location.pathname.split('/').pop()}
    })
  });
})();
```

Save this as a browser bookmark for one-click AI summaries!

---

 **Goal**: Transform your Notion workspace with native AI capabilities that feel like part of Notion itself!
