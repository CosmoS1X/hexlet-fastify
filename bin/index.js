import build from '../src/index.js';

const app = await build();
const host = '0.0.0.0';
const port = 8080;

app.listen({ host, port }, () => {
  console.log(`App listening on ${host}:${port}`);
});
