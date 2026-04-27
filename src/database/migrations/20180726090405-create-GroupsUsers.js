module.exports = {
    up: (queryInterface, { DataTypes }) => queryInterface.createTable('GroupsUsers', {

        // AB: This column is not used. Required by default mysql system var `sql_require_primary_key`
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        groupID: {
            type: DataTypes.UUID,
        },
        userID: {
            type: DataTypes.UUID,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'User',
            allowNull: false,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }).then(() => queryInterface.addIndex('GroupsUsers', ['userID'], {
        name: 'userID_index'
    })).then(() => queryInterface.addIndex('GroupsUsers', ['groupID'], {
        name: 'groupID_index'
    })).then(() => queryInterface.addConstraint('GroupsUsers', {
        fields: ['groupID', 'userID'],
        type: 'unique',
        name: 'groupID_userID_index'
    })),
    down: (queryInterface) => queryInterface.dropTable('GroupsUsers'),
};