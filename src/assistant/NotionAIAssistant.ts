import { NotionClient } from '../services/NotionClient';
import { GeminiClient } from '../services/GeminiClient';

export class NotionAIAssistant {
  private notionClient: NotionClient;
  private geminiClient: GeminiClient;

  constructor(notionClient: NotionClient, geminiClient: GeminiClient) {
    this.notionClient = notionClient;
    this.geminiClient = geminiClient;
  }

  // Public access to clients for advanced operations
  getNotionClient(): NotionClient {
    return this.notionClient;
  }

  getGeminiClient(): GeminiClient {
    return this.geminiClient;
  }

  /**
   * Summarize a Notion page
   */
  async summarizePage(pageId: string): Promise<string> {
    try {
      // Get page content
      const page = await this.notionClient.getPage(pageId);
      const blocks = await this.notionClient.getPageContent(pageId);
      
      // Extract text content from blocks
      const content = this.extractTextFromBlocks(blocks);
      
      if (!content.trim()) {
        return 'This page appears to be empty or contains no text content.';
      }
      
      // Generate summary using Gemini
      const summary = await this.geminiClient.summarizeText(content);
      
      return summary;
    } catch (error) {
      console.error('Error summarizing page:', error);
      throw new Error('Failed to summarize page');
    }
  }

  /**
   * Analyze a Notion database
   */
  async analyzeDatabase(databaseId: string): Promise<string> {
    try {
      // Get database structure
      const database = await this.notionClient.getDatabase(databaseId);
      const entries = await this.notionClient.queryDatabase(databaseId);
      
      // Prepare database information for analysis
      const databaseInfo = this.formatDatabaseInfo(database, entries);
      
      // Generate analysis using Gemini
      const analysis = await this.geminiClient.analyzeContent(
        databaseInfo,
        'This is a Notion database analysis'
      );
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing database:', error);
      throw new Error('Failed to analyze database');
    }
  }

  /**
   * Generate content suggestions
   */
  async generateContentSuggestions(topic: string, requirements: string): Promise<string> {
    try {
      const suggestions = await this.geminiClient.generateContentSuggestions(topic, requirements);
      return suggestions;
    } catch (error) {
      console.error('Error generating content suggestions:', error);
      throw new Error('Failed to generate content suggestions');
    }
  }

  /**
   * Improve page content
   */
  async improvePageContent(pageId: string, improvementType: 'clarity' | 'grammar' | 'style' | 'conciseness' = 'clarity'): Promise<string> {
    try {
      // Get page content
      const blocks = await this.notionClient.getPageContent(pageId);
      const content = this.extractTextFromBlocks(blocks);
      
      if (!content.trim()) {
        return 'This page appears to be empty or contains no text content to improve.';
      }
      
      // Generate improved content using Gemini
      const improvedContent = await this.geminiClient.improveText(content, improvementType);
      
      return improvedContent;
    } catch (error) {
      console.error('Error improving page content:', error);
      throw new Error('Failed to improve page content');
    }
  }

  /**
   * Generate questions for a page
   */
  async generateQuestionsForPage(pageId: string, questionType: 'review' | 'discussion' | 'analysis' = 'review'): Promise<string> {
    try {
      // Get page content
      const blocks = await this.notionClient.getPageContent(pageId);
      const content = this.extractTextFromBlocks(blocks);
      
      if (!content.trim()) {
        return 'This page appears to be empty or contains no text content to generate questions from.';
      }
      
      // Generate questions using Gemini
      const questions = await this.geminiClient.generateQuestions(content, questionType);
      
      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate questions');
    }
  }

  /**
   * Extract key information from a page
   */
  async extractKeyInfoFromPage(pageId: string): Promise<string> {
    try {
      // Get page content
      const blocks = await this.notionClient.getPageContent(pageId);
      const content = this.extractTextFromBlocks(blocks);
      
      if (!content.trim()) {
        return 'This page appears to be empty or contains no text content to extract information from.';
      }
      
      // Extract key information using Gemini
      const keyInfo = await this.geminiClient.extractKeyInfo(content);
      
      return keyInfo;
    } catch (error) {
      console.error('Error extracting key information:', error);
      throw new Error('Failed to extract key information');
    }
  }

  /**
   * Search and analyze content across workspace
   */
  async searchAndAnalyze(query: string): Promise<string> {
    try {
      // Search for relevant pages/databases
      const searchResults = await this.notionClient.search(query);
      
      if (searchResults.length === 0) {
        return 'No content found matching your search query.';
      }
      
      // Prepare search results summary
      const searchSummary = this.formatSearchResults(searchResults);
      
      // Generate analysis using Gemini
      const analysis = await this.geminiClient.analyzeContent(
        searchSummary,
        `Search results for: "${query}"`
      );
      
      return analysis;
    } catch (error) {
      console.error('Error searching and analyzing:', error);
      throw new Error('Failed to search and analyze content');
    }
  }

  /**
   * Extract text content from Notion blocks
   */
  private extractTextFromBlocks(blocks: any[]): string {
    let text = '';
    
    for (const block of blocks) {
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        text += block.paragraph.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
        text += block.heading_1.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
        text += block.heading_2.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'heading_3' && block.heading_3?.rich_text) {
        text += block.heading_3.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
        text += '• ' + block.bulleted_list_item.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
        text += '1. ' + block.numbered_list_item.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'to_do' && block.to_do?.rich_text) {
        const checked = block.to_do.checked ? '✓' : '☐';
        text += `${checked} ` + block.to_do.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'quote' && block.quote?.rich_text) {
        text += '> ' + block.quote.rich_text.map((rt: any) => rt.plain_text).join('') + '\n';
      } else if (block.type === 'code' && block.code?.rich_text) {
        text += '```\n' + block.code.rich_text.map((rt: any) => rt.plain_text).join('') + '\n```\n';
      }
    }
    
    return text;
  }

  /**
   * Format database information for analysis
   */
  private formatDatabaseInfo(database: any, entries: any): string {
    let info = `Database: ${database.title?.[0]?.plain_text || 'Untitled'}\n\n`;
    
    // Add properties information
    info += 'Properties:\n';
    for (const [key, property] of Object.entries(database.properties)) {
      info += `- ${key}: ${(property as any).type}\n`;
    }
    
    // Add entries count
    info += `\nTotal entries: ${entries.results.length}\n\n`;
    
    // Add sample entries (first 5)
    info += 'Sample entries:\n';
    const sampleEntries = entries.results.slice(0, 5);
    for (const entry of sampleEntries) {
      const title = this.getEntryTitle(entry);
      info += `- ${title}\n`;
    }
    
    return info;
  }

  /**
   * Get title from database entry
   */
  private getEntryTitle(entry: any): string {
    for (const [key, property] of Object.entries(entry.properties)) {
      if ((property as any).type === 'title' && (property as any).title?.length > 0) {
        return (property as any).title[0].plain_text;
      }
    }
    return 'Untitled';
  }

  /**
   * Format search results for analysis
   */
  private formatSearchResults(results: any[]): string {
    let summary = `Found ${results.length} items:\n\n`;
    
    for (const result of results.slice(0, 10)) { // Limit to first 10 results
      if (result.object === 'page') {
        const title = result.properties?.title?.title?.[0]?.plain_text || 'Untitled Page';
        summary += `Page: ${title}\n`;
      } else if (result.object === 'database') {
        const title = result.title?.[0]?.plain_text || 'Untitled Database';
        summary += `Database: ${title}\n`;
      }
    }
    
    return summary;
  }
}
