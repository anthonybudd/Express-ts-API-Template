import sequelize from '../providers/db';
import * as Sequelize from 'sequelize';
import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';


interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: String,
    email: String,
    password: string,
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

const User = sequelize.define<UserModel>('User', {
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


export default User;

export {
    UserModel,
    User,
};
