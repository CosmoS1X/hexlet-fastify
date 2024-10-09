import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';
import getUsers from './utils.js';

export default async () => {
  const app = fastify();
  const users = getUsers();

  await app.register(view, { engine: { pug } });

  app.get('/', (req, res) => {
    res.view('src/views/index');
  });

  app.get('/users', (req, res) => {
    const { term } = req.query;
    let currentUsers = users;

    if (term) {
      currentUsers = users.filter(({ username }) => username
        .toLowerCase().includes(term.toLowerCase()));
    }

    return res.view('src/views/users/index', { users: currentUsers, term });
  });

  app.get('/users/:userId', (req, res) => {
    const user = users.find(({ userId }) => userId === req.params.userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.view('src/views/users/show', { user });
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
