import express from 'express';
import cors from 'cors';
import NotionMCPServer from './NotionMCPServer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * HTTP server that exposes MCP functionality via REST API
 * This allows AI tools to connect to your Notion assistant via HTTP
 */
class MCPHttpServer {
  private app: express.Application;
  private mcpServer: NotionMCPServer;

  constructor() {
    this.app = express();
    this.mcpServer = new NotionMCPServer();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: ['https://mcp.notion.com', 'http://localhost:*'],
      credentials: true
    }));
    this.app.use(express.json());
  }

  // Expose the Express app for serverless hosting (e.g., Vercel)
  public getApp(): express.Application {
    return this.app;
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'Notion Gemini MCP Server is running',
        server: 'notion-gemini-assistant',
        version: '1.0.0'
      });
    });

    // MCP capabilities endpoint
    this.app.get('/mcp/capabilities', (req, res) => {
      res.json({
        capabilities: {
          tools: true,
          prompts: false,
          resources: false
        },
        implementation: {
          name: 'notion-gemini-assistant',
          version: '1.0.0'
        }
      });
    });

    // List available tools
    this.app.get('/mcp/tools', (req, res) => {
      try {
        const tools = this.mcpServer.getTools();
        res.json(tools);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get tools' });
      }
    });

    // Execute tool
    this.app.post('/mcp/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const args = req.body;
        
        console.log(`Executing tool: ${toolName} with args:`, args);
        
        const result = await this.mcpServer.handleToolCall(toolName, args);
        res.json(result);
      } catch (error) {
        console.error('Tool execution error:', error);
        res.status(500).json({ 
          error: 'Tool execution failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // MCP-style tool call endpoint (for compatibility)
    this.app.post('/mcp/call', async (req, res) => {
      try {
        const { method, params } = req.body;
        
        if (method === 'tools/list') {
          const tools = this.mcpServer.getTools();
          res.json({ result: tools });
          return;
        }
        
        if (method === 'tools/call') {
          const { name, arguments: args } = params;
          const result = await this.mcpServer.handleToolCall(name, args);
          res.json({ result });
          return;
        }
        
        res.status(400).json({ error: 'Unknown method' });
      } catch (error) {
        console.error('MCP call error:', error);
        res.status(500).json({ 
          error: 'MCP call failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Serve documentation
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Notion Gemini MCP Server',
        description: 'AI assistant for Notion using Google Gemini via Model Context Protocol',
        endpoints: {
          health: '/health',
          capabilities: '/mcp/capabilities',
          tools: '/mcp/tools',
          execute: '/mcp/tools/:toolName',
          call: '/mcp/call'
        },
        usage: {
          'List tools': 'GET /mcp/tools',
          'Execute tool': 'POST /mcp/tools/summarize_notion_page {"pageId": "your-page-id"}',
          'MCP call': 'POST /mcp/call {"method": "tools/call", "params": {"name": "summarize_notion_page", "arguments": {"pageId": "your-page-id"}}}'
        },
        mcp_config: {
          url: `http://localhost:${process.env.PORT || 3001}/mcp`,
          type: 'http'
        }
      });
    });
  }

  public start(port: number = 3001): void {
    this.app.listen(port, () => {
      console.log(`
NOTION GEMINI MCP SERVER
========================
Server: http://localhost:${port}
Health: http://localhost:${port}/health
Tools: http://localhost:${port}/mcp/tools
Documentation: http://localhost:${port}

MCP Connection:
HTTP Endpoint: http://localhost:${port}/mcp
Call Endpoint: http://localhost:${port}/mcp/call

Integration Instructions:
1. Add server URL: http://localhost:${port}/mcp
2. Use tools to interact with Notion content
3. AI can now access your Notion workspace

Available AI Tools:
- summarize_notion_page: Generate AI summaries
- generate_discussion_questions: Create study questions  
- analyze_database: Analyze Notion databases
- extract_key_information: Extract key insights
- improve_page_content: Enhance content quality
- add_ai_summary_block: Add AI blocks to pages
- search_and_analyze: Search and analyze content
      `);
    });
  }
}

// Start the server
if (require.main === module) {
  const server = new MCPHttpServer();
  const port = parseInt(process.env.MCP_PORT || '3001');
  server.start(port);
}

export { MCPHttpServer };
