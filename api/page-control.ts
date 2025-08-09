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
    const { command, pageId, databaseId, context } = req.body;
    const notionToken = req.headers.authorization?.replace('Bearer ', '') || process.env.NOTION_TOKEN;
    
    if (!notionToken) {
      return res.status(401).json({ error: 'Notion token required' });
    }

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const notionClient = new NotionClient(notionToken);
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
    const assistant = new NotionAIAssistant(notionClient, geminiClient);

    let result;
    
    // Use Gemini to interpret the command and determine the action
    const actionPrompt = `
You are a Notion page controller. Analyze this command and determine what action to take:

Command: "${command}"
${pageId ? `Page ID: ${pageId}` : ''}
${databaseId ? `Database ID: ${databaseId}` : ''}
${context ? `Additional context: ${context}` : ''}

Respond with ONLY a JSON object in this format:
{
  "action": "read|create|update|search|analyze|generate",
  "target": "page|database|content",
  "details": "specific description of what to do",
  "content_type": "text|title|property|blocks"
}

Examples:
- "Read this page" → {"action": "read", "target": "page", "details": "retrieve page content", "content_type": "blocks"}
- "Update the title to 'New Title'" → {"action": "update", "target": "page", "details": "change title to 'New Title'", "content_type": "title"}
- "Add a paragraph about AI" → {"action": "update", "target": "content", "details": "add paragraph about AI", "content_type": "blocks"}
- "Create a new page about machine learning" → {"action": "create", "target": "page", "details": "create page about machine learning", "content_type": "blocks"}
- "Search for pages about AI" → {"action": "search", "target": "page", "details": "find pages related to AI", "content_type": "text"}
`;

    const actionResponse = await geminiClient.generateText(actionPrompt);
    
    try {
      // Parse the Gemini response to get the action
      const actionData = JSON.parse(actionResponse.replace(/```json\n?|\n?```/g, '').trim());
      
      switch (actionData.action) {
        case 'read':
          if (pageId) {
            if (actionData.target === 'page') {
              const page = await notionClient.getPage(pageId);
              const blocks = await notionClient.getPageContent(pageId);
              result = {
                action: 'read_page',
                page_info: page,
                content: blocks,
                summary: await assistant.summarizePage(pageId)
              };
            }
          } else if (databaseId) {
            const database = await notionClient.getDatabase(databaseId);
            const entries = await notionClient.queryDatabase(databaseId);
            result = {
              action: 'read_database',
              database_info: database,
              entries: entries.results,
              analysis: await assistant.analyzeDatabase(databaseId)
            };
          } else {
            return res.status(400).json({ error: 'Page ID or Database ID required for read operations' });
          }
          break;

        case 'create':
          if (actionData.target === 'page') {
            // Generate content using Gemini based on the details
            const contentPrompt = `Create Notion page content for: ${actionData.details}. 
            
            Respond with a JSON object containing:
            {
              "title": "Page title",
              "content": [
                {"type": "paragraph", "text": "First paragraph..."},
                {"type": "heading_2", "text": "Section heading"},
                {"type": "paragraph", "text": "Another paragraph..."},
                {"type": "bulleted_list_item", "text": "List item"}
              ]
            }`;
            
            const contentResponse = await geminiClient.generateText(contentPrompt);
            const contentData = JSON.parse(contentResponse.replace(/```json\n?|\n?```/g, '').trim());
            
            // Convert to Notion format and create page
            const pageProperties = {
              parent: databaseId ? { database_id: databaseId } : { page_id: pageId || 'root' },
              properties: {
                title: {
                  title: [{ text: { content: contentData.title } }]
                }
              },
              children: contentData.content.map((block: any) => ({
                object: 'block',
                type: block.type,
                [block.type]: {
                  rich_text: [{ text: { content: block.text } }]
                }
              }))
            };
            
            const newPage = await notionClient.createPage(pageProperties);
            result = {
              action: 'created_page',
              page: newPage,
              message: `Successfully created page: "${contentData.title}"`
            };
          }
          break;

        case 'update':
          if (!pageId) {
            return res.status(400).json({ error: 'Page ID required for update operations' });
          }
          
          if (actionData.content_type === 'title') {
            // Update page title
            const titleMatch = actionData.details.match(/title to ['"](.*?)['"]/) || 
                              actionData.details.match(/title: ['"](.*?)['"]/) ||
                              actionData.details.match(/called ['"](.*?)['"]/) ||
                              actionData.details.match(/named ['"](.*?)['"]/)
            
            if (titleMatch) {
              const newTitle = titleMatch[1];
              const updatedPage = await notionClient.updatePage(pageId, {
                properties: {
                  title: {
                    title: [{ text: { content: newTitle } }]
                  }
                }
              });
              result = {
                action: 'updated_title',
                page: updatedPage,
                message: `Updated page title to: "${newTitle}"`
              };
            } else {
              result = { error: 'Could not extract new title from command' };
            }
          } else if (actionData.content_type === 'blocks') {
            // Add content to page
            const contentPrompt = `Generate content to add to a Notion page based on: ${actionData.details}
            
            Create 1-3 blocks of content. Respond with JSON array:
            [
              {"type": "paragraph", "text": "Your content here..."},
              {"type": "heading_3", "text": "Optional heading"},
              {"type": "bulleted_list_item", "text": "Optional list item"}
            ]`;
            
            const contentResponse = await geminiClient.generateText(contentPrompt);
            const contentBlocks = JSON.parse(contentResponse.replace(/```json\n?|\n?```/g, '').trim());
            
            // Add blocks to page (Note: This requires the blocks API)
            result = {
              action: 'generated_content',
              content: contentBlocks,
              message: 'Content generated. Manual addition to page required due to API limitations.',
              suggestion: 'Copy the generated content and paste it into your Notion page.'
            };
          }
          break;

        case 'search':
          const searchResults = await notionClient.search(command);
          result = {
            action: 'search_results',
            results: searchResults,
            message: `Found ${searchResults.length} results for: "${command}"`
          };
          break;

        case 'analyze':
          if (pageId) {
            const analysis = await assistant.extractKeyInfoFromPage(pageId);
            const questions = await assistant.generateQuestionsForPage(pageId, 'analysis');
            result = {
              action: 'page_analysis',
              analysis,
              questions,
              message: 'Complete page analysis generated'
            };
          } else {
            result = { error: 'Page ID required for analysis' };
          }
          break;

        case 'generate':
          const generatedContent = await geminiClient.generateText(
            `${actionData.details}\n\nContext: ${context || 'General content generation'}`
          );
          result = {
            action: 'generated_content',
            content: generatedContent,
            message: 'Content generated successfully'
          };
          break;

        default:
          // Fallback: treat as general AI query
          const response = await geminiClient.generateText(
            `Help with this Notion-related request: ${command}\n\nContext: ${context || ''}`
          );
          result = {
            action: 'ai_response',
            response,
            message: 'AI assistance provided'
          };
      }

    } catch (parseError) {
      // If JSON parsing fails, treat as general command
      const response = await geminiClient.generateText(
        `Help with this Notion command: ${command}\n\nAvailable: ${pageId ? 'Page ID' : ''} ${databaseId ? 'Database ID' : ''}\n\nContext: ${context || ''}`
      );
      result = {
        action: 'ai_response',
        response,
        message: 'General AI assistance provided'
      };
    }

    res.json({
      success: true,
      command,
      interpreted_action: actionResponse,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Page control error:', error);
    res.status(500).json({
      error: 'Failed to process page control command',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
