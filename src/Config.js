/**
 * Import base packages
 * @ignore
 */
const deepmerge = require('deepmerge');

/**
 * Check if we are using the dev version
 * @ignore
 */
const dev = process.env.NODE_ENV !== 'production';

/**
 * Optional config directory for project who have a deeper config dir stacking
 * @type {string}
 * @ignore
 */
const configDir = process.env.CONFIG_DIR || '';

/**
 * Define base config
 *
 * @access private
 * @since 1.0.0
 * @author Glenn de Haan
 * @copyright MIT
 *
 * @type {{application: {port: number, host: string, env: boolean}, logger: {level: string}}}
 */
const baseConfig = {
    application: {
        env: dev,
        host: '0.0.0.0',
        port: 3000,
        node: 14
    },
    logger: {
        level: 'DEBUG'
    }
};

/**
 * Builds/merges the config and then returns it as an array
 *
 * @module Config
 * @access public
 * @since 1.0.0
 * @author Glenn de Haan
 * @copyright MIT
 *
 * @see https://www.npmjs.com/package/deepmerge
 *
 * @returns {object}
 *
 * @example
 * const {Config} = require('@neobeach/core');
 * console.log('Config.application.port', Config.application.port);
 */
const Config = () => {
    try {
        return deepmerge(
            baseConfig,
            deepmerge(
                require(dev ? process.cwd() + configDir + '/config/default.json' : process.cwd() + configDir + '/build/default.json'),
                eval('require')(dev ? process.cwd() + configDir + '/config/config.json' : process.cwd() + configDir + '/build/config.json')
            )
        );
    } catch (e) {
        console.error(`[CONFIG] Unable to load!`);
        console.error(e);
        process.exit(1);
    }
};

/**
 * Export the config
 * @ignore
 */
module.exports = Config();
