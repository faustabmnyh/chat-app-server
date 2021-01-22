const { ApolloServer } = require("apollo-server");
const { sequelize } = require("./models");
require("dotenv").config();
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const contextMiddleware = require("./utils/contextMiddleware");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  subscriptions: { path: "/" },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`listening at ${url}`);
  console.log(`subscription at ${subscriptionsUrl}`);

  // connect to database
  sequelize
    .authenticate()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error(err));
});
