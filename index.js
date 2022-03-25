/**
 * Import own modules
 */
const Config = require('./src/Config');
const Logger = require('./src/Logger');
const Controller = require('./src/Controller');
const Router = require('./src/Router');
const Server = require('./src/Server');
const Runtime = require('./src/Runtime');

/**
 * Export all modules
 */
module.exports = {Config, config: Config, Logger, log: Logger, Controller, Router, Server, Runtime};
