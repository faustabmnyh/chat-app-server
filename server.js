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

const PORT = process.env.PORT || 4000;

server.listen({ port: PORT }).then((res) => {
  console.log(`listening at ${res.port}`);
  console.log(`subscription at ${res.subscriptionsUrl}`);

  // connect to database
  sequelize
    .authenticate()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error(err));
});
