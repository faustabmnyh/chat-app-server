const { UserInputError, AuthenticationError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Message, User } = require("../../models");
const { Op } = require("sequelize");

const generateToken = (res) => {
  return jwt.sign(
    {
      id: res.id,
      username: res.username,
      email: res.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: 60 * 60 }
  );
};

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await User.findAll({
          // this is for what wanna we got from all of the user
          attributes: ["username", "imageURL", "createdAt"],
          // so this is will get all user without user authenticated
          where: { username: { [Op.ne]: user.username } },
        });

        const allUserMessages = await Message.findAll({
          // because we want get all the messages either have from that is our username or a two that is our username so either sent by us or reacieve by us
          where: { [Op.or]: [{ from: user.username }, { to: user.username }] },
          order: [["createdAt", "DESC"]],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};

      try {
        if (username.trim() === "")
          errors.username = "Username must not be empty";
        if (password === "") errors.password = "Password must not be empty";
        if (Object.keys(errors).length > 0) {
          throw new UserInputError("Bad Input", { errors });
        }
        const user = await User.findOne({ where: { username } });
        if (!user) {
          errors.username = "User not found";
          throw new UserInputError("User not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          errors.password = "Incorrect password";
          throw new UserInputError("Incorrect password", { errors });
        }

        const token = generateToken(user.dataValues);
        return {
          ...user.toJSON(),
          token,
        };
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};
      try {
        if (username.trim() === "")
          errors.username = "Username must not be empty";
        if (email.trim() === "") errors.email = "email must not be empty";
        if (password.length < 6) {
          messages.password = "Password minimum 6 characters";
        }
        if (password === "") {
          errors.password = "Password must not be empty";
        } else if (password !== confirmPassword) {
          errors.confirmPassword = "Password must match";
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
        // hash password
        password = await bcrypt.hash(password, 6);
        // create user
        const user = await User.create({
          username,
          email,
          password,
        });
        const token = generateToken(user.dataValues);
        return {
          ...user.toJSON(),
          token,
        };
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path.substr(6)} is already taken`)
          );
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("Bad Input", { errors });
      }
    },
  },
};
