import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../providers/db';
import { DataTypes } from 'sequelize';

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         ownerID:
 *           type: string
 *           format: uuid
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

interface GroupModel extends Model<InferAttributes<GroupModel>, InferCreationAttributes<GroupModel>> {
    id: CreationOptional<string>,
    name: string,
    ownerID: string,
    deletedAt: CreationOptional<string>,
}

const Group = sequelize.define<GroupModel>('group', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true
    },

    name: {
        type: DataTypes.STRING
    },
    ownerID: {
        type: DataTypes.UUID
    },

    deletedAt: {
        type: DataTypes.DATE,
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
