import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../providers/db';
import * as Sequelize from 'sequelize';

interface GroupModel extends Model<InferAttributes<GroupModel>, InferCreationAttributes<GroupModel>> {
    id: CreationOptional<string>,
    name: string,
    ownerID: string,
    deletedAt: CreationOptional<string>,
}

const Group = sequelize.define<GroupModel>('group', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    name: {
        type: Sequelize.STRING
    },
    ownerID: {
        type: Sequelize.UUID
    },

    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Groups',
    paranoid: true,
});

export default Group;

export {
    GroupModel,
    Group,
};
