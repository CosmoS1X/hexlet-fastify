export default (app) => {
  app.get('/', (req, res) => {
    const { visited } = req.cookies;
    const templateData = { visited };

    res.cookie('visited', true);

    res.view('index', templateData);
  });

  app.get('/hello', (req, res) => {
    const { name } = req.query;
    res.type('text/html');
    res.send(`<h1>Hello, ${name ?? 'World'}!</h1>`);
  });
};
