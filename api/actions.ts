import { VercelRequest, VercelResponse } from '@vercel/node';
import { NotionAppServer } from '../src/NotionAppServer';

// Store the last verification token (in memory for demo)
let lastVerificationToken: string | null = null;
let lastVerificationTime: string | null = null;

const appServer = new NotionAppServer();
const app = appServer.getApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log all incoming requests for debugging
  console.log('=== WEBHOOK REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('=====================');

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
    const token = req.body.challenge;
    lastVerificationToken = token;
    lastVerificationTime = new Date().toISOString();
    
    console.log('🔑 VERIFICATION TOKEN RECEIVED:', token);
    console.log('🕐 Time:', lastVerificationTime);
    
    return res.json({ challenge: token });
  }

  // Handle manual webhook verification with static token
  if (req.method === 'POST' && req.body?.type === 'url_verification') {
    console.log('Manual webhook verification requested');
    return res.json({ 
      challenge: req.body.challenge || 'notion_gem_verified_2025'
    });
  }

  // Handle manual verification token input
  if (req.method === 'POST' && req.body?.verification_token) {
    const expectedToken = 'notion_gem_webhook_2025';
    if (req.body.verification_token === expectedToken) {
      return res.json({ 
        verified: true, 
        message: 'Webhook verified successfully',
        token: expectedToken
      });
    } else {
      return res.status(400).json({ 
        verified: false, 
        message: 'Invalid verification token' 
      });
    }
  }

  // Handle GET request for testing and verification token
  if (req.method === 'GET') {
    // If requesting verification token
    if (req.url?.includes('verify') || req.query?.verify) {
      return res.json({ 
        last_verification_token: lastVerificationToken,
        last_verification_time: lastVerificationTime,
        webhook_url: 'https://notion-gem.vercel.app/actions',
        status: lastVerificationToken ? 'token_received' : 'waiting_for_token',
        instructions: 'Enter the verification token in Notion integration settings'
      });
    }
    
    return res.json({ 
      status: 'ok', 
      message: 'Notion AI Assistant Actions endpoint is working',
      timestamp: new Date().toISOString(),
      path: req.url,
      verification_url: 'https://notion-gem.vercel.app/actions?verify=true',
      last_token: lastVerificationToken ? `Token received at ${lastVerificationTime}` : 'No token received yet'
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
