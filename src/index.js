import fastify from 'fastify';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import pug from 'pug';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import addRoutes from './routes/index.js';

export default async () => {
  const app = fastify({ exposeHeadRoutes: false });

  await app.register(fastifyReverseRoutes);

  const route = (name, placeholdersValues) => app.reverse(name, placeholdersValues);

  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route,
    },
  });

  await app.register(formbody);

  app.get('/', (req, res) => {
    res.view('src/views/index');
  });

  app.get('/hello', (req, res) => {
    const { name } = req.query;
    res.type('text/html');
    res.send(`<h1>Hello, ${name ?? 'World'}!</h1>`);
  });

  addRoutes(app);

  return app;
};
