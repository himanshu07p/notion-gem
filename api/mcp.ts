import serverless from 'serverless-http';
const MCPHttpServer = require('../src/MCPHttpServer');

const mcpServer = new MCPHttpServer();

// Vercel serverless handler
export default serverless(mcpServer.getApp());
