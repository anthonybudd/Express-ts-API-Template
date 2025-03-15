import { Model, InferAttributes, InferCreationAttributes, CreationOptional, QueryInterface } from 'sequelize';
import sequelize from '../providers/db';
import { DataTypes } from 'sequelize';

interface GroupUserModel extends Model<InferAttributes<GroupUserModel>, InferCreationAttributes<GroupUserModel>> {
    id: CreationOptional<string>,
    userID: string,
    groupID: string,
    role: 'User' | 'Admin',
}

const GroupUser = sequelize.define<GroupUserModel>('GroupUser', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    userID: {
        type: DataTypes.UUID
    },
    groupID: {
        type: DataTypes.UUID
    },

    role: {
        type: DataTypes.STRING,
        defaultValue: 'User',
        allowNull: false,
    },
}, {
    tableName: 'GroupsUsers',
    updatedAt: false,
});

export default GroupUser;

export {
    GroupUserModel,
    GroupUser,
};
