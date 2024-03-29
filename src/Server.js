/**
 * Import vendor modules
 * @ignore
 */
const os = require('os');
const express = require('express');

/**
 * Import own modules
 * @ignore
 */
const Logger = require('./Logger');
const Config = require('./Config');
const Router = require('./Router');
const Controller = require('./Controller');

class Server {
    /**
     * Setup an internal express app
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @type {Express}
     */
    #app = express();

    /**
     * Internal bind hostname reference for Express
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @type {string}
     */
    #host;

    /**
     * Internal bind port reference for Express
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @type {number}
     */
    #port;

    /**
     * Server class
     *
     * @class Server
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://www.npmjs.com/package/express
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     * const Api = require('./routers/Api');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.includeDefaultBodyParsers();
     *     server.loadRouters([Api]);
     *     server.run();
     * });
     */
    constructor() {
        // Log server start
        Logger.info('[SERVER] App starting...');

        // Set the host and port
        this.#host = Config.application.host;
        this.#port = Config.application.port;

        // Set the Express app to allow proxy's
        this.#app.enable('trust proxy');

        // Disable powered by header for security reasons
        this.#app.disable('x-powered-by');

        // Handle Google Cloud Loadbalancer requests (If the app try's to redirect from /)
        this.#app.use((req, res, next) => {
            if (req.get('User-Agent') === 'GoogleHC/1.0') {
                return res.send('Hello Google');
            }

            next();
        });

        // Expose library headers
        this.#app.use((req, res, next) => {
            const packageInformation = require(__dirname + '/../package.json');
            res.set('X-Neo-Beach', 'true');
            res.set('X-Neo-Beach-Core', packageInformation.version);

            next();
        });

        // Expose a health check
        this.#app.use((req, res, next) => {
            if(req.originalUrl === '/_health') {
                const packageInformation = require(__dirname + '/../package.json');

                res.json({
                    status: 'UP',
                    host: os.hostname(),
                    core: packageInformation.version,
                    load: process.cpuUsage(),
                    mem: process.memoryUsage(),
                    uptime: process.uptime()
                });

                return;
            }

            next();
        });
    }

    /**
     * Starts the Express server
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @returns {function}
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     * const Api = require('./routers/Api');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.run();
     * });
     */
    run() {
        return this.#app.listen(this.#port, this.#host, () => {
            Logger.info(`[SERVER] Service started with success! App running at: ${this.#host}:${this.#port}`)
        });
    }

    /**
     * Load global middlewares into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see http://expressjs.com/en/guide/writing-middleware.html
     *
     * @param {array.<function(*, *, *)>} middlewares - An array with Express middleware functions
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *    server.loadMiddlewares([
     *        (req, res, next) => {
     *            // Execute custom code here
     *            next();
     *        }
     *    ]);
     *    server.run();
     * });
     */
    loadMiddlewares(middlewares) {
        middlewares.forEach(mw => {
            this.#app.use(mw);
        });

        Logger.info(`[SERVER] Loaded ${middlewares.length} global middleware(s)`);
    }

    /**
     * Load routers into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {array} routers - An array with Routers
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     * const Api = require('./routers/Api');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.loadRouters([Api]);
     *     server.run();
     * });
     */
    loadRouters(routers) {
        Logger.info(`[SERVER] Loaded ${routers.length} router(s)`);

        routers.forEach(router => {
            if(router instanceof Router) {
                // Get Routes from Router
                const routes = router.routes;

                // Check if we have routes available
                if(routes.length === 0) {
                    Logger.warn(`[ROUTER] ${router.name} is initialized without routes!`);
                }

                // Loop over routes to initialize controllers
                routes.forEach(route => {
                    // Check if the controller extends our base controller
                    if(route.controller instanceof Controller) {
                        // Add all middlewares for every route
                        for (const mw of route.middlewares) {
                            this.#app.use(route.path, mw);
                        }

                        // Add the router from the controller
                        this.#app.use(route.path, route.controller.getRouter(router.name));
                    } else {
                        console.error('Error at line:', route);
                        throw new Error(`Class is not an instance of '@neobeach/core/Controller'!`);
                    }
                });

                Logger.info(`[SERVER] ${router.name}: Loaded ${routes.length} controller(s)`);
            } else {
                console.error('Error at line:', router);
                throw new Error(`Class is not an instance of '@neobeach/core/Router'!`);
            }
        });
    }

    /**
     * Serves a static directory from the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} directory - Local directory path where the static files live
     * @param {string} [prefix] - Optional prefix to create a virtual path
     *
     * @see https://expressjs.com/en/starter/static-files.html
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.loadStatic('public');
     *     server.run();
     * });
     */
    loadStatic(directory, prefix = '/') {
        if(prefix === '/') {
            this.#app.use(express.static(directory));
        } else {
            this.#app.use(prefix, express.static(directory));
        }

        Logger.info(`[SERVER] Serving static files on / from: ${directory}`);
    }

    /**
     * Sets an Express app parameter
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} name - An express parameter name
     * @param {*} value - You specified value for the parameter
     *
     * @see https://expressjs.com/en/4x/api.html#app.set
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.setParameter('title', 'My Site');
     *     server.run();
     * });
     */
    setParameter(name, value) {
        this.#app.set(name, value);

        Logger.info(`[SERVER] Setting the express parameter ${name}: ${JSON.stringify(value)}`);
    }

    /**
     * Sets the Express render engine to EJS
     *
     * @access public
     * @since 2.1.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} views - Path to the EJS views directory
     *
     * @see https://expressjs.com/en/guide/using-template-engines.html
     * @see https://ejs.co/
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.setEJSViewEngine(`${__dirname}/views`);
     *     server.run();
     * });
     */
    setEJSViewEngine(views) {
        this.#app.set('view engine', 'ejs');
        this.#app.set('views', views);

        Logger.info(`[SERVER] Enabling EJS as render engine, views directory: ${views}`);
    }

    /**
     * Includes/loads default express body parsers (json, text, urlencoded and multer) with recommended config into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://expressjs.com/en/api.html#express.json
     * @see https://expressjs.com/en/api.html#express.text
     * @see https://expressjs.com/en/api.html#express.urlencoded
     * @see https://github.com/expressjs/multer
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.includeDefaultBodyParsers();
     *     server.run();
     * });
     */
    includeDefaultBodyParsers() {
        const multer = require('multer');

        this.#app.use(express.json());
        this.#app.use(express.text());
        this.#app.use(express.urlencoded({extended: false}));
        this.#app.use(multer().none());

        Logger.info(`[SERVER] Loaded default body parsers (json, text, urlencoded and multer)`);
    }

    /**
     * Includes/loads default security headers with recommended config into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://www.npmjs.com/package/helmet
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.includeDefaultSecurityHeaders();
     *     server.run();
     * });
     */
    includeDefaultSecurityHeaders() {
        const helmet = require('helmet');

        this.#app.use(helmet());

        Logger.info(`[SERVER] Loaded default security headers`);
    }

    /**
     * Includes/loads default CORS headers with recommended config into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://www.npmjs.com/package/cors
     *
     * @param {String} origin - String with allowed origin URL's
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.includeDefaultCorsHeaders();
     *     server.run();
     * });
     */
    includeDefaultCorsHeaders(origin) {
        const cors = require('cors');

        this.#app.use(cors({
            origin
        }));

        Logger.info(`[SERVER] Loaded default CORS headers`);
    }

    /**
     * Includes/loads default compression (deflate, gzip) with recommended config into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://www.npmjs.com/package/compression
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.includeDefaultCompression();
     *     server.run();
     * });
     */
    includeDefaultCompression() {
        const compression = require('compression');

        this.#app.use(compression({
            threshold: 0
        }));

        Logger.info(`[SERVER] Loaded default compression (deflate, gzip)`);
        Logger.warn(`[SERVER] !!! Please note: We recommend you to disable compression on production environments. Loadbalancers and reverse proxies are 9/10 times faster at doing this job... !!!`);
    }

    /**
     * Includes/loads cookie parser with recommended config into the Express app
     *
     * @access public
     * @since 2.1.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://github.com/expressjs/cookie-parser
     *
     * @example
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.includeDefaultCookieParser();
     *     server.run();
     * });
     */
    includeDefaultCookieParser() {
        const cookieParser = require('cookie-parser');

        this.#app.use(cookieParser());

        Logger.info(`[SERVER] Loaded default cookie parser`);
    }

    /**
     * Attach a Remix Framework build to our Express server
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @see https://remix.run/docs/en/v1
     * @see https://remix.run/docs/en/v1/other-api/adapter
     *
     * @param {*} serverBuild - A Remix Server build
     *
     * @example
     * import * as serverBuild from "@remix-run/dev/server-build";
     *
     * const {Runtime, Server} = require('@neobeach/core');
     *
     * const server = new Server();
     *
     * Runtime(() => {
     *     server.loadRemixFramework(serverBuild);
     *     server.run();
     * });
     */
    loadRemixFramework(serverBuild) {
        const {createRequestHandler} = require('@remix-run/express');

        this.#app.use('/build', express.static(`${process.cwd()}/public/build`, { immutable: true, maxAge: '1y' }));
        this.#app.use(express.static(`${process.cwd()}/public/build`, { maxAge: '1h' }));
        this.#app.use(express.static(`${process.cwd()}/public`, { maxAge: '1h' }));

        this.#app.all('*', createRequestHandler({
            build: serverBuild,
            mode: process.env.NODE_ENV
        }));

        Logger.info(`[SERVER] Loaded Remix Server Build`);
    }
}

/**
 * Export the server class
 * @ignore
 */
module.exports = Server;
