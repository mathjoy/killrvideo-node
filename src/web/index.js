import express from 'express';
import bodyParser from 'body-parser';
import { dataSourceRoute } from 'falcor-express';
import { createServer } from 'http';
import morgan from 'morgan';
import session from 'express-session';
import CassandraStore from 'cassandra-store';
import passport from 'passport';

import { KillrVideoRouter } from './routes/killrvideo-router';
import { logger } from '../common/logger';
import { logErrors } from './logging/express-logger';

// Tell passport auth how to serialize and deserialize users
passport.serializeUser(function(user, done) {
  // Our code really just passes a uuid string for user, so just use it as-is
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  // No deserialization necessary since we just work with a uuid string for a user
  return done(null, id);
});

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
    session({
      name: 'killrvideo.sid',
      store: new CassandraStore(/* TODO: Options */),
      resave: false,
      saveUninitialized: false,
      secret: 'THIS SHOULD BE CONFIGURABLE' /* TODO */
    }),
    passport.initialize(),
    passport.session(),
    dataSourceRoute((req, res) => new KillrVideoRouter(req))
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