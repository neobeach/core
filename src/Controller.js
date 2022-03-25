/**
 * Import vendor modules
 */
const {Router} = require('express');

/**
 * Import own modules
 */
const Logger = require('./Logger');
const Status = require('./Status');

/**
 * Controller class
 */
class Controller {
    /**
     * Express router instance for mapping routes
     *
     * @type {Router}
     */
    router = Router();

    /**
     * Array of objects which to implement into the router
     *
     * @type {{}}
     */
    routes = [];

    /**
     * Router methods available
     *
     * @type {Readonly<{HEAD: string, DELETE: string, PURGE: string, POST: string, GET: string, LOCK: string, COPY: string, OPTIONS: string, PUT: string, PATCH: string, UNLOCK: string}>}
     */
    methods = Object.freeze({
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        PATCH: 'PATCH',
        DELETE: 'DELETE',
        COPY: 'COPY',
        HEAD: 'HEAD',
        OPTIONS: 'OPTIONS',
        PURGE: 'PURGE',
        LOCK: 'LOCK',
        UNLOCK: 'UNLOCK'
    });

    /**
     * Handles all request handler responses
     *
     * @param res
     * @returns {{res, badRequest: badRequest, created: (function(): *), forbidden: forbidden, paymentRequired: paymentRequired, xml: xml, unauthorized: unauthorized, json: json, html: html, notFound: notFound, tooManyRequests: tooManyRequests, text: text, conflict: conflict}}
     */
    response(res) {
        return {
            res: res,
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
     * Adds all routes from a controller to the router instance
     *
     * @returns {Router}
     */
    setRoutes = () => {
        // Check if we have routes available
        if(this.routes.length === 0) {
            Logger.warn('Controller is initialized without routes!');
        }

        // Set HTTP method, middleware, and handler for each route
        // Returns Router object, which we will use in Server class
        for (const route of this.routes) {
            // Check if the object has a path string
            if(typeof route.path !== "string") {
                console.error('Error at line:', route);
                throw new Error(`Missing path string!`);
            }

            // Check if the object has a handler function
            if(typeof route.handler !== "function") {
                console.error('Error at line:', route);
                throw new Error(`Missing handler function!`);
            }

            // Check if the object has a middleware array
            if(!Array.isArray(route.middlewares)) {
                console.error('Error at line:', route);
                throw new Error(`Missing middleware array!`);
            }

            // Add all middlewares for every route
            for (const mw of route.middlewares) {
                this.router.use(route.path, mw);
            }

            // Implement all route handlers
            switch (route.method) {
                case 'GET':
                    this.router.get(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'POST':
                    this.router.post(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'PUT':
                    this.router.put(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'PATCH':
                    this.router.patch(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'DELETE':
                    this.router.delete(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'COPY':
                    this.router.copy(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'HEAD':
                    this.router.head(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'OPTIONS':
                    this.router.options(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'PURGE':
                    this.router.purge(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'LOCK':
                    this.router.lock(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                case 'UNLOCK':
                    this.router.unlock(route.path, (req, res) => route.handler(req, this.response(res)));
                    break;
                default:
                    // Throw exception
                    console.error('Error at line:', route);
                    throw new Error(`Incorrect method supplied!`);
            }
        }

        // Return router instance (will be usable in Server class)
        return this.router;
    }
}

/**
 * Export the Controller class
 */
module.exports = Controller;
