module.exports = {
    up: (queryInterface, { DataTypes }) => queryInterface.createTable('{{ ModelNames }}', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
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
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }),
    down: (queryInterface) => queryInterface.dropTable('{{ ModelNames }}'),
};
