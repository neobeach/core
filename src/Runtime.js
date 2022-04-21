/**
 * Import vendor modules
 * @ignore
 */
const os = require('os');
const dns = require('dns').promises;
const fetch = require('node-fetch');

/**
 * Import own modules
 * @ignore
 */
const Logger = require('./Logger');
const Config = require('./Config');

/**
 * Preflight function
 *
 * @access private
 * @since 1.0.0
 * @author Glenn de Haan
 * @copyright MIT
 */
const preflight = async () => {
    const nodeVersionRequirement = Config.application.node;
    const nodeVersion = process.versions['node'];
    const packageInformation = require(__dirname + '/../package.json');

    // Check if we can access the internet
    let internet = false;
    const pingGoogle = await dns.lookup('google.com').catch(() => {});
    if(pingGoogle) {
        internet = true;
    }

    // Get all local network card IP's
    const cards = os.networkInterfaces();
    const networks = [];
    for (const name of Object.keys(cards)) {
        for (const net of cards[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                networks.push(net.address);
            }
        }
    }

    const seperator = '+----------------------------------------- @neobeach/core -----------------------------------------+';
    const outputLines = [
        {
            text:  `Core Version: ${packageInformation.version}`,
            color: `Core Version: \u001b[36m${packageInformation.version}\u001b[0m`
        },
        {
            text:  `Node Version: ${nodeVersion}`,
            color: `Node Version: \u001b[32m${nodeVersion}\u001b[0m`
        },
        {
            text:  `Host:         ${os.hostname()} (${os.cpus().length} Core(s) - ${(os.totalmem() / 1073741824).toFixed(2)} GB Memory)`,
            color: `Host:         ${os.hostname()} (${os.cpus().length} Core(s) - ${(os.totalmem() / 1073741824).toFixed(2)} GB Memory)`
        },
        {
            text:  `Platform:     ${process.platform} - ${os.release()} (${process.arch})`,
            color: `Platform:     \u001b[33m${process.platform}\u001b[0m - ${os.release()} (${process.arch})`
        },
        {
            text:  `Internet:     ${internet ? 'AVAILABLE' : 'NOT AVAILABLE'} - ${networks.join(',')}`,
            color: `Internet:     ${internet ? '\u001b[32mAVAILABLE\u001b[0m' : '\u001b[31mNOT AVAILABLE\u001b[0m'} - ${networks.join(',')}`
        }
    ];

    // Output preflight
    console.log(seperator);
    outputLines.forEach((line) => {
        console.log(`| ${line.color}${new Array(((seperator.length - 4) - line.text.length) + 1).join(' ')} |`);
    });
    console.log(seperator);
    console.log('');

    // Check if the NodeJS version requirement is met
    if(parseInt(nodeVersion.split('.')[0]) !== nodeVersionRequirement) {
        console.error(`[NODE] Incorrect version running! Node ${nodeVersionRequirement} required!`);
        process.exit(1);
    }

    // Check if package updates are available after we know we have internet
    if(internet) {
        const core = await fetch('https://registry.npmjs.org/-/package/@neobeach/core/dist-tags');

        if(core.status === 200) {
            const coreJson = await core.json();
            const npmVersion = coreJson.latest;

            if(npmVersion !== packageInformation.version) {
                console.log('\u001b[33m!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Warning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\u001b[0m');
                console.log(' You are running an outdated version of the @neobeach/core package, Please update soon !');
                console.log('');
                console.log(` Installed version: \u001b[33m${packageInformation.version}\u001b[0m`);
                console.log(` Available version: \u001b[32m${npmVersion}\u001b[0m`);
                console.log('\u001b[33m!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Warning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\u001b[0m');
                console.log('');
            }
        }
    }
}

/**
 * Creates a user runtime/sandbox that monitors a users code, and kills the process is necessary
 *
 * @module Runtime
 * @access public
 * @since 1.0.0
 * @author Glenn de Haan
 * @copyright MIT
 *
 * @param {function} sandbox - A sandbox function that is monitored by the Runtime module
 * @example
 * const {Runtime, Server} = require('@neobeach/core');
 *
 * Runtime(() => {
 *    // Include your own code here
 *    server.run();
 * });
 */
const Runtime = async (sandbox) => {
    // Catch unhandled promise rejections
    process.on('unhandledRejection', err => {
        Logger.error('[RUNTIME] Unhandled Rejection found!:');
        Logger.error(err);
        process.exit(1);
    });

    // Catch unhandled exceptions
    process.on('uncaughtException', err => {
        Logger.error('[RUNTIME] Uncaught Exception found!:');
        Logger.error(err);
        process.exit(1);
    });

    // Run the Runtime Preflight
    await preflight();

    // Start a users runtime
    sandbox();
}

/**
 * Exports the Runtime module
 * @ignore
 */
module.exports = Runtime;
