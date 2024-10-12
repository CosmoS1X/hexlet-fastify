import root from './root.js';
import users from './users.js';
import sessions from './sessions.js';

const controllers = [root, users, sessions];

export default (app, state) => controllers.forEach((f) => f(app, state));
