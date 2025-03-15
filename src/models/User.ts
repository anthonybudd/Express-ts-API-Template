import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../providers/db';
import { DataTypes } from 'sequelize';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string   
 *         lastName:
 *           type: string
 *         bio:
 *           type: string
 *         emailVerified:
 *           type: boolean
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 */

interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: CreationOptional<string>,

    email: string,
    password: string,

    mfaRequired: CreationOptional<boolean>,
    mfaEnabled: CreationOptional<boolean>,
    mfaSecret: CreationOptional<string> | null,

    firstName: string,
    lastName: CreationOptional<string> | null,
    tos: CreationOptional<string> | null,
    bio: CreationOptional<string> | null,

    inviteKey: CreationOptional<string> | null,
    passwordResetKey: CreationOptional<string> | null,
    emailVerificationKey: CreationOptional<string> | null,
    emailVerified: CreationOptional<boolean>,
    lastLoginAt: CreationOptional<string>,
}

const User = sequelize.define<UserModel>('user', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    mfaRequired: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.mfaEnabled && this.mfaSecret === null;
        },
    },
    mfaEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    mfaSecret: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
    },
    bio: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
    },

    tos: DataTypes.STRING,
    inviteKey: DataTypes.STRING,
    passwordResetKey: DataTypes.STRING,
    emailVerificationKey: DataTypes.STRING,
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },

    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Users',
    defaultScope: {
        attributes: {
            exclude: [
                'password',
                'mfaEnabled',
                'mfaSecret',
                'passwordResetKey',
                'emailVerificationKey',
                'inviteKey',
            ]
        }
    },
    scopes: {
        mfa: {
            attributes: {
                include: [
                    'id',
                    'email',
                    'mfaRequired',
                    'mfaEnabled',
                    'mfaSecret'
                ],
            }
        }
    }
});

export default User;

export {
    UserModel,
    User,
};
