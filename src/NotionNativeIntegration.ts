import { NotionClient } from './services/NotionClient';
import { GeminiClient } from './services/GeminiClient';
import { NotionAIAssistant } from './assistant/NotionAIAssistant';
import dotenv from 'dotenv';

dotenv.config();

interface NotionBlock {
  type: string;
  [key: string]: any;
}

export class NotionNativeIntegration {
  private assistant: NotionAIAssistant;
  private notionClient: NotionClient;

  constructor() {
    const notionClient = new NotionClient(process.env.NOTION_API_KEY!);
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
    this.assistant = new NotionAIAssistant(notionClient, geminiClient);
    this.notionClient = notionClient;
  }

  // --- helper: split long text into safe Notion-sized chunks ---
  private splitTextIntoChunks(text: string, maxLength: number = 1800): string[] {
    if (!text) return [];
    if (text.length <= maxLength) return [text];

    const chunks: string[] = [];
    let current = '';
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const s of sentences) {
      if (current.length + s.length + 1 <= maxLength) {
        current += (current ? ' ' : '') + s;
      } else {
        if (current) chunks.push(current);
        if (s.length <= maxLength) {
          current = s;
        } else {
          // hard split very long sentence
          for (let i = 0; i < s.length; i += maxLength) {
            const part = s.slice(i, i + maxLength);
            if (part.length === maxLength) chunks.push(part);
            else current = part;
          }
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  /**
   * Add AI summary block directly to a Notion page
   */
  async addAISummaryToPage(pageId: string): Promise<void> {
    try {
      // Generate summary
      const summary = await this.assistant.summarizePage(pageId);
      const chunks = this.splitTextIntoChunks(summary);

      // Create short callout intro, then paragraphs for content chunks
      const children: NotionBlock[] = [
        {
          type: 'callout',
          callout: {
            rich_text: [
              {
                type: 'text',
                text: { content: 'AI-generated summary' },
                annotations: { color: 'blue' }
              }
            ],
            icon: { type: 'emoji', emoji: '🔷' },
            color: 'blue_background'
          }
        }
      ];

      for (const chunk of chunks) {
        children.push({
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] }
        });
      }

      // Add blocks to page
      await this.notionClient.getClient().blocks.children.append({
        block_id: pageId,
        children: children as any
      });

      console.log('AI summary added to Notion page!');
    } catch (error) {
      console.error('Error adding AI summary:', error);
      throw error;
    }
  }

  /**
   * Add AI suggestions as a database entry
   */
  async addSuggestionsToDatabase(databaseId: string, topic: string, requirements: string): Promise<void> {
    try {
      // Generate suggestions
      const suggestions = await this.assistant.generateContentSuggestions(topic, requirements);
      const suggestionChunks = this.splitTextIntoChunks(suggestions);

      // suggestions body as multiple paragraphs
      const suggestionParagraphs: NotionBlock[] = suggestionChunks.map((c) => ({
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: c } }] }
      }));

      // Create database entry
      await this.notionClient.createPage({
        parent: { database_id: databaseId },
        properties: {
          'Title': {
            title: [
              {
                text: { content: `AI Suggestions: ${topic}` }
              }
            ]
          },
          'Status': {
            select: { name: 'AI Generated' }
          },
          'Priority': {
            select: { name: 'High' }
          }
        },
        children: [
          {
            type: 'heading_2',
            heading_2: {
              rich_text: [
                {
                  text: { content: '🤖 AI-Generated Suggestions' }
                }
              ]
            }
          },
          ...suggestionParagraphs
        ]
      });

      console.log('AI suggestions added to database!');
    } catch (error) {
      console.error('Error adding suggestions to database:', error);
      throw error;
    }
  }

  /**
   * Add AI-generated questions at the end of a page
   */
  async addQuestionsToPage(pageId: string): Promise<void> {
    try {
      const questions = await this.assistant.generateQuestionsForPage(pageId);
      const chunks = this.splitTextIntoChunks(questions);

      const children: NotionBlock[] = [
        { type: 'divider', divider: {} },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [
              { text: { content: '❓ AI-Generated Questions' }, annotations: { color: 'purple' } }
            ]
          }
        }
      ];

      for (const chunk of chunks) {
        children.push({
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] }
        });
      }

      await this.notionClient.getClient().blocks.children.append({
        block_id: pageId,
        children: children as any
      });

      console.log('AI questions added to page!');
    } catch (error) {
      console.error('Error adding questions:', error);
      throw error;
    }
  }

  /**
   * Create an AI analysis page linked to original content
   */
  async createAnalysisPage(originalPageId: string, parentPageId?: string): Promise<string> {
    try {
      const originalPage = await this.notionClient.getPage(originalPageId);
      const pageTitle = this.getPageTitle(originalPage);

      const summary = await this.assistant.summarizePage(originalPageId);
      const keyInfo = await this.assistant.extractKeyInfoFromPage(originalPageId);
      const questions = await this.assistant.generateQuestionsForPage(originalPageId);

      const summaryChunks = this.splitTextIntoChunks(summary);
      const keyInfoChunks = this.splitTextIntoChunks(keyInfo);
      const questionChunks = this.splitTextIntoChunks(questions);

      const children: NotionBlock[] = [
        {
          type: 'callout',
          callout: {
            rich_text: [
              { text: { content: 'This page contains AI-generated analysis of your content.' } }
            ],
            icon: { type: 'emoji', emoji: '🤖' },
            color: 'blue_background'
          }
        },
        { type: 'heading_2', heading_2: { rich_text: [{ text: { content: '📋 Summary' } }] } }
      ];

      for (const chunk of summaryChunks) {
        children.push({ type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] } });
      }

      children.push({ type: 'heading_2', heading_2: { rich_text: [{ text: { content: '🔍 Key Information' } }] } });
      for (const chunk of keyInfoChunks) {
        children.push({ type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] } });
      }

      children.push({ type: 'heading_2', heading_2: { rich_text: [{ text: { content: '❓ Generated Questions' } }] } });
      for (const chunk of questionChunks) {
        children.push({ type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] } });
      }

      children.push(
        { type: 'divider', divider: {} },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { text: { content: 'Original page: ' } },
              { text: { content: pageTitle }, href: `https://notion.so/${originalPageId.replace(/-/g, '')}` }
            ]
          }
        }
      );

      const analysisPage = await this.notionClient.createPage({
        parent: parentPageId ? { page_id: parentPageId } : { page_id: originalPageId },
        properties: {
          title: [ { text: { content: `🤖 AI Analysis: ${pageTitle}` } } ]
        },
        children: children as any
      });

      console.log('AI analysis page created!');
      return analysisPage.id;
    } catch (error) {
      console.error('Error creating analysis page:', error);
      throw error;
    }
  }

  // Helper methods
  private isTextBlock(block: any): boolean {
    const textBlockTypes = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item'];
    return textBlockTypes.includes(block.type);
  }

  private extractTextFromBlock(block: any): string {
    const blockContent = block[block.type];
    if (blockContent?.rich_text) {
      return blockContent.rich_text.map((rt: any) => rt.plain_text).join('');
    }
    return '';
  }

  private async updateBlockText(blockId: string, newText: string): Promise<void> {
    try {
      await this.notionClient.getClient().blocks.update({
        block_id: blockId,
        paragraph: { rich_text: [ { text: { content: newText } } ] }
      });
    } catch (error) {
      console.log(`Could not update block ${blockId}:`, error);
    }
  }

  private getPageTitle(page: any): string {
    try {
      if (page.properties?.title?.title?.[0]?.plain_text) {
        return page.properties.title.title[0].plain_text;
      }
      return 'Untitled';
    } catch {
      return 'Untitled';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public access to assistant for external use
  getAssistant(): NotionAIAssistant {
    return this.assistant;
  }

  /**
   * Demo: Transform a page with native AI integration
   */
  async demonstrateNativeIntegration(pageId: string): Promise<void> {
    console.log('TRANSFORMING YOUR NOTION PAGE WITH NATIVE AI...\n');

    try {
      console.log('1️⃣ Adding AI summary block...');
      await this.addAISummaryToPage(pageId);
      console.log('AI summary added as native Notion block!\n');

      console.log('2️⃣ Adding AI questions section...');
      await this.addQuestionsToPage(pageId);
      console.log('Questions section added!\n');

      console.log('3️⃣ Creating AI analysis sub-page...');
      const analysisPageId = await this.createAnalysisPage(pageId);
      if (analysisPageId) {
        console.log(`AI analysis sub-page created!`);
        console.log(`📄 Sub-page created: https://notion.so/${analysisPageId}`);
      }

      console.log('\n🎉 TRANSFORMATION COMPLETE!');
      console.log('Check your Notion page - AI content is now PART OF NOTION!');
      console.log('The AI blocks appear as native Notion content');
      console.log('Sub-pages appear in your page hierarchy');
    } catch (error) {
      console.error('Demo failed:', error);
      throw error;
    }
  }
}
