/**
 * Import vendor modules
 */
const {Controller, config} = require('@neobeach/core');

/**
 * Api Index Controller
 */
class IndexController extends Controller {
    routes = [
        {
            path: '/',
            method: this.methods.GET,
            handler: this.handleApi,
            middlewares: []
        },
        // Other routes...
    ];

    async handleApi(req, res) {
        console.log('config', config);
        res.json(1000, {
           hello: 'world!'
        });
    }

    // Other handlers...
}

module.exports = IndexController;
