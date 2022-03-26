/**
 * Import vendor modules
 */
const {Router} = require('@neobeach/core');

/**
 * Import own modules
 */
const IndexController = require('../controllers/IndexController');

/**
 * Initialize new Router
 */
const router = new Router('Api');

/**
 * Add routes to router
 */
router.add('/api', IndexController);

/**
 * Exports the Api router
 */
module.exports = router;
