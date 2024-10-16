import yup from 'yup';
import { crypto } from '../utils.js';
import sql from '../db.js';

export default (app) => {
  app.get('/users/new', { name: 'newUser' }, (req, res) => res.view('users/new'));

  app.get('/users', { name: 'users' }, async (req, res) => {
    const users = await sql`SELECT * FROM users`;
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
    };

    return res.view('users/index', data);
  });

  app.get('/users/:id', { name: 'user' }, async (req, res) => {
    const [user] = await sql`SELECT * FROM users WHERE id = ${req.params.id}`;

    if (!user) {
      return res.status(404).send('User not found');
    }

    const data = {
      user,
      flash: res.flash(),
    };

    return res.view('users/show', data);
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
  }, async (req, res) => {
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

      return res.view('users/new', data);
    }

    const [{ id }] = await sql`
      INSERT INTO users
      (username, email, password, created_at)
      VALUES (${username.trim()}, ${email.trim().toLowerCase()}, ${crypto(password)}, NOW())
      RETURNING id
    `;

    req.flash('success', 'Пользователь успешно зарегистрирован');
    return res.redirect(app.reverse('user', { id }));
  });

  app.get('/users/:id/edit', async (req, res) => {
    const [user] = await sql`SELECT * FROM users WHERE id = ${req.params.id}`;

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.view('/users/edit', { id: user.id, username: user.username, email: user.email });
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
  }, async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (req.validationError) {
      const data = {
        id,
        username,
        email,
        error: req.validationError,
      };

      return res.view('/users/edit', data);
    }

    await sql`UPDATE users SET username = ${username}, email = ${email} WHERE id = ${id}`;

    req.flash('success', 'Данные успешно обновлены');
    return res.redirect('/users');
  });

  app.delete('/users/:id', async (req, res) => {
    await sql`DELETE FROM users WHERE id = ${req.params.id}`;

    req.flash('success', 'Пользователь успешно удален');
    return res.redirect('/users');
  });
};
