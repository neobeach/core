/**
 * Import vendor modules
 * @ignore
 */
const {Router} = require('express');

/**
 * Import own modules
 * @ignore
 */
const Logger = require('./Logger');
const Status = require('./Status');

class Controller {
    /**
     * Controller name used for internal logs
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @type {string}
     */
    name = '';

    /**
     * Express router instance used by the Express server
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @type {Router}
     */
    router = Router();

    /**
     * Array of routes which to implement within Express
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @type {array.<object>}
     */
    routes = [];

    /**
     * Controller class
     *
     * @class Controller
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} name - Name of the Controller
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.get('/', [], (req, res) => {
     *     res.json(1000, {
     *         hello: 'world!'
     *     });
     * });
     */
    constructor(name) {
        // Check if a name string is given
        if(typeof name !== 'string' && name !== '') {
            throw new Error(`A Controller must be named. Got: ${name}`);
        }

        // Set the Controller name
        this.name = name;
    }

    /**
     * Internal override functions of the Express Response Object
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param res - Express Response Object
     * @return {{res, badRequest: badRequest, created: (function(): *), forbidden: forbidden, paymentRequired: paymentRequired, xml: xml, unauthorized: unauthorized, json: json, html: html, notFound: notFound, tooManyRequests: tooManyRequests, text: text, render: render, conflict: conflict}}
     */
    #response(res) {
        return {
            res: res,
            render: (view, params = {}) => {
                res.render(view, params);
            },
            text: (text) => {
                res.set('Content-Type', 'text/plain');
                res.status(200).send(text);
            },
            html: (html) => {
                res.set('Content-Type', 'text/html');
                res.status(200).send(html);
            },
            json: (code, json) => {
                res.set('Content-Type', 'application/json');
                res.status(200).send(JSON.stringify({
                    status: Status(code),
                    data: json
                }));
            },
            xml: (xml) => {
                res.set('Content-Type', 'application/xml');
                res.status(200).send(xml);
            },
            created: () => {
                return res.sendStatus(201);
            },
            badRequest: () => {
                res.set('Content-Type', 'text/plain');
                res.status(400).send('Bad Request');
            },
            unauthorized: () => {
                res.set('Content-Type', 'text/plain');
                res.status(401).send('Unauthorized');
            },
            paymentRequired: () => {
                res.set('Content-Type', 'text/plain');
                res.status(402).send('Payment Required');
            },
            forbidden: () => {
                res.set('Content-Type', 'text/plain');
                res.status(403).send('Forbidden');
            },
            notFound: () => {
                res.set('Content-Type', 'text/plain');
                res.status(404).send('Not Found');
            },
            conflict: () => {
                res.set('Content-Type', 'text/plain');
                res.status(409).send('Conflict');
            },
            tooManyRequests: () => {
                res.set('Content-Type', 'text/plain');
                res.status(429).send('Too Many Requests');
            }
        }
    }

    /**
     * Add a new middleware to the Internal Controller's Express Router
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the middleware function to
     * @param {function(*, *, *)} middleware - An Express middleware function
     */
    #addMiddleware(path, middleware) {
        this.router.use(path, middleware);
    }

    /**
     * Add a new route to the Internal Controller's Express Router
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} method - The HTTP method used by Express
     * @param {string} path - A path to bind the handler function to
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     */
    #addRoute(method, path, handler) {
        this.router[method](path, (req, res) => handler(req, this.#response(res)));
    }

    /**
     * Add a new route and middlewares to the controller
     *
     * @access private
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} method - The HTTP method used by Express
     * @param {string} path - A path to bind the handler function to
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     */
    #add(method, path, handler, middlewares) {
        // Check if we have a method string
        if(typeof method !== "string") {
            throw new Error(`Missing method string!`);
        }

        // Check if we have a path string
        if(typeof path !== "string") {
            throw new Error(`Missing path string!`);
        }

        // Check if we have a handler function
        if(typeof handler !== "function") {
            throw new Error(`Missing handler function!`);
        }

        // Check if we have a middleware array
        if(!Array.isArray(middlewares)) {
            throw new Error(`Missing middleware array!`);
        }

        // Add all middlewares to the controller
        middlewares.forEach((middleware) => {
            this.#addMiddleware(path, middleware);
        });

        // Add the route to the controller
        this.#addRoute(method, path, handler);

        // Add the route itself for reference to the routes array
        this.routes.push({
            path,
            method,
            handler,
            middlewares
        });
    }

    /**
     * Get the internal Express Router
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} routerName - Parent Router name. Used to logging
     * @ignore
     */
    getRouter(routerName) {
        // Check if we have routes available
        if(this.routes.length === 0) {
            Logger.warn(`[CONTROLLER] ${routerName}/${this.name} is initialized without routes!`);
        }

        // Return internal Express Router
        return this.router;
    }

    /**
     * Add a GET route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.get('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    get(path, middlewares, handler) {
        this.#add('get', path, handler, middlewares);
    }

    /**
     * Add a POST route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.post('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    post(path, middlewares, handler) {
        this.#add('post', path, handler, middlewares);
    }

    /**
     * Add a PUT route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.put('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    put(path, middlewares, handler) {
        this.#add('put', path, handler, middlewares);
    }

    /**
     * Add a PATCH route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.patch('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    patch(path, middlewares, handler) {
        this.#add('patch', path, handler, middlewares);
    }

    /**
     * Add a DELETE route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.delete('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    delete(path, middlewares, handler) {
        this.#add('delete', path, handler, middlewares);
    }

    /**
     * Add a COPY route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.copy('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    copy(path, middlewares, handler) {
        this.#add('copy', path, handler, middlewares);
    }

    /**
     * Add a HEAD route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.head('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    head(path, middlewares, handler) {
        this.#add('head', path, handler, middlewares);
    }

    /**
     * Add a OPTIONS route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.options('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    options(path, middlewares, handler) {
        this.#add('options', path, handler, middlewares);
    }

    /**
     * Add a PURGE route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.purge('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    purge(path, middlewares, handler) {
        this.#add('purge', path, handler, middlewares);
    }

    /**
     * Add a LOCK route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.lock('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    lock(path, middlewares, handler) {
        this.#add('lock', path, handler, middlewares);
    }

    /**
     * Add a UNLOCK route to the Controller
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the handler function to
     * @param {array.<function(*, *, *)>} middlewares - An array of Middlewares
     * @param {function(*, *)} handler - A handler function that handles the incoming HTTP request
     *
     * @example
     * const {Controller} = require('@neobeach/core');
     * const controller = new Controller('IndexController');
     *
     * controller.unlock('/', [], (req, res) => {
     *     // Custom handler code here
     * });
     */
    unlock(path, middlewares, handler) {
        this.#add('unlock', path, handler, middlewares);
    }
}

/**
 * Export the Controller class
 * @ignore
 */
module.exports = Controller;
