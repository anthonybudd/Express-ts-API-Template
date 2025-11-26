module.exports = {
    up: (queryInterface, { DataTypes }) => queryInterface.createTable('LoginAttempts', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        successful: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

        ip: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        headers: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }).then(() => queryInterface.addIndex('LoginAttempts', ['email'], {
        name: 'email_index'
    })),
    down: (queryInterface) => queryInterface.dropTable('LoginAttempts'),
};
