import fastify from 'fastify';
import wrapFastify from 'fastify-method-override-wrapper';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import pug from 'pug';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import middie from '@fastify/middie';
import morgan from 'morgan';
import session from '@fastify/session';
import cookie from '@fastify/cookie';
import flash from '@fastify/flash';
import sqlite3 from 'sqlite3';
import addRoutes from './routes/index.js';
import prepareDatabase from './dbInit.js';

export default async () => {
  const wrappedFastify = wrapFastify(fastify);
  const app = wrappedFastify({ exposeHeadRoutes: false });
  const db = new sqlite3.Database(':memory:');

  prepareDatabase(db);

  await app.register(fastifyReverseRoutes);
  await app.register(formbody);
  await app.register(middie);
  await app.register(cookie);
  await app.register(session, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: false },
  });
  await app.register(flash);

  const route = (name, placeholdersValues) => app.reverse(name, placeholdersValues);

  await app.register(view, {
    engine: { pug },
    root: 'src/views',
    defaultContext: {
      route,
    },
  });

  const logger = morgan('tiny');

  app.use(logger);

  app.addHook('onReady', () => {
    console.log('Application is ready');
  });

  app.addHook('onError', (error) => {
    console.error('Error during hook execution:', error.message);
  });

  app.addHook('onRequest', (req, res, done) => {
    console.log(`Запрос выполнен в ${new Date()}`);
    done();
  });

  addRoutes(app, db);

  return app;
};
