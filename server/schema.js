const { PubSub } = require("graphql-subscriptions");
// Construct a schema, using GraphQL schema language
exports.typeDefs = `#graphql
type Query {
  numberSix: Int! # Should always return the number 6 when queried
  numberSeven: Int! # Should always return 7,
  currentNumber: Int
}

type Subscription {
  numberIncremented: Int
}
`;

// Provide resolver functions for your schema fields
exports.createResolvers = (pubsub) => {
  return {
    Query: {
      numberSix() {
        return 6;
      },
      numberSeven() {
        return 7;
      },
      currentNumber() {
        return currentNumber;
      }
    },
    Subscription: {
      numberIncremented: {
        subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"])
      }
    }
  };
};
