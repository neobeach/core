/**
 * Import vendor modules
 */
const {Controller, config, db} = require('@neobeach/core');

/**
 * Initialize new Controller
 */
const controller = new Controller('IndexController');

/**
 * Add routes to controller
 */
controller.get('/', [], async (req, res) => {
    const userCount = await db.models.User.count();
    console.log('userCount', userCount);
    console.log('config', config);
    res.json(1000, {
        hello: 'world!'
    });
});

/**
 * Exports the IndexController
 */
module.exports = controller;
