import fastify from 'fastify';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import pug from 'pug';
import yup from 'yup';
import { generateId, crypto } from './utils.js';

const state = {
  courses: [],
  users: [],
};

export default async () => {
  const app = fastify();
  const { users } = state;

  await app.register(view, { engine: { pug } });
  await app.register(formbody);

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

  app.get('/users/new', (req, res) => {
    res.view('src/views/users/new');
  });

  app.get('/users/:userId', (req, res) => {
    const user = users.find(({ userId }) => userId === req.params.userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.view('src/views/users/show', { user });
  });

  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        username: yup.string().min(2, 'Имя должно быть не меньше двух символов'),
        email: yup.string().email(),
        password: yup.string().min(5, 'Пароль должен быть не меньше 5 символов'),
        passwordConfirm: yup.string().min(5, 'Пароль должен быть не меньше 5 символов'),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      if (data.password !== data.passwordConfirm) {
        return { error: Error('Пароли не совпадают') };
      }

      try {
        return { value: schema.validateSync(data) };
      } catch (error) {
        return { error };
      }
    },
  }, (req, res) => {
    const {
      username, email, password, passwordConfirm,
    } = req.body;

    if (req.validationError) {
      const data = {
        username,
        email,
        password,
        passwordConfirm,
        error: req.validationError,
      };

      res.view('src/views/users/new', data);
      return;
    }

    const user = {
      userId: generateId(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: crypto(password),
    };

    state.users.push(user);

    res.redirect('/users');
  });

  app.get('/hello', (req, res) => {
    const { name } = req.query;
    res.type('text/html');
    res.send(`<h1>Hello, ${name ?? 'World'}!</h1>`);
  });

  return app;
};
