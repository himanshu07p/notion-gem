import { Client } from '@notionhq/client';
import { 
  PageObjectResponse, 
  DatabaseObjectResponse,
  QueryDatabaseResponse,
  CreatePageResponse,
  UpdatePageResponse
} from '@notionhq/client/build/src/api-endpoints';

export class NotionClient {
  private client: Client;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Notion API key is required');
    }
    
    this.client = new Client({
      auth: apiKey,
    });
  }

  // Expose client for advanced operations
  getClient(): Client {
    return this.client;
  }

  /**
   * Get a page by ID
   */
  async getPage(pageId: string): Promise<PageObjectResponse> {
    try {
      const response = await this.client.pages.retrieve({ page_id: pageId });
      return response as PageObjectResponse;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  /**
   * Get page content (blocks)
   */
  async getPageContent(pageId: string) {
    try {
      const response = await this.client.blocks.children.list({
        block_id: pageId,
      });
      return response.results;
    } catch (error) {
      console.error('Error fetching page content:', error);
      throw error;
    }
  }

  /**
   * Get database by ID
   */
  async getDatabase(databaseId: string): Promise<DatabaseObjectResponse> {
    try {
      const response = await this.client.databases.retrieve({ 
        database_id: databaseId 
      });
      return response as DatabaseObjectResponse;
    } catch (error) {
      console.error('Error fetching database:', error);
      throw error;
    }
  }

  /**
   * Query database
   */
  async queryDatabase(databaseId: string, query?: any): Promise<QueryDatabaseResponse> {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        ...query,
      });
      return response;
    } catch (error) {
      console.error('Error querying database:', error);
      throw error;
    }
  }

  /**
   * Create a new page
   */
  async createPage(params: any): Promise<CreatePageResponse> {
    try {
      const response = await this.client.pages.create(params);
      return response as CreatePageResponse;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  /**
   * Update a page
   */
  async updatePage(pageId: string, params: any): Promise<UpdatePageResponse> {
    try {
      const response = await this.client.pages.update({
        page_id: pageId,
        ...params,
      });
      return response as UpdatePageResponse;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  /**
   * Search for pages and databases
   */
  async search(query: string) {
    try {
      const response = await this.client.search({
        query,
      });
      return response.results;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getUsers() {
    try {
      const response = await this.client.users.list({});
      return response.results;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}
