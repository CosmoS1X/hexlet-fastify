import users from './users.js';

const controllers = [users];

export default (app) => controllers.forEach((f) => f(app));
