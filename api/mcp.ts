import serverless from 'serverless-http';
import { MCPHttpServer } from '../src/MCPHttpServer';

const mcpServer = new MCPHttpServer();

// Vercel serverless handler
export default serverless(mcpServer.getApp());
