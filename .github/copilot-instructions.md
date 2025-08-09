## Project Overview
This is a Node.js/TypeScript application that creates an AI assistant for Notion using Google's Gemini API. The assistant can summarize pages, analyze databases, generate content suggestions, and provide AI-powered insights for Notion workspaces.

## Key Components
- **NotionClient**: Wrapper for Notion API operations
- **GeminiClient**: Interface for Google Gemini AI
- **NotionAIAssistant**: Main assistant class combining both services

## Setup Requirements
1. Create `.env` file from `.env.example`
2. Add your Notion API key and Gemini API key
3. Run `npm install` to install dependencies
4. Use `npm run dev` to start in development mode

## Available Commands
- `npm run build`: Compile TypeScript
- `npm run dev`: Run with ts-node
- `npm start`: Run compiled JavaScript
- `npm test`: Run Jest tests
- `npm run lint`: Run ESLint
- `npm run format`: Format with Prettier

Verification checklist:
- Ensure the setup steps above are complete.
- Confirm README.md and this file reflect the current project state.
- Keep this file free of HTML comments.
