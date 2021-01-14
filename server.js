const { ApolloServer } = require("apollo-server");
const { sequelize } = require("./models");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

server.listen().then(({ url }) => {
  console.log(`listening at ${url}`);

  // connect to database
  sequelize
    .authenticate()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error(err));
});
