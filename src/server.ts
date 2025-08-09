import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { NotionClient } from './services/NotionClient';
import { GeminiClient } from './services/GeminiClient';
import { NotionAIAssistant } from './assistant/NotionAIAssistant';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://notion.so', 'https://www.notion.so', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize AI Assistant
let assistant: NotionAIAssistant;

async function initializeAssistant() {
  try {
    const notionClient = new NotionClient(process.env.NOTION_API_KEY!);
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
    assistant = new NotionAIAssistant(notionClient, geminiClient);
    console.log('🤖 AI Assistant initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize AI Assistant:', error);
    process.exit(1);
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes

// Summarize a page
app.post('/api/summarize', async (req, res) => {
  try {
    const { pageId } = req.body;
    
    if (!pageId) {
      return res.status(400).json({ error: 'Page ID is required' });
    }
    
    const summary = await assistant.summarizePage(pageId);
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error summarizing page:', error);
    res.status(500).json({ 
      error: 'Failed to summarize page',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Analyze a database
app.post('/api/analyze-database', async (req, res) => {
  try {
    const { databaseId } = req.body;
    
    if (!databaseId) {
      return res.status(400).json({ error: 'Database ID is required' });
    }
    
    const analysis = await assistant.analyzeDatabase(databaseId);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error analyzing database:', error);
    res.status(500).json({ 
      error: 'Failed to analyze database',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate content suggestions
app.post('/api/content-suggestions', async (req, res) => {
  try {
    const { topic, requirements } = req.body;
    
    if (!topic || !requirements) {
      return res.status(400).json({ error: 'Topic and requirements are required' });
    }
    
    const suggestions = await assistant.generateContentSuggestions(topic, requirements);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error generating content suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to generate content suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Improve page content
app.post('/api/improve-content', async (req, res) => {
  try {
    const { pageId, improvementType = 'clarity' } = req.body;
    
    if (!pageId) {
      return res.status(400).json({ error: 'Page ID is required' });
    }
    
    const improvedContent = await assistant.improvePageContent(pageId, improvementType);
    res.json({ success: true, improvedContent });
  } catch (error) {
    console.error('Error improving content:', error);
    res.status(500).json({ 
      error: 'Failed to improve content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate questions
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { pageId, questionType = 'review' } = req.body;
    
    if (!pageId) {
      return res.status(400).json({ error: 'Page ID is required' });
    }
    
    const questions = await assistant.generateQuestionsForPage(pageId, questionType);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Extract key information
app.post('/api/extract-info', async (req, res) => {
  try {
    const { pageId } = req.body;
    
    if (!pageId) {
      return res.status(400).json({ error: 'Page ID is required' });
    }
    
    const keyInfo = await assistant.extractKeyInfoFromPage(pageId);
    res.json({ success: true, keyInfo });
  } catch (error) {
    console.error('Error extracting key information:', error);
    res.status(500).json({ 
      error: 'Failed to extract key information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search and analyze
app.post('/api/search-analyze', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const analysis = await assistant.searchAndAnalyze(query);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error searching and analyzing:', error);
    res.status(500).json({ 
      error: 'Failed to search and analyze',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get page ID from URL (helper endpoint)
app.post('/api/extract-page-id', (req, res) => {
  try {
    const { notionUrl } = req.body;
    
    if (!notionUrl) {
      return res.status(400).json({ error: 'Notion URL is required' });
    }
    
    // Extract page ID from Notion URL
    const match = notionUrl.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
    
    if (!match) {
      return res.status(400).json({ error: 'Invalid Notion URL format' });
    }
    
    const pageId = match[0].replace(/-/g, '');
    res.json({ success: true, pageId });
  } catch (error) {
    console.error('Error extracting page ID:', error);
    res.status(500).json({ 
      error: 'Failed to extract page ID',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  await initializeAssistant();
  
  app.listen(PORT, () => {
    console.log(`🚀 Notion AI Assistant Server running on http://localhost:${PORT}`);
    console.log(`📱 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 Embed in Notion: http://localhost:${PORT}/embed`);
  });
}

if (require.main === module) {
  startServer().catch(console.error);
}

export default app;
