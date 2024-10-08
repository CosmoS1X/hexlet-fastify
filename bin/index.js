import build from '../src/index.js';

const app = build();
const port = 3000;

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
