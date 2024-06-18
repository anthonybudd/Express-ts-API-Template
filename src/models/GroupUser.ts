import { Model, InferAttributes, InferCreationAttributes, CreationOptional, QueryInterface } from 'sequelize';
import sequelize from '../providers/db';
import * as Sequelize from 'sequelize';

interface GroupUserModel extends Model<InferAttributes<GroupUserModel>, InferCreationAttributes<GroupUserModel>> {
    id: CreationOptional<string>,
    userID: string,
    groupID: string,
    role: 'User' | 'Admin',
}

const GroupUser = sequelize.define<GroupUserModel>('GroupUser', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    userID: {
        type: Sequelize.UUID
    },
    groupID: {
        type: Sequelize.UUID
    },

    role: {
        type: Sequelize.STRING,
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
