/**
 * Import vendor modules
 * @ignore
 */
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
     * @param {array.<function(*, *, *)>} middlewares - An array with Express middleware functions
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
     */
    loadRouters(routers) {
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

                Logger.info(`[SERVER] Loaded ${routes.length} router(s)`);
            } else {
                console.error('Error at line:', router);
                throw new Error(`Class is not an instance of '@neobeach/core/Router'!`);
            }
        });
    }

    /**
     * Includes/loads default express body parsers (json, text and urlencoded) with recommended config into the Express app
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     */
    includeDefaultBodyParsers() {
        this.#app.use(express.json());
        this.#app.use(express.text());
        this.#app.use(express.urlencoded({extended: false}));

        Logger.info(`[SERVER] Loaded default body parsers (json, text and urlencoded)`);
    }

    /**
     * Attach a Remix Framework build to our Express server
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {*} serverBuild - A Remix Server build
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
