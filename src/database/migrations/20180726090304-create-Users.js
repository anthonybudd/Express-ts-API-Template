module.exports = {
    up: (queryInterface, { DataTypes }) => queryInterface.createTable('Users', {
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
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mfaEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        mfaSecret: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        bio: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },

        tos: DataTypes.STRING,
        inviteKey: DataTypes.STRING,
        passwordResetKey: DataTypes.STRING,
        emailVerificationKey: DataTypes.STRING,
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },

        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }).then(() => queryInterface.addIndex('Users', ['id'], {
        name: 'id_index'
    })).then(() => queryInterface.addIndex('Users', ['email'], {
        name: 'email_index'
    })),
    down: (queryInterface) => queryInterface.dropTable('Users'),
};
