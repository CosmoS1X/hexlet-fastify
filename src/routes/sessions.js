import { crypto } from '../utils.js';
import sql from '../db.js';

export default (app) => {
  app.get('/sessions/new', (req, res) => res.view('sessions/new'));

  app.post('/sessions', async (req, res) => {
    const { username, password } = req.body;

    const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;

    if (!user || user.password !== crypto(password)) {
      return res.view('sessions/new', { message: 'Неправильные имя и/или пароль' });
    }

    req.session.username = user.username;

    return res.redirect('/');
  });

  app.post('/sessions/delete', (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).send('Internal Server Error');
      }

      return res.redirect('/');
    });
  });
};
