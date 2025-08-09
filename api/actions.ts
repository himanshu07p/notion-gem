import serverless from 'serverless-http';
import { NotionAppServer } from '../src/NotionAppServer';

const appServer = new NotionAppServer();
const app = appServer.getApp();

// Add debugging middleware
app.use('/actions', (req, res, next) => {
  console.log('Actions endpoint hit:', req.method, req.url, req.body);
  next();
});

// Vercel serverless handler
export default serverless(app);
