import { VercelRequest, VercelResponse } from '@vercel/node';
import { NotionAppServer } from '../src/NotionAppServer';

const appServer = new NotionAppServer();
const app = appServer.getApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle webhook verification challenge
  if (req.method === 'POST' && req.body?.challenge) {
    console.log('Webhook verification challenge received:', req.body.challenge);
    return res.json({ challenge: req.body.challenge });
  }

  // Handle GET request for testing
  if (req.method === 'GET') {
    return res.json({ 
      status: 'ok', 
      message: 'Notion AI Assistant Actions endpoint is working',
      timestamp: new Date().toISOString(),
      path: req.url
    });
  }

  // Handle POST actions
  if (req.method === 'POST') {
    try {
      const { action_id, context } = req.body;
      console.log(`AI Action triggered: ${action_id}`);
      
      // Import the integration class
      const { NotionNativeIntegration } = await import('../src/NotionNativeIntegration');
      const integration = new NotionNativeIntegration();
      
      const pageId = context?.page_id || context?.block_id;
      
      switch (action_id) {
        case 'ai_summarize':
          await integration.addAISummaryToPage(pageId);
          return res.json({ 
            success: true, 
            message: 'AI summary added to your page' 
          });
          
        case 'ai_questions':
          await integration.addQuestionsToPage(pageId);
          return res.json({ 
            success: true, 
            message: 'AI questions added to your page' 
          });
          
        case 'ai_analysis':
          const analysisPageId = await integration.createAnalysisPage(pageId);
          return res.json({ 
            success: true, 
            message: 'AI analysis sub-page created',
            analysis_page_id: analysisPageId
          });
          
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Action error:', error);
      return res.status(500).json({ error: 'Failed to process AI action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
