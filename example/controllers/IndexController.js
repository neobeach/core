/**
 * Import vendor modules
 */
const {Controller, config} = require('@neobeach/core');

/**
 * Initialize new Controller
 */
const controller = new Controller('IndexController');

/**
 * Add routes to controller
 */
controller.get('/', [], (req, res) => {
    console.log('config', config);
    res.json(1000, {
        hello: 'world!'
    });
});

/**
 * Exports the IndexController
 */
module.exports = controller;
