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
        port: 3000
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
 * @returns {object}
 */
const Config = () => {
    try {
        return deepmerge(
            baseConfig,
            deepmerge(
                require(dev ? process.cwd() + '/config/default.json' : process.cwd() + '/build/default.json'),
                eval('require')(dev ? process.cwd() + '/config/config.json' : process.cwd() + '/build/config.json')
            )
        );
    } catch (e) {
        console.error(
            `[CONFIG] Does not exist! Location: ${
                dev ? process.cwd() + '/config/config.json' : process.cwd() + '/config.json'
            }`
        );
        console.error(e);
        process.exit(1);
    }
};

/**
 * Export the config
 * @ignore
 */
module.exports = Config();
