import fastify from 'fastify';

export default () => {
  const app = fastify();

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/users', (req, res) => {
    res.send('GET /users');
  });

  app.post('/users', (req, res) => {
    res.send('POST /users');
  });

  return app;
};
