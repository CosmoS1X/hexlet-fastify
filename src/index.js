import fastify from 'fastify';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import pug from 'pug';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import middie from '@fastify/middie';
import morgan from 'morgan';
import fastifyCookie from '@fastify/cookie';
import addRoutes from './routes/index.js';

export default async () => {
  const app = fastify({ exposeHeadRoutes: false });

  await app.register(fastifyReverseRoutes);
  await app.register(formbody);
  await app.register(middie);
  await app.register(fastifyCookie);

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

  addRoutes(app);

  return app;
};
