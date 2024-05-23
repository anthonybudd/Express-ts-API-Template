import User from './User';
import Group from './Group';
import GroupsUsers from './GroupsUsers';


User.belongsToMany(Group, {
    through: GroupsUsers,
    foreignKey: 'userID',
    otherKey: 'groupID',
});
Group.belongsToMany(User, {
    through: GroupsUsers,
    foreignKey: 'groupID',
    otherKey: 'userID',
});


export {
    User,
    Group,
    GroupsUsers,
};
