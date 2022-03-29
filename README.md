# neobeach/core

Base web framework based on the popular ExpressJS package

## Why?
The neobeach/core package aims to provide a base webserver application structure based on the popular Express.JS package.
The Core also provides some ready to go implementations for implementing useful and ready-to-go middlewares and frameworks.
We also implement a basic MVC structure that only consists of the Routers and Controllers, after that you are free to either continue your business logic in the Controller or for example go into Services, Repositories, Models or Utils.

The Core is completely modular, this means that we only install the dependencies we really need. As soon as you implement a feature that requires another dependency we just simply ask you to install that within your project.
This keeps the amount of dependencies to a minimum, and the overall package size small. Making it perfect for container architecture

## Project Structure
Here you will find an example application folder structure, this also explains which files are required:
```text
example/                 <-- Project Root
  config/                <-- Application config (Required)
    config.json          <-- Environment specific config, normally not stored within GIT (Required)
    default.json         <-- Application specific config, normally stored in GIT (Required)
  controllers/           <-- Contains all application Controllers (Optional, Technically you can store them everywhere but we do recommend creating a folder for it)
    api/                 <-- Contains all Api controllers (Optional)
      IndexController.js <-- Contains all Index/Home handlers for the Api controller (Optional)
    web/                 <-- Contains all Web controllers (Optional)
      IndexController.js <-- Contains all Index/Home handlers for the Web controller (Optional)
  middlewares/           <-- Contains all application Middlewares  (Optional, Technically you can store them everywhere but we do recommend creating a folder for it)
    RequestLogger.js     <-- This file exports a simple Express middleware (Optional)
  routers/               <-- Contains all application Routers (Optional, Technically you can store them everywhere but we do recommend creating a folder for it)
    Api.js               <-- Contains all Api routes and references Controllers to handle a specific sub-path (Optional)
    Web.js               <-- Contains all Web routes and references Controllers to handle a specific sub-path (Optional)
  package.json           <-- Contains all your project dependency information (Required)
  server.js              <-- Main entry file for the application, this initializes the Core and binds for example additional Routers or middlewares (Required)
```

## Versions

## Config

## Middlewares and Functions

## Example App
### server.js
Below you will find an example server.js:
```javascript
/**
 * Import modules
 */
const {Runtime, Server} = require('@neobeach/core');
const Api = require('./Api');

/**
 * Setup a new Express server
 */
const server = new Server();

/**
 * Define global middlewares
 */
const globalMiddleware = [
    (req, res, next) => {
        // Execute custom code here
        next();
    }
];

/**
 * Define custom routers
 */
const routers = [
    Api
];

/**
 * Create a runtime/sandbox to start the server in
 */
Runtime(() => {
    server.includeDefaultBodyParsers();
    server.loadMiddlewares(globalMiddleware);
    server.loadRouters(routers);
    server.run();
});
```

### Api.js
Below you will find an example Api.js:
```javascript
/**
 * Import modules
 */
const {Router} = require('@neobeach/core');
const IndexController = require('./IndexController');

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
```

### IndexController.js
Below you will find an example IndexController.js:
```javascript
/**
 * Import modules
 */
const {Controller} = require('@neobeach/core');

/**
 * Initialize new Controller
 */
const controller = new Controller('IndexController');

/**
 * Add routes to controller
 */
controller.get('/', [], (req, res) => {
    res.json(1000, {
        hello: 'world!'
    });
});

/**
 * Exports the IndexController
 */
module.exports = controller;
```

## License
MIT
