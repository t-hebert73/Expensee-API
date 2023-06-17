import { builder } from "../builder";
import { GraphQLError } from "graphql";
import Authenticator from "../libs/auth/Authenticator";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    email: t.exposeString("email"),
    expenses: t.relation("expenses"),
    name: t.exposeString("name"),
  }),
});

// builder.queryField("users", (t) =>
//   t.prismaField({
//     type: ["User"],
//     resolve: async (query) => {
//       return prisma.user.findMany({ ...query });
//     },
//   })
// );

builder.objectType("LoginResult", {
  description: "Resulting jwt and user information",
  fields: (t) => ({
    jwt: t.field({
      type: "JwtToken",
      resolve: (parent) => {
        return parent.jwt
      },
    }),
    user: t.prismaField({
      type: "User",
      resolve: async (query, parent) => {
        return parent.user;
      },
    }),
  }),
});

builder.objectType("JwtToken", {
  description: "Jwt token",
  fields: (t) => ({
    access: t.exposeString("access"),
    refresh: t.exposeString("refresh"),
  }),
});

const LoginInput = builder.inputType("LoginInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

builder.mutationField("login", (t) =>
  t.field({
    type: "LoginResult",
    args: {
      loginInput: t.arg({
        type: LoginInput,
        required: true,
      }),
    },
    resolve: async (parent, args, ctx) => {
      try {
        const authenticator = new Authenticator()
        return await authenticator.attemptLogin(args.loginInput);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

builder.objectType("RegisterResult", {
  description: "Status of registration",
  fields: (t) => ({
    status: t.string({
      resolve: (parent) => {
        return parent.status
      },
    }),
  }),
});

const RegisterInput = builder.inputType("RegisterInput", {
  fields: (t) => ({
    fullName: t.string({ required: true }),
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    confirmPassword: t.string({ required: true }),
  }),
});

builder.mutationField("register", (t) =>
  t.field({
    type: "RegisterResult",
    args: {
      registerInput: t.arg({
        type: RegisterInput,
        required: true,
      }),
    },
    resolve: async (parent, args, ctx) => {
      try {
        const authenticator = new Authenticator()
        return await authenticator.attemptRegister(args.registerInput);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

