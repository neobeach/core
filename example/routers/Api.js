/**
 * Import vendor modules
 */
const {Router} = require('@neobeach/core');

/**
 * Import own modules
 */
const IndexController = require('../controllers/IndexController');

/**
 * Api router
 */
class Api extends Router {
    routes = [
        {
            path: '/api',
            controller: IndexController,
            middlewares: []
        }
    ];
}

/**
 * Exports the Api router
 */
module.exports = Api;
