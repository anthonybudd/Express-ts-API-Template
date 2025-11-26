module.exports = {
    up: (queryInterface, { DataTypes }) => queryInterface.createTable('Groups', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },

        name: DataTypes.STRING,
        ownerID: DataTypes.UUID,

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
