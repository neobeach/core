/**
 * Import own modules
 */
const config = require('./Config');

/**
 * Creates the logger
 *
 * @returns {{trace: function(...*), debug: function(...*), info: function(...*), warn: function(...*), error: function(...*)}}
 * @constructor
 */
const Logger = () => {
    // Import the logger package
    const Logger = require('js-logger');

    // Create a custom log handler for the console
    const consoleLogger = Logger.createDefaultHandler({
        formatter: (messages, context) => {
            // Get current date, change this to the current timezone, then generate a date-time string
            const utcDate = new Date();
            const offset = utcDate.getTimezoneOffset();
            const date = new Date(utcDate.getTime() - (offset * 60 * 1000));
            const dateTimeString = date.toISOString().replace('T', ' ').replace('Z', '');

            // Prefix each log message with a timestamp and log level
            messages.unshift(`${dateTimeString} ${context.level.name}${context.level.name === 'INFO' || context.level.name === 'WARN' ? ' ' : ''}`);
        }
    });

    // Set all logger handlers
    Logger.setHandler((messages, context) => {
        consoleLogger(messages, context);
    });

    // Set the log level
    Logger.setLevel(Logger[config.logger.level]);

    // Return the entire logger
    return Logger;
}

/**
 * Exports the default logger
 *
 * @property {function(...*)} trace - Outputs a log within the trace, debug, info, warn and error log-level with stacktrace
 * @property {function(...*)} debug - Outputs a log within the debug, info, warn and error log-levels
 * @property {function(...*)} info - Outputs a log within the info, warn and error log-levels
 * @property {function(...*)} warn - Outputs a log within the warn and error log-levels
 * @property {function(...*)} error - Outputs a log within the error log-level
 */
module.exports = Logger();
