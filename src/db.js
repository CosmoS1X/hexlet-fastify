import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres({
  host: 'dpg-cs811e3qf0us738ikg3g-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'hexlet_fastify',
  username: 'cosmo',
  password: process.env.PGPASSWORD,
  ssl: true,
});

export default sql;
