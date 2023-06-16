// src/builder.ts

import SchemaBuilder from "@pothos/core";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import { DateResolver } from "graphql-scalars";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { prisma } from "./db";
import { ILoginResult, JwtToken } from "./libs/auth/Authenticator";
import { GraphQLError } from "graphql";
import { User } from "@prisma/client";

export const builder = new SchemaBuilder<{
  AuthScopes: {
    loggedIn: boolean;
    employee: boolean;
  };
  Context: {
    user: User
  };
  Scalars: {
    Date: { Input: Date; Output: Date };
  };
  PrismaTypes: PrismaTypes;
  Objects: {
    LoginResult: ILoginResult;
    JwtToken: JwtToken;
  };
}>({
  scopeAuthOptions: {
    unauthorizedError: (parent, context, info, result) => new GraphQLError(`Not authorized`),
  },
  plugins: [ScopeAuthPlugin, PrismaPlugin],
  authScopes: async (context: any) => ({
    loggedIn: !!context.user,
    employee: false,
  }),
  prisma: {
    client: prisma,
  },
});

builder.addScalarType("Date", DateResolver, {});

builder.queryType({});
builder.mutationType({});
