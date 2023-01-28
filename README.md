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
The current version of the core is build/tested on the following dependency versions:
```text
node: "18.13.0"
npm: "8.5.0"

@remix-run/express: "1.3.4"
compression: "1.7.4"
cors: "2.8.5"
deepmerge: "4.2.2"
express: "4.18.2"
helmet: "6.0.1"
js-logger: "1.6.1"
node-fetch: "2.6.8"
```

## Config
Some default application config is already for you defined and can be overridden in your `config/default.json` or `config/config.json`:

```javascript
const dev = process.env.NODE_ENV !== 'production';

const baseConfig = {
    application: {
        env: dev,
        host: '0.0.0.0',
        port: 3000,
        node: 18
    },
    logger: {
        level: 'DEBUG'
    }
};
```

### Usage
Below you will find an example on how to access config elements:
```javascript
const {Config} = require('@neobeach/core');

console.log('config', config);
console.log('config.application.host', config.application.host);
```

### Config Order
There are multiple config files available for you to use. These are merged in the following order and have a particular role:

```text
Config.js    <-- Base config provided by the Core.
default.json <-- Lives inside a project and is checked into GIT. This config is therefore available on all environments.
config.json  <-- Lives inside a project and is not checked into GIT. The config is therefore environment specific.
```

### Config Location
The Core will by default expect a `config` directory from the point where you initialize the application.
Your project layout would then be:
```text
example/                 <-- Project Root
  config/                <-- Application config (Required)
    config.json          <-- Environment specific config, normally not stored within GIT (Required)
    default.json         <-- Application specific config, normally stored in GIT (Required)
  package.json           <-- Contains all your project dependency information (Required)
  server.js              <-- Main entry file for the application, this initializes the Core and binds for example additional Routers or middlewares (Required)
```

In this case your entry point would be the server.js file

However, it may be required to change this. Let's pretend the app is one folder deeper then the entry file.
Your project layout would then be:
```text
example/                 <-- Project Root
  app/                   <-- App Root
    config/              <-- Application config (Required)
      config.json        <-- Environment specific config, normally not stored within GIT (Required)
      default.json       <-- Application specific config, normally stored in GIT (Required)
  package.json           <-- Contains all your project dependency information (Required)
  server.js              <-- Main entry file for the application, this initializes the Core and binds for example additional Routers or middlewares (Required)
```

In this case your entry point would be the server.js file, but the config folder is inside the `app/config folder`

To ensure the application knows about this we can override an environment variable like this:
```text
CONFIG_DIR=/app/config/
```

## Logging
The Core logger can be imported at any moment. This can be used to output logs to the console.
The following functions will be available to log to the console accordingly to the log level that can be set inside the config:

```javascript
const {Logger} = require('@neobeach/core');

Logger.trace('This is a message'); // Outputs a log within the trace, debug, info, warn and error log-level with stacktrace
Logger.debug('This is a message'); // Outputs a log within the debug, info, warn and error log-levels
Logger.info('This is a message');  // Outputs a log within the info, warn and error log-levels
Logger.warn('This is a message');  // Outputs a log within the warn and error log-levels
Logger.error('This is a message'); // Outputs a log within the error log-level
```

### Log Level
The application default log level is `TRACE`, valid options are: `TRACE`, `DEBUG`, `INFO`, `WARN` and `ERROR`.
You can change the log level by updating the application config:
```json
{
  "logger": {
    "level": "TRACE"
  }
}
```

## Middlewares and Functions
Below is an overview of all main Server/Core functions:
```javascript
server.loadMiddlewares(middlewares);    // Load global middlewares into the Express app
server.loadRouters(routers);            // Load routers into the Express app
server.loadStatic(directory, prefix);   // Serves a static directory from the Express app

server.setParameter(name, value);       // Sets an Express app parameter

server.includeDefaultBodyParsers();     // Includes/loads default express body parsers (json, text and urlencoded) with recommended config into the Express app
server.includeDefaultSecurityHeaders(); // Includes/loads default security headers with recommended config into the Express app
server.includeDefaultCorsHeaders();     // Includes/loads default CORS headers with recommended config into the Express app
server.includeDefaultCompression();     // Includes/loads default compression (deflate, gzip) with recommended config into the Express app

server.loadRemixFramework(serverBuild); // Attach a Remix Framework build to our Express server

server.run();                           // Starts the Express server
```

## Healthcheck
On creation of a new Server, every express instance will contain a simple healthcheck.
This healthcheck can be accessed via the `/_health` url, and reports back some basic application information.
An example of the response can be found here:

```json
{
  "status": "UP",
  "host": "gHAUVLQsWff7BkRR",
  "core": "1.0.0",
  "load": {
    "user": 240214,
    "system": 60369
  },
  "mem": {
    "rss": 45084672,
    "heapTotal": 19812352,
    "heapUsed": 10697488,
    "external": 2473177,
    "arrayBuffers": 85876
  },
  "uptime": 1.839386098
}
```

> To ensure a fast response time, the healthcheck is initialized before any other middleware. This also keeps the logs free from clutter.

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
