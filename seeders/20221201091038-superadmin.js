const bcrypt = require("bcryptjs");
("use strict");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id : 1,
          nama: "User admin",
          foto: "",
          username: "superadmin",
          password: bcrypt.hashSync("Test123!@#", 10),
          email: "superadmin@gmail.com",
          nohp: "081234567890",
          tgl_lahir: "2022-12-12",
          domisili: "Jakarta",
          document: "Superadmin for input candidate data access in first time",
          createdAt: Sequelize.fn("NOW"),
          updatedAt: Sequelize.fn("NOW"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("users", null, {});
  },
};
