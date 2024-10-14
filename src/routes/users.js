import yup from 'yup';
import { generateId, crypto } from '../utils.js';

export default (app, state) => {
  const { users } = state;
  app.get('/users/new', { name: 'newUser' }, (req, res) => res.view('users/new'));

  app.get('/users', { name: 'users' }, (req, res) => {
    const { term } = req.query;
    let currentUsers = users;

    if (term) {
      currentUsers = users.filter(({ username }) => username
        .toLowerCase().includes(term.toLowerCase()));
    }

    const data = {
      users: currentUsers,
      term,
      flash: res.flash(),
    };

    return res.view('users/index', data);
  });

  app.get('/users/:id', { name: 'user' }, (req, res) => {
    const user = users.find(({ id }) => id === req.params.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.view('users/show', { user, flash: res.flash() });
  });

  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        username: yup.string().min(2, 'Имя должно быть не менее 2 символов'),
        email: yup.string().email(),
        password: yup.string().min(5, 'Пароль должен быть не менее 5 символов'),
        passwordConfirm: yup.string().min(5, 'Пароль должен быть не менее 5 символов'),
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

      res.view('users/new', data);
      return;
    }

    const user = {
      id: generateId(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: crypto(password),
    };

    users.push(user);

    req.flash('success', 'Пользователь успешно зарегистрирован');
    res.redirect(app.reverse('user', { id: user.id }));
  });

  app.get('/users/:id/edit', (req, res) => {
    const user = users.find(({ id }) => id === req.params.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.view('/users/edit', { id: user.id, username: user.username, email: user.email });
  });

  app.post('/users/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        username: yup.string().min(2, 'Имя должно быть не менее 2 символов'),
        email: yup.string().email(),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      try {
        return { value: schema.validateSync(data) };
      } catch (error) {
        return { error };
      }
    },
  }, (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (req.validationError) {
      const data = {
        id,
        username,
        email,
        error: req.validationError,
      };

      res.view('/users/edit', data);
      return;
    }

    const userIndex = users.findIndex((item) => item.id === id);

    users[userIndex] = { ...users[userIndex], username, email };

    req.flash('success', 'Данные успешно обновлены');
    res.redirect(app.reverse('user', { id }));
  });
};
