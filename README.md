# Notion AI Assistant

An AI-powered assistant for Notion that uses Google's Gemini API to provide intelligent content analysis, summarization, and enhancement capabilities for your Notion workspace.

## Features

- **Page Summarization**: Generate concise summaries of Notion pages
- **Database Analysis**: Analyze database structure and content patterns
- **Content Suggestions**: Get AI-powered suggestions for organizing and structuring content
- **Content Improvement**: Enhance existing text for clarity, grammar, style, or conciseness
- **Question Generation**: Generate review, discussion, or analysis questions based on content
- **Key Information Extraction**: Extract and organize important information from pages
- **Workspace Search & Analysis**: Search across your workspace and get AI insights

## Prerequisites

1. **Notion Integration**: Create a Notion integration and get your API key
   - Go to [Notion Developers](https://developers.notion.com/)
   - Create a new integration
   - Copy the "Internal Integration Token"

2. **Google Gemini API**: Get your Gemini API key
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key

3. **Node.js**: Version 16 or higher

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Edit `.env` file and add your API keys:
   ```
   NOTION_API_KEY=your_notion_integration_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Build and Run
```bash
npm run build
npm start
```

### Example Code

```typescript
import { NotionClient } from './services/NotionClient';
import { GeminiClient } from './services/GeminiClient';
import { NotionAIAssistant } from './assistant/NotionAIAssistant';

// Initialize clients
const notionClient = new NotionClient(process.env.NOTION_API_KEY!);
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
const assistant = new NotionAIAssistant(notionClient, geminiClient);

// Summarize a page
const summary = await assistant.summarizePage('page-id-here');

// Generate content suggestions
const suggestions = await assistant.generateContentSuggestions(
  'Project Management',
  'I need help organizing my tasks and tracking progress'
);

// Analyze a database
const analysis = await assistant.analyzeDatabase('database-id-here');
```

## API Reference

### NotionAIAssistant

#### `summarizePage(pageId: string): Promise<string>`
Generate a summary of a Notion page.

#### `analyzeDatabase(databaseId: string): Promise<string>`
Analyze a Notion database structure and content.

#### `generateContentSuggestions(topic: string, requirements: string): Promise<string>`
Get AI suggestions for content organization and structure.

#### `improvePageContent(pageId: string, improvementType?: string): Promise<string>`
Improve existing page content for clarity, grammar, style, or conciseness.

#### `generateQuestionsForPage(pageId: string, questionType?: string): Promise<string>`
Generate questions based on page content.

#### `extractKeyInfoFromPage(pageId: string): Promise<string>`
Extract and organize key information from a page.

#### `searchAndAnalyze(query: string): Promise<string>`
Search workspace and provide AI analysis of results.

## Configuration

### Environment Variables

- `NOTION_API_KEY`: Your Notion integration token (required)
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `NOTION_DATABASE_ID`: Default database ID for operations (optional)
- `LOG_LEVEL`: Logging level (default: info)
- `PORT`: Server port if running as web service (default: 3000)

## Notion Setup

1. Create a Notion integration at https://developers.notion.com/
2. Share your Notion pages/databases with your integration:
   - Open the page/database in Notion
   - Click "Share" → "Add people"
   - Search for your integration name and add it

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run in development mode with ts-node
- `npm run watch`: Watch for changes and recompile
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

### Project Structure

```
src/
├── index.ts                 # Main entry point
├── assistant/
│   └── NotionAIAssistant.ts # Main AI assistant class
├── services/
│   ├── NotionClient.ts      # Notion API wrapper
│   └── GeminiClient.ts      # Gemini AI client
└── types/                   # TypeScript type definitions
```

## Error Handling

The application includes comprehensive error handling:
- API rate limiting and retry logic
- Graceful handling of empty content
- Detailed error messages for debugging
- Fallback responses for common issues

## Security

- Store API keys in environment variables, never in code
- Use `.gitignore` to prevent committing sensitive files
- Limit Notion integration permissions to necessary scopes
- Regularly rotate API keys

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
1. Check the troubleshooting section below
2. Review Notion API documentation
3. Check Google Gemini API documentation
4. Create an issue in the repository

## Troubleshooting

### Common Issues

**"Cannot find module" errors**
- Run `npm install` to install dependencies
- Check that you're using Node.js 16+

**Notion API errors**
- Verify your integration token is correct
- Ensure pages/databases are shared with your integration
- Check that page/database IDs are valid

**Gemini API errors**
- Verify your API key is correct
- Check API quotas and limits
- Ensure your Google Cloud project has Gemini API enabled

**Empty responses**
- Check that pages contain text content
- Verify page permissions
- Review error logs for specific issues
