import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Public access to the model for advanced operations
  getModel() {
    return this.model;
  }

  /**
   * Generate text response from a prompt
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text with Gemini:', error);
      throw error;
    }
  }

  /**
   * Generate a summary of text content
   */
  async summarizeText(content: string, maxWords: number = 100): Promise<string> {
    const prompt = `Please provide a concise summary of the following text in no more than ${maxWords} words:

${content}

Summary:`;

    return this.generateText(prompt);
  }

  /**
   * Analyze content and provide insights
   */
  async analyzeContent(content: string, context?: string): Promise<string> {
    const contextInfo = context ? `Context: ${context}\n\n` : '';
    const prompt = `${contextInfo}Please analyze the following content and provide insights, patterns, and recommendations:

${content}

Analysis:`;

    return this.generateText(prompt);
  }

  /**
   * Generate content suggestions based on topic and requirements
   */
  async generateContentSuggestions(topic: string, requirements: string): Promise<string> {
    const prompt = `I need help creating content for Notion about "${topic}".

Requirements: ${requirements}

Please provide specific, actionable suggestions for:
1. Page structure and organization
2. Key sections to include
3. Templates or formats that would be helpful
4. Best practices for this type of content

Suggestions:`;

    return this.generateText(prompt);
  }

  /**
   * Improve existing text content
   */
  async improveText(text: string, improvementType: 'clarity' | 'grammar' | 'style' | 'conciseness' = 'clarity'): Promise<string> {
    const prompt = `Please improve the following text for ${improvementType}:

Original text:
${text}

Improved text:`;

    return this.generateText(prompt);
  }

  /**
   * Generate questions based on content
   */
  async generateQuestions(content: string, questionType: 'review' | 'discussion' | 'analysis' = 'review'): Promise<string> {
    const prompt = `Based on the following content, generate relevant ${questionType} questions:

Content:
${content}

Questions:`;

    return this.generateText(prompt);
  }

  /**
   * Extract key information from text
   */
  async extractKeyInfo(content: string): Promise<string> {
    const prompt = `Extract and organize the key information from the following text:

${content}

Key Information:
- Main topics:
- Important details:
- Action items:
- Key insights:`;

    return this.generateText(prompt);
  }
}
