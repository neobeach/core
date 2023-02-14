/**
 * Import vendor modules
 */
const {DataTypes} = require('sequelize');

/**
 * Define the Group model
 *
 * @param db
 */
module.exports = (db) => {
    db.define('Group', {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'groups'
    });
};
