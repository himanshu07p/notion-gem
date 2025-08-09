import { NotionAIAssistant } from './assistant/NotionAIAssistant';
import { NotionClient } from './services/NotionClient';
import { GeminiClient } from './services/GeminiClient';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Lightweight MCP-compatible server for Notion Gemini AI
 * This creates a simple HTTP server that can be used with MCP clients
 */
class NotionMCPServer {
  private assistant: NotionAIAssistant;

  constructor() {
    const notionClient = new NotionClient(process.env.NOTION_API_KEY!);
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
    this.assistant = new NotionAIAssistant(notionClient, geminiClient);
  }

  /**
   * Handle MCP tool calls via HTTP
   */
  async handleToolCall(toolName: string, args: any): Promise<any> {
    try {
      switch (toolName) {
        case 'summarize_notion_page': {
          const { pageId } = args;
          const summary = await this.assistant.summarizePage(pageId);
          return {
            content: [
              {
                type: 'text',
                text: `AI Summary:\n\n${summary}`,
              },
            ],
          };
        }

        case 'generate_discussion_questions': {
          const { pageId } = args;
          const questions = await this.assistant.generateQuestionsForPage(pageId);
          return {
            content: [
              {
                type: 'text',
                text: `Discussion Questions:\n\n${questions}`,
              },
            ],
          };
        }

        case 'analyze_database': {
          const { databaseId } = args;
          const analysis = await this.assistant.analyzeDatabase(databaseId);
          return {
            content: [
              {
                type: 'text',
                text: `Database Analysis:\n\n${analysis}`,
              },
            ],
          };
        }

        case 'extract_key_information': {
          const { pageId } = args;
          const keyInfo = await this.assistant.extractKeyInfoFromPage(pageId);
          return {
            content: [
              {
                type: 'text',
                text: `Key Information:\n\n${keyInfo}`,
              },
            ],
          };
        }

        case 'improve_page_content': {
          const { pageId, improvementType = 'clarity' } = args;
          const suggestions = await this.assistant.improvePageContent(pageId, improvementType);
          return {
            content: [
              {
                type: 'text',
                text: `Content Improvement Suggestions:\n\n${suggestions}`,
              },
            ],
          };
        }

        case 'add_ai_summary_block': {
          const { pageId } = args;
          const { NotionNativeIntegration } = await import('./NotionNativeIntegration');
          const integration = new NotionNativeIntegration();
          await integration.addAISummaryToPage(pageId);
          return {
            content: [
              {
                type: 'text',
                text: `AI summary has been added directly to your Notion page as a native block!`,
              },
            ],
          };
        }

        case 'search_and_analyze': {
          const { query } = args;
          const results = await this.assistant.searchAndAnalyze(query);
          return {
            content: [
              {
                type: 'text',
                text: `Search & Analysis Results:\n\n${results}`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Get available tools for MCP clients
   */
  getTools() {
    return {
      tools: [
        {
          name: 'summarize_notion_page',
          description: 'Generate an AI summary of a Notion page using Google Gemini',
          inputSchema: {
            type: 'object',
            properties: {
              pageId: {
                type: 'string',
                description: 'The Notion page ID to summarize',
              },
            },
            required: ['pageId'],
          },
        },
        {
          name: 'generate_discussion_questions',
          description: 'Generate discussion questions for a Notion page',
          inputSchema: {
            type: 'object',
            properties: {
              pageId: {
                type: 'string',
                description: 'The Notion page ID to generate questions for',
              },
            },
            required: ['pageId'],
          },
        },
        {
          name: 'analyze_database',
          description: 'Perform AI analysis of a Notion database',
          inputSchema: {
            type: 'object',
            properties: {
              databaseId: {
                type: 'string',
                description: 'The Notion database ID to analyze',
              },
            },
            required: ['databaseId'],
          },
        },
        {
          name: 'extract_key_information',
          description: 'Extract key information from a Notion page',
          inputSchema: {
            type: 'object',
            properties: {
              pageId: {
                type: 'string',
                description: 'The Notion page ID to extract information from',
              },
            },
            required: ['pageId'],
          },
        },
        {
          name: 'improve_page_content',
          description: 'Generate suggestions to improve Notion page content',
          inputSchema: {
            type: 'object',
            properties: {
              pageId: {
                type: 'string',
                description: 'The Notion page ID to improve',
              },
              improvementType: {
                type: 'string',
                enum: ['clarity', 'grammar', 'style', 'conciseness'],
                description: 'Type of improvement to focus on',
                default: 'clarity',
              },
            },
            required: ['pageId'],
          },
        },
        {
          name: 'add_ai_summary_block',
          description: 'Add an AI summary directly to a Notion page as a native block',
          inputSchema: {
            type: 'object',
            properties: {
              pageId: {
                type: 'string',
                description: 'The Notion page ID to add summary to',
              },
            },
            required: ['pageId'],
          },
        },
        {
          name: 'search_and_analyze',
          description: 'Search Notion workspace and analyze results',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for Notion content',
              },
            },
            required: ['query'],
          },
        },
      ],
    };
  }
}

export { NotionMCPServer };
