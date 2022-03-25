/**
 * Import base packages
 */
const deepmerge = require('deepmerge');

/**
 * Check if we are using the dev version
 */
const dev = process.env.NODE_ENV !== 'production';

/**
 * Define base config
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
 * Builds the config and then returns it
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
 */
module.exports = Config();
