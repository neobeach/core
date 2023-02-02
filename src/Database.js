/**
 * Import vendor modules
 * @ignore
 */
const {Sequelize} = require('sequelize');

/**
 * Import own modules
 * @ignore
 */
const Logger = require('./Logger');
const Config = require('./Config');

/**
 * Create Sequelize ORM
 *
 * @access private
 * @since 2.2.0
 * @author Glenn de Haan
 * @copyright MIT
 *
 * @type {Sequelize}
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${process.cwd()}/db.sqlite`,
    logging: (msg) => Logger.debug(`[DB] ${msg}`),
    ...Config.database
});

/**
 * Initialize the database connection, connects models to Sequelize and syncs them
 *
 * @module Database
 * @access public
 * @since 2.2.0
 * @author Glenn de Haan
 * @copyright MIT
 *
 * @param {array} models - An array that contains Sequelize models
 * @param {boolean} sync - Sync models to database on initialize
 *
 * @see https://sequelize.org/docs/v6/core-concepts/model-basics/
 * @see https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
 *
 * @returns {Promise<void>}
 *
 * @example
 * const {Runtime, db} = require('@neobeach/core');
 *
 * const User = require('./models/User');
 *
 * Runtime(async () => {
 *    // Include your own code here
 *    await db.init([User]);
 * });
 */
const init = async (models = [], sync = true) => {
    return new Promise(async (resolve) => {
        // Setup database connection
        await sequelize.authenticate().catch((e) => {
            Logger.error(e);
            Logger.error('[DB] Unable to connect to the database!');
            process.exit(1);
        });

        // Output connection info
        if(Config.database.dialect === 'sqlite') {
            Logger.info(`[DB] Connection successful: ${Config.database.dialect}://${process.cwd()}/db.sqlite`);
        } else {
            Logger.info(`[DB] Connection successful: ${Config.database.dialect}://${Config.database.username}:${Config.database.password}@${Config.database.host}:${Config.database.port}/${Config.database.database}`);
        }

        // Initialize models
        models.forEach((model) => {
            model(sequelize);
        });

        // Sync models to database
        if(sync) {
            await sequelize.sync({alter: true}).catch((e) => {
                Logger.error(e);
                Logger.error('[DB] Unable to sync models!');
                process.exit(1);
            });

            Logger.info(`[DB] All models where synchronized successfully!`);
        }

        resolve();
    });
}

/**
 * Export the database connection with init function
 * @ignore
 *
 * @type {Sequelize}
 */
module.exports = {...sequelize, init};
