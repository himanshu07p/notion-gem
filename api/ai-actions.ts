import { VercelRequest, VercelResponse } from '@vercel/node';
import { NotionAIAssistant } from '../src/assistant/NotionAIAssistant';
import { NotionClient } from '../src/services/NotionClient';
import { GeminiClient } from '../src/services/GeminiClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, pageId, content, prompt } = req.body;
    const notionToken = req.headers.authorization?.replace('Bearer ', '') || process.env.NOTION_TOKEN;
    
    if (!notionToken) {
      return res.status(401).json({ error: 'Notion token required' });
    }

    const notionClient = new NotionClient(notionToken);
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
    const assistant = new NotionAIAssistant(notionClient, geminiClient);

    let result;
    
    switch (action) {
      case 'summarize':
        if (pageId) {
          result = await assistant.summarizePage(pageId);
        } else if (content) {
          result = await geminiClient.summarizeText(content);
        } else {
          return res.status(400).json({ error: 'Page ID or content required for summarization' });
        }
        break;
        
      case 'questions':
        if (pageId) {
          result = await assistant.generateQuestionsForPage(pageId, 'discussion');
        } else if (content) {
          result = await geminiClient.generateQuestions(content, 'discussion');
        } else {
          return res.status(400).json({ error: 'Page ID or content required for question generation' });
        }
        break;
        
      case 'analyze':
        if (pageId) {
          result = await assistant.extractKeyInfoFromPage(pageId);
        } else if (content) {
          result = await geminiClient.analyzeContent(content, 'Provide a detailed analysis including key themes, insights, and recommendations');
        } else {
          return res.status(400).json({ error: 'Page ID or content required for analysis' });
        }
        break;
        
      case 'improve':
        if (!pageId) {
          return res.status(400).json({ error: 'Page ID required for content improvement' });
        }
        const improvementType = req.body.improvementType || 'clarity';
        result = await assistant.improvePageContent(pageId, improvementType);
        break;
        
      case 'custom':
        if (!prompt) {
          return res.status(400).json({ error: 'Prompt required for custom analysis' });
        }
        if (pageId) {
          // Get page content first, then analyze with custom prompt
          const pageContent = await notionClient.getPageContent(pageId);
          const textContent = JSON.stringify(pageContent); // Simple fallback
          result = await geminiClient.generateText(`${prompt}\n\nContent:\n${textContent}`);
        } else if (content) {
          result = await geminiClient.generateText(`${prompt}\n\nContent:\n${content}`);
        } else {
          return res.status(400).json({ error: 'Page ID or content required for custom analysis' });
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action. Supported actions: summarize, questions, analyze, custom' });
    }

    res.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Actions error:', error);
    res.status(500).json({
      error: 'Failed to process AI action',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
