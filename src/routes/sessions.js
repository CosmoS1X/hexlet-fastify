import { crypto } from '../utils.js';

export default (app, db) => {
  app.get('/sessions/new', (req, res) => res.view('sessions/new'));

  app.post('/sessions', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = '${username}'`, (error, user) => {
      if (error) {
        res.status(500);
        res.send(error);
        return;
      }

      if (!user || user.password !== crypto(password)) {
        res.view('sessions/new', { message: 'Неправильные имя и/или пароль' });
        return;
      }

      req.session.username = user.username;

      res.redirect('/');
    });
  });

  app.post('/sessions/delete', (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        res.status(500);
        res.send('Internal Server Error');
      } else {
        res.redirect('/');
      }
    });
  });
};
