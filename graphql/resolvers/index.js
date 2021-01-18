const usersResolvers = require("./users");
const messagesResolvers = require("./messages");
const { Message, User } = require("../../models");

module.exports = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  User: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Reaction: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    message: async (parent) => await Message.findByPk(parent.messageId),
    user: async (parent) =>
      await User.findByPk(parent.userId, {
        attributes: ["username", "imageURL", "createdAt"],
      }),
  },
  Query: {
    ...usersResolvers.Query,
    ...messagesResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...messagesResolvers.Mutation,
  },
  Subscription: {
    ...messagesResolvers.Subscription,
  },
};
