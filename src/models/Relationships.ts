import User from './User';
import GroupUser from './GroupUser';
import Group from './Group';


User.belongsToMany(Group, {
    through: GroupUser,
    foreignKey: 'userID',
    otherKey: 'groupID',
});
Group.belongsToMany(User, {
    through: GroupUser,
    foreignKey: 'groupID',
    otherKey: 'userID',
});
