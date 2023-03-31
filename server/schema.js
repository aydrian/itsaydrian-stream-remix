// Construct a schema, using GraphQL schema language
exports.typeDefs = `#graphql
type Query {
  numberSix: Int! # Should always return the number 6 when queried
  numberSeven: Int! # Should always return 7
}
`;

// Provide resolver functions for your schema fields
exports.resolvers = {
  Query: {
    numberSix() {
      return 6;
    },
    numberSeven() {
      return 7;
    }
  }
};
