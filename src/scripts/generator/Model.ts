import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../providers/db';
import * as Sequelize from 'sequelize';
import { UpdatedAt } from 'sequelize-typescript';

interface {{ ModelName }}Model extends Model<InferAttributes<{{ ModelName }}Model>, InferCreationAttributes<{{ ModelName }}Model>> {
    id: CreationOptional<string>,
    name: string,
    createdAt: CreationOptional<string>,
    updatedAt: CreationOptional<string>,
}

const {{ ModelName }} = sequelize.define<{{ ModelName }}Model>('{{ ModelName }}', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: Sequelize.DATE,
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
