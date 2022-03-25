/**
 * Import vendor modules
 */
const express = require('express');

/**
 * Import own modules
 */
const log = require('./Logger');
const config = require('./Config');
const Router = require('./Router');

/**
 * Server class
 */
class Server {
    /**
     * Setup an internal express app
     *
     * @type {*|Express}
     * @private
     */
    #app = express();

    /**
     * Configure the express host
     *
     * @private
     */
    #host;

    /**
     * Configure the express port
     *
     * @private
     */
    #port;

    /**
     * Initialize the server
     */
    constructor() {
        /**
         * Set the host
         *
         * @type {number}
         */
        this.#host = config.application.host;

        /**
         * Set the port number
         *
         * @type {number}
         */
        this.#port = config.application.port;

        /**
         * Trust proxy
         */
        this.#app.enable('trust proxy');

        /**
         * Disable powered by header for security reasons
         */
        this.#app.disable('x-powered-by');

        /**
         * Handle Google Cloud Loadbalancer requests (If the app try's to redirect from /)
         */
        this.#app.use((req, res, next) => {
            if (req.get('User-Agent') === 'GoogleHC/1.0') {
                return res.send('Hello Google');
            }

            next();
        });

        /**
         * Expose core specific headers
         */
        this.#app.use((req, res, next) => {
            const packageInformation = require(__dirname + '/../package.json');
            res.set('X-Neo-Beach', 'true');
            res.set('X-Neo-Beach-Core', packageInformation.version);

            next();
        });
    }

    /**
     * Start the server
     *
     * @returns {http.Server}
     */
    run() {
        return this.#app.listen(this.#port, this.#host, () => {
            log.info(`[NODE] Service started with success! App running at: ${this.#host}:${this.#port}`)
        });
    }

    /**
     * Load middlewares into the Express app
     *
     * @param middleware
     */
    loadMiddlewares(middleware) {
        // global stuff like cors, body-parser, etc
        middleware.forEach(mw => {
            this.#app.use(mw);
        });
    }

    /**
     * Load routers into the Express app
     *
     * @param routers
     */
    loadRouters(routers) {
        routers.forEach(router => {
            if(router.prototype instanceof Router) {
                const routerObj = new router();
                const routes = routerObj.setControllers();

                routes.forEach(route => {
                    // Add all middlewares for every route
                    for (const mw of route.middlewares) {
                        this.#app.use(route.path, mw);
                    }

                    // Add the router from the controller
                    this.#app.use(route.path, route.controller.setRoutes());
                });
            } else {
                console.error('Error at line:', router);
                throw new Error(`Class is not an instance of '@neobeach/core/Router'!`);
            }
        });
    }

    /**
     * Includes default express body parsers (json, text and urlencoded) with recommended config
     */
    includeDefaultBodyParsers() {
        this.#app.use(express.json());
        this.#app.use(express.text());
        this.#app.use(express.urlencoded({extended: false}));
    }

    /**
     * Attach the remix build to our Express server
     *
     * @param serverBuild
     */
    attachRemix(serverBuild) {
        const {createRequestHandler} = require("@remix-run/express");

        this.#app.use("/build", express.static(`${process.cwd()}/public/build`, { immutable: true, maxAge: "1y" }));
        this.#app.use(express.static(`${process.cwd()}/public/build`, { maxAge: "1h" }));
        this.#app.use(express.static(`${process.cwd()}/public`, { maxAge: "1h" }));

        this.#app.all('*', createRequestHandler({
            build: serverBuild,
            mode: process.env.NODE_ENV
        }));
    }
}

/**
 * Export the server class
 */
module.exports = Server;
