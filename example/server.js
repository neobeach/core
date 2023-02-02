/**
 * Import vendor modules
 */
const {Runtime, Server, db} = require('@neobeach/core');
const requestLogger = require('@neobeach/middlewares-request-logger');
const oldBrowser = require('@neobeach/middlewares-old-browser');

/**
 * Import own modules
 */
const User = require('./models/User');
const Api = require('./routers/Api');

/**
 * Setup a new Express server
 */
const server = new Server();

/**
 * Define global middlewares
 */
const globalMiddleware = [
    requestLogger(),
    oldBrowser()
];

/**
 * Define custom routers
 */
const routers = [
    Api
];

/**
 * Create a runtime/sandbox to start the server in
 */
Runtime(async () => {
    await db.init([User]);
    server.includeDefaultSecurityHeaders();
    server.includeDefaultCompression();
    server.includeDefaultBodyParsers();
    server.includeDefaultCookieParser();
    server.setEJSViewEngine(`${__dirname}/views`);
    server.loadMiddlewares(globalMiddleware);
    server.loadRouters(routers);
    server.run();
});
