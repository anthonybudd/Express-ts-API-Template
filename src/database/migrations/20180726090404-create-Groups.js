module.exports = {
    up: (queryInterface, { DataTypes }) => queryInterface.createTable('Groups', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerID: {
            type: DataTypes.UUID,
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
    }).then(() => queryInterface.addIndex('Groups', ['id'], {
        name: 'id_index'
    })),
    down: (queryInterface) => queryInterface.dropTable('Groups')
};
