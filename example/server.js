/**
 * Import vendor modules
 */
const {Runtime, Server} = require('@neobeach/core');
const requestLogger = require('@neobeach/middlewares-request-logger');
const oldBrowser = require('@neobeach/middlewares-old-browser');

/**
 * Import own modules
 */
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
Runtime(() => {
    server.includeDefaultBodyParsers();
    server.loadMiddlewares(globalMiddleware);
    server.loadRouters(routers);
    server.run();
});
