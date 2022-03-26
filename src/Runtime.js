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

/**
 * Preflight function
 *
 * @access private
 * @since 1.0.0
 * @author Glenn de Haan
 * @copyright MIT
 */
const preflight = async () => {
    const nodeVersionRequirement = 14;
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

    // Max char length for terminal
    const maxLengthString = '---------------------------------------------------------------------------------';

    // Define all base info without colors. Used for text output and char count
    const coreVersionString =        `Core Version:         ${packageInformation.version}`;
    const nodeVersionString =        `Node Version:         ${nodeVersion}`;
    const hostString =               `Host:                 ${os.hostname()} (${os.cpus().length} Core(s) - ${(os.totalmem() / 1073741824).toFixed(2)} GB Memory)`;
    const platformString =           `Platform:             ${process.platform} - ${os.release()} (${process.arch})`;
    const internetString =           `Internet:             ${internet ? 'AVAILABLE' : 'NOT AVAILABLE'} - ${networks.join(',')}`;
    const runtimeString =            `Runtime/Sandbox Init: SUCCESS`;

    // Define all colored strings if needed. Only used to text output
    const coreVersionStringColored = `Core Version:         \u001b[36m${packageInformation.version}\u001b[0m`;
    const nodeVersionStringColored = `Node Version:         \u001b[32m${nodeVersion}\u001b[0m`;
    const platformStringColored =    `Platform:             \u001b[33m${process.platform}\u001b[0m - ${os.release()} (${process.arch})`;
    const internetStringColored =    `Internet:             ${internet ? '\u001b[32mAVAILABLE\u001b[0m' : '\u001b[31mNOT AVAILABLE\u001b[0m'} - ${networks.join(',')}`;
    const runtimeStringColored =     `Runtime/Sandbox Init: \u001b[32mSUCCESS\u001b[0m`;

    // Output preflight
    console.log('+------------------------------------ Preflight ------------------------------------+');
    console.log(`| ${coreVersionStringColored}${new Array((maxLengthString.length - coreVersionString.length) + 1).join(' ')} |`);
    console.log(`| ${nodeVersionStringColored}${new Array((maxLengthString.length - nodeVersionString.length) + 1).join(' ')} |`);
    console.log(`| ${hostString}${new Array((maxLengthString.length - hostString.length) + 1).join(' ')} |`);
    console.log(`| ${platformStringColored}${new Array((maxLengthString.length - platformString.length) + 1).join(' ')} |`);
    console.log(`| ${internetStringColored}${new Array((maxLengthString.length - internetString.length) + 1).join(' ')} |`);
    console.log('+-----------------------------------------------------------------------------------+');
    console.log(`| ${runtimeStringColored}${new Array((maxLengthString.length - runtimeString.length) + 1).join(' ')} |`);
    console.log('+------------------------------------ Preflight ------------------------------------+');
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
