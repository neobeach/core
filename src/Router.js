/**
 * Import vendor modules
 */
const Logger = require('./Logger');
const Controller = require('./Controller');

/**
 * Router class
 */
class Router {
    /**
     * Array of objects which to implement
     *
     * @type {{}}
     */
    routes = [];

    /**
     * Sets the routes with controllers
     *
     * @returns [{}]
     */
    setControllers = () => {
        // Check if we have routes available
        if(this.routes.length === 0) {
            Logger.warn('Router is initialized without routes!');
        }

        // Array with objects that holds all initialized controllers
        const controllers = [];

        // Loop over all routes
        this.routes.forEach(route => {
            // Check if a path string is given
            if(typeof route.path !== "string") {
                console.error('Error at line:', route);
                throw new Error(`Route path is not a string! Got: ${JSON.stringify(route)}`);
            }

            // Check if the object has a middleware array
            if(!Array.isArray(route.middlewares)) {
                console.error('Error at line:', route);
                throw new Error(`Missing middleware array!`);
            }

            // Check if the controller extends our base controller
            if(route.controller.prototype instanceof Controller) {
                controllers.push({
                    path: route.path,
                    controller: new route.controller(),
                    middlewares: route.middlewares
                });
            } else {
                console.error('Error at line:', route);
                throw new Error(`Class is not an instance of '@neobeach/core/Controller'!`);
            }
        });

        // Return all initialized controllers
        return controllers;
    }
}

/**
 * Export the Router class
 */
module.exports = Router;
