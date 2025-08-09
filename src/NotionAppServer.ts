import express from 'express';
import cors from 'cors';
import { NotionNativeIntegration } from './NotionNativeIntegration';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Notion App Server - Handles UI extension callbacks from Notion
 * This creates the AI button interface within Notion itself
 */
class NotionAppServer {
  private app: express.Application;
  private integration: NotionNativeIntegration;

  constructor() {
    this.app = express();
    this.integration = new NotionNativeIntegration();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  // Expose the Express app for serverless hosting (e.g., Vercel)
  public getApp(): express.Application {
    return this.app;
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Notion AI App Server is running' });
    });

    // Webhook verification endpoint
    this.app.post('/webhook/verify', (req, res) => {
      const { challenge } = req.body;
      if (challenge) {
        console.log('Webhook verification challenge:', challenge);
        res.json({ challenge });
      } else {
        res.status(400).json({ error: 'No challenge provided' });
      }
    });

    // OAuth callback for Notion App authentication
    this.app.post('/auth/callback', (req, res) => {
      // Handle OAuth flow completion
      console.log('OAuth callback received:', req.body);
      res.json({ success: true });
    });

    // Test endpoint for actions (GET)
    this.app.get('/actions', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'Actions endpoint is working',
        timestamp: new Date().toISOString() 
      });
    });

    // Handle UI extension actions (when user clicks AI buttons)
    this.app.post('/actions', async (req, res) => {
      try {
        // Handle webhook verification challenge
        if (req.body.challenge) {
          console.log('Webhook verification challenge received');
          return res.json({ challenge: req.body.challenge });
        }

        const { action_id, context } = req.body;
        console.log(`AI Action triggered: ${action_id}`);
        
        const pageId = context.page_id || context.block_id;
        
        switch (action_id) {
          case 'ai_summarize':
            await this.integration.addAISummaryToPage(pageId);
            res.json({ 
              success: true, 
              message: 'AI summary added to your page' 
            });
            break;
            
          case 'ai_questions':
            await this.integration.addQuestionsToPage(pageId);
            res.json({ 
              success: true, 
              message: 'AI questions added to your page' 
            });
            break;
            
          case 'ai_analysis':
            const analysisPageId = await this.integration.createAnalysisPage(pageId);
            res.json({ 
              success: true, 
              message: 'AI analysis sub-page created',
              analysis_page_id: analysisPageId
            });
            break;
            
          default:
            res.status(400).json({ error: 'Unknown action' });
        }
      } catch (error) {
        console.error('Action error:', error);
        res.status(500).json({ error: 'Failed to process AI action' });
      }
    });

    // Handle slash commands
    this.app.post('/slash-commands', async (req, res) => {
      try {
        const { command_id, context, args } = req.body;
        console.log(`Slash command: /${command_id}`);
        
        if (command_id === 'gemini_ai') {
          const pageId = context.page_id;
          
          // Show AI options menu
          res.json({
            success: true,
            response_type: 'modal',
            modal: {
              title: 'Gemini AI Assistant',
              blocks: [
                {
                  type: 'section',
                  text: 'Choose an AI action for this content:'
                },
                {
                  type: 'actions',
                  elements: [
                    {
                      type: 'button',
                      text: 'Summarize',
                      action_id: 'ai_summarize'
                    },
                    {
                      type: 'button', 
                      text: 'Generate Questions',
                      action_id: 'ai_questions'
                    },
                    {
                      type: 'button',
                      text: 'Full Analysis', 
                      action_id: 'ai_analysis'
                    }
                  ]
                }
              ]
            }
          });
        } else {
          res.status(400).json({ error: 'Unknown command' });
        }
      } catch (error) {
        console.error('Slash command error:', error);
        res.status(500).json({ error: 'Failed to process command' });
      }
    });

    // General webhook handler for all Notion events
    this.app.post('/webhook', (req, res) => {
      // Handle webhook verification challenge
      if (req.body.challenge) {
        console.log('Webhook verification challenge received:', req.body.challenge);
        return res.json({ challenge: req.body.challenge });
      }

      // Handle actual webhook events
      console.log('Webhook event received:', req.body);
      res.json({ success: true });
    });

    // Serve the AI interface
    this.app.get('/ai-interface', (req, res) => {
      res.sendFile('ai-interface.html', { root: './public' });
    });
  }

  public start(port: number = 3000): void {
    this.app.listen(port, () => {
      console.log(`
NOTION AI APP SERVER
====================
Server: http://localhost:${port}
AI Interface: http://localhost:${port}/ai-interface
Ready to receive Notion UI interactions

Next Steps:
1. Submit your app to Notion for review
2. Install the app in your workspace
3. See AI buttons appear in Notion
      `);
    });
  }
}

// Start the Notion App Server
if (require.main === module) {
  const server = new NotionAppServer();
  server.start();
}

export { NotionAppServer };
