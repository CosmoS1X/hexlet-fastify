import root from './root.js';
import users from './users.js';

const controllers = [root, users];

export default (app) => controllers.forEach((f) => f(app));
