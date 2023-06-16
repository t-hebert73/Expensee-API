import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import authenticator from "./libs/auth/Authenticator";
import { GraphQLError } from "graphql";

if (
  !process.env.JWT_ACCESS_TOKEN_SECRET ||
  !process.env.JWT_REFRESH_TOKEN_SECRET
)
  throw new Error("ENV JWT secrets missing");

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema,
  context: async ({ request }) => ({
    user: getLoggedInUser(request),
  }),
});

const getLoggedInUser = (request: any) => {
  if (!request.headers.get("authorization")) return null;

  try {
    const jwtPayload = authenticator.authenticateToken(
      request.headers.get("authorization")
    );

    return jwtPayload.user;
  } catch (error) {
    const err = error as Error;
    throw new GraphQLError(err.message);
  }
};

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
