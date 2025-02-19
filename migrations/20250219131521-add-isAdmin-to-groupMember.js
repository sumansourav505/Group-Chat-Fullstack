module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("groupMembers", "isAdmin", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // By default, users are not admins
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("groupMembers", "isAdmin");
  },
};
