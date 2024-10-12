export default (app) => {
  app.get('/', (req, res) => {
    const { visited } = req.cookies;
    const { username } = req.session;
    const data = { visited, username };

    res.cookie('visited', true);

    res.view('index', data);
  });

  app.get('/hello', (req, res) => {
    const { name } = req.query;
    res.type('text/html');
    res.send(`<h1>Hello, ${name ?? 'World'}!</h1>`);
  });
};
