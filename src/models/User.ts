import db from '../providers/db';
import * as Sequelize from 'sequelize';
import { Table, Model } from 'sequelize-typescript';

interface UserAttributes {
    id: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    bio: String,
    tos: String,
    inviteKey: String,
    passwordResetKey: String,
    emailVerificationKey: String,
    emailVerified: String,
    lastLoginAt: String,
}

interface UserCreationAttributes extends Sequelize.Optional<UserAttributes, 'id'> { }

@Table
class User extends Model<UserAttributes, UserCreationAttributes> { }

User.init({
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: Sequelize.STRING,

    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    bio: Sequelize.TEXT,

    tos: Sequelize.STRING,
    inviteKey: Sequelize.STRING,
    passwordResetKey: Sequelize.STRING,
    emailVerificationKey: Sequelize.STRING,
    emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },

    lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    sequelize: db,
    tableName: 'Users',
    defaultScope: {
        attributes: {
            exclude: [
                'password',
                'passwordResetKey',
            ]
        }
    },
});

const UserModel = sequelize.define<UserModel>('User', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
    },
    name: {
        type: DataTypes.STRING,
    },
});


export default User;

export {
    UserAttributes,
    UserCreationAttributes,
    User
};
