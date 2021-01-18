const {
  UserInputError,
  AuthenticationError,
  withFilter,
  ForbiddenError,
} = require("apollo-server");
const { User, Message, Reaction } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getMessages: async (_, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const otherUser = await User.findOne({ where: { username: from } });
        if (!otherUser) throw new UserInputError("User Not Found");

        const usernames = [user.username, otherUser.username];

        const messages = await Message.findAll({
          // in operator is the way to check if a value is an array of values, adn because we want to chech if this from is in the two username and the same name same things for two
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
          include: [{ model: Reaction, as: "reactions" }],
        });

        return messages;
      } catch (err) {
        console.log(err);
        return err;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const recipient = await User.findOne({ where: { username: to } });
        if (!recipient) throw new UserInputError("User Not Found");
        if (recipient.username === user.username)
          throw new UserInputError("You can send message to yourself");
        if (content.trim() === "") {
          throw new UserInputError("Message Empty");
        }

        const message = await Message.create({
          from: user.username,
          to,
          content,
        });

        await pubsub.publish("NEW_MESSAGE", { newMessage: message });
        return message;
      } catch (err) {
        return err;
      }
    },
    reactToMessage: async (_, { uuid, content }, { user, pubsub }) => {
      const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];
      try {
        // validate reaction content
        if (!reactions.includes(content)) {
          throw new UserInputError("Invalid Reaction");
        }

        // get users
        const username = user ? user.username : "";
        user = await User.findOne({ where: { username } });
        if (!user) throw new AuthenticationError("Unauthenticated");

        // get message
        const message = await Message.findOne({ where: { uuid } });
        if (!message) throw new UserInputError("Message Not Found");

        if (message.from !== user.username && message.to !== user.username) {
          throw new ForbiddenError("Unauthorized");
        }

        // check first if user already add reaction , if already we wont user add reaction again
        let reaction = await Reaction.findOne({
          where: { messageId: message.id, userId: user.id },
        });
        if (reaction) {
          // reaction exist updated
          reaction.content = content;
          await reaction.save();
        } else {
          // doesnt exists,
          reaction = await Reaction.create({
            messageId: message.id,
            userId: user.id,
            content,
          });
        }

        pubsub.publish("NEW_REACTION", { newReaction: reaction });

        return reaction;
      } catch (err) {
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator("NEW_MESSAGE");
        },
        (parent, _, { user }) => {
          if (
            parent.newMessage.from === user.username ||
            parent.newMessage.to === user.username
          ) {
            return true;
          }
          return false;
        }
      ),
    },
    newReaction: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator("NEW_REACTION");
        },
        async ({ newReaction }, _, { user }) => {
          // sequelize automatically as these getters for us message attached for this reaction, and getMessage in bottom is based on the model name
          const message = await newReaction.getMessage();
          if (message.from === user.username || message.to === user.username) {
            return true;
          }
          return false;
        }
      ),
    },
  },
};
