import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../providers/db';
import { DataTypes } from 'sequelize';

interface {{ ModelName }}Model extends Model<InferAttributes<{{ ModelName }}Model>, InferCreationAttributes<{{ ModelName }}Model>> {
    id: CreationOptional<string>,
    name: string,
    createdAt: CreationOptional<string>,
    updatedAt: CreationOptional<string>,
    
    {{#userID}}
    userID: string,
    {{/userID}}
    {{#groupID}}
    groupID: string,
    {{/groupID}}
}

const {{ ModelName }} = sequelize.define<{{ ModelName }}Model>('{{ ModelName }}', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },

    {{#userID}}
    userID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    {{/userID}}
    {{#groupID}}
    groupID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    {{/groupID}}

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: '{{ ModelNames }}',
    paranoid: true,
    defaultScope: {
        attributes: {
            exclude: [
                // Excluded properties
            ]
        }
    },
});

export default {{ ModelName }};

export {
    {{ ModelName }}Model,
    {{ ModelName }},
};
