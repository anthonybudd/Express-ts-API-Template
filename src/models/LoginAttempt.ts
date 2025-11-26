import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../providers/db';
import { DataTypes } from 'sequelize';

interface LoginAttemptModel extends Model<InferAttributes<LoginAttemptModel>, InferCreationAttributes<LoginAttemptModel>> {
    id: CreationOptional<string>,

    email: string,
    successful: boolean,

    ip: CreationOptional<string | undefined>,
    headers: CreationOptional<string>,

    createdAt: CreationOptional<string>,
}

const LoginAttempt = sequelize.define<LoginAttemptModel>('LoginAttempt', {
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
    },

    successful: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    ip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    headers: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'LoginAttempts',
    updatedAt: false,
});

export default LoginAttempt;

export {
    LoginAttemptModel,
    LoginAttempt,
};
