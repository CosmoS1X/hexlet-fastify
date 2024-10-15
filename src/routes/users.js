import yup from 'yup';
import { crypto } from '../utils.js';

export default (app, db) => {
  app.get('/users/new', { name: 'newUser' }, (req, res) => res.view('users/new'));

  app.get('/users', { name: 'users' }, (req, res) => {
    db.all('SELECT * FROM users', (error, users) => {
      const { term } = req.query;
      let currentUsers = users;

      if (term) {
        currentUsers = users.filter(({ username }) => username
          .toLowerCase().includes(term.toLowerCase()));
      }

      const data = {
        users: currentUsers || [],
        term,
        flash: res.flash(),
        error,
      };

      return res.view('users/index', data);
    });
  });

  app.get('/users/:id', { name: 'user' }, (req, res) => {
    db.get(`SELECT * FROM users WHERE id = ${req.params.id}`, (error, user) => {
      if (error) {
        return res.status(500).send(new Error(error));
      }

      if (!user) {
        return res.status(404).send('User not found');
      }

      const data = {
        user,
        flash: res.flash(),
      };

      return res.view('users/show', data);
    });
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
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: crypto(password),
      createdAt: new Date().toISOString(),
    };

    const stmt = db.prepare('INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)');
    stmt.run([user.username, user.email, user.password, user.createdAt], function (error) {
      if (error) {
        res.send(error);
        return;
      }

      req.flash('success', 'Пользователь успешно зарегистрирован');
      res.redirect(app.reverse('user', { id: this.lastID }));
    });
  });

  app.get('/users/:id/edit', (req, res) => {
    db.get(`SELECT * FROM users WHERE id = ${req.params.id}`, (error, user) => {
      if (!user) {
        return res.status(404).send('User not found');
      }

      return res.view('/users/edit', { id: user.id, username: user.username, email: user.email });
    });
  });

  app.patch('/users/:id', {
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

    const stmt = db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?');
    stmt.run([username, email, id], (error) => {
      if (error) {
        res.send(error);
        return;
      }

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

      req.flash('success', 'Данные успешно обновлены');
      res.redirect('/users');
    });
  });

  app.delete('/users/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.params.id, (error) => {
      if (error) {
        res.send(error);
        return;
      }

      req.flash('success', 'Пользователь успешно удален');
      res.redirect('/users');
    });
  });
};
