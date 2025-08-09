import serverless from 'serverless-http';
import { NotionAppServer } from '../src/NotionAppServer';

const appServer = new NotionAppServer();

// Vercel serverless handler
export default serverless(appServer.getApp());
