/**
 * Import vendor modules
 */
const {DataTypes} = require('sequelize');

/**
 * Define the User model
 *
 * @param db
 */
module.exports = (db) => {
    db.define('User', {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        firstName: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        lastName: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.lastName}`;
            },
            set() {
                throw new Error('Do not try to set the `fullName` value!');
            }
        }
    }, {
        tableName: 'users'
    });
};
