import { crypto } from '../utils.js';

export default (app, state) => {
  const { users } = state;
  app.get('/sessions/new', (req, res) => res.view('sessions/new'));

  app.post('/sessions', (req, res) => {
    const user = users.find(({ username, password }) => (
      username === req.body.username && password === crypto(req.body.password)
    ));

    if (!user) {
      res.view('sessions/new', { message: 'Неправильные имя и/или пароль' });
      return;
    }

    req.session.username = user.username;

    res.redirect('/');
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
