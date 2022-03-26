class Router {
    /**
     * Router name used for internal logs
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
     * Router class
     *
     * @class Router
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} name - Name of the Router
     *
     * @example
     * const {Router} = require('@neobeach/core');
     * const IndexController = require('./IndexController');
     *
     * const router = new Router('Api');
     * router.add('/api', IndexController);
     *
     * module.exports = router;
     */
    constructor(name) {
        // Check if a name string is given
        if(typeof name !== 'string' && name !== '') {
            throw new Error(`A Router must be named. Got: ${name}`);
        }

        // Set the Router name
        this.name = name;
    }

    /**
     * Binds a controller to a path within an Express Router
     *
     * @access public
     * @since 1.0.0
     * @author Glenn de Haan
     * @copyright MIT
     *
     * @param {string} path - A path to bind the controller to
     * @param {*} controller - A Controller class reference
     * @param {array.<function(*, *, *)>} [middlewares] - An array of middleware functions
     */
    add(path, controller, middlewares = []) {
        // Check if a path string is given
        if(typeof path !== 'string') {
            throw new Error(`Route path is not a string! Got: ${path}`);
        }

        // Check if we have a middleware array
        if(!Array.isArray(middlewares)) {
            throw new Error(`Missing middleware array or invalid middleware array!`);
        }

        // Add the route to routes array
        this.routes.push({
            path,
            controller,
            middlewares
        });
    }
}

/**
 * Export the Router class
 * @ignore
 */
module.exports = Router;
