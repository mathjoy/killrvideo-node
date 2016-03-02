import express from 'express';
import bodyParser from 'body-parser';
import { dataSourceRoute } from 'falcor-express';
import { createServer } from 'http';
import morgan from 'morgan';

import { KillrVideoRouter } from './routes/killrvideo-router';
import { logger } from './logging/logger';
import { logErrors } from './logging/express-logger';

/**
 * Creates an http Server for serving KillrVideo web requests.
 */
export function createWebServer() {
  const app = express();
  
  // Serve up requests to static assets
  app.use('/static', express.static(`${__dirname}/static`));
  
  // Request logging when in development
  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
  }
  
  // Falcor requests to model.json
  app.use('/model.json', [
    bodyParser.urlencoded({ extended: false }),
    dataSourceRoute((req, res) => new KillrVideoRouter())
  ]);
  
  // All other requests serve up the index.html page
  app.get('/*', (req, res) => {
    res.sendFile(`${__dirname}/static/index.html`);
  });
  
  // Error logging
  app.use(logErrors());
  
  // Error handling
  app.use((err, req, res, next) => {
    // Delegate to default handler if response already in progress
    if (res.headersSent) {
      return next(err);
    }
    
    res.sendStatus(500);
  });
  
  // Create the http Server instance and do some logging on start/stop
  const server = createServer(app);
  server.on('listening', () => {
    logger.log('info', 'KillrVideo Web Server listening on %j', server.address());
  });
  server.on('close', () => {
    logger.log('info', 'KillrVideo Web Server is closed');
  });
  
  return server;
};

// Also export as default
export default createWebServer;