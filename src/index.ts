import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { GraphQLError } from "graphql";
import ExpenseRepository from "./repositories/ExpenseRepository";
import UserRepository from "./repositories/UserRepository";
import Authenticator from "./libs/auth/Authenticator";
import PaymentRepository from "./repositories/PaymentRepository";

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
    expenseRepository: getExpenseRepository(request),
    paymentRepository: getPaymentRepository(request),
    userRepository: getUserRepository(request)
  }),
});

const getLoggedInUser = (request: Request) => {
  if (!request.headers.get("authorization")) return null;

  try {
    const authenticator: Authenticator = new Authenticator()
    const jwtPayload = authenticator.authenticateToken(
      request.headers.get("authorization")
    );

    return jwtPayload.user;
  } catch (error) {
    const err = error as Error;
    throw new GraphQLError(err.message, { extensions: {
      code: 'FORBIDDEN'
    }});
  }
};

const getExpenseRepository = (request: Request) => {
  return new ExpenseRepository(getLoggedInUser(request))
}

const getPaymentRepository = (request: Request) => {
  return new PaymentRepository(getLoggedInUser(request))
}

const getUserRepository = (request: Request) => {
  return new UserRepository(getLoggedInUser(request))
}

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
