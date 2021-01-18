"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  // this is for create data to database
  up: async (queryInterface, Sequelize) => {
    const createdAt = new Date();
    const updatedAt = createdAt;

    // https://unsplash.com/photos/ZHvM3XIOHoE
    // https://unsplash.com/photos/b1Hg7QI-zcc
    // https://unsplash.com/photos/RiDxDgHg7pw

    await queryInterface.bulkInsert("users", [
      {
        username: "mamang",
        email: "mamang@email.com",
        password: await bcrypt.hash("mamang123", 6),
        imageUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1700&q=80",
        createdAt,
        updatedAt,
      },
      {
        username: "juju",
        email: "juju@email.com",
        password: await bcrypt.hash("juju123", 6),
        imageUrl:
          "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2190&q=80",
        createdAt,
        updatedAt,
      },
      {
        username: "kalace",
        email: "kalace@email.com",
        password: await bcrypt.hash("kalace123", 6),
        imageUrl:
          "https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2122&q=80",
        createdAt,
        updatedAt,
      },
    ]);
  },

  // deleting data from database
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
