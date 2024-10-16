import postgres from 'postgres';

const sql = postgres({
  user: 'cosmo',
  database: 'hexlet-fastify',
  host: 'localhost',
});

export default sql;
