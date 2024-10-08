import fastify from 'fastify';

export default () => {
  const app = fastify();

  app.get('/', (req, res) => {
    res.type('text/html');
    res.send('<h1>Fastify Example Page</h1>');
  });

  app.get('/users', (req, res) => {
    res.send('GET /users');
  });

  app.post('/users', (req, res) => {
    res.send('POST /users');
  });

  app.get('/hello', (req, res) => {
    const { name } = req.query;
    res.type('text/html');
    res.send(`<h1>Hello, ${name ?? 'World'}!</h1>`);
  });

  return app;
};
