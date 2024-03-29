// src/builder.ts

import SchemaBuilder from "@pothos/core";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import { DateResolver } from "graphql-scalars";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { prisma } from "./db";
import { ILoginResult, JwtToken, IRegisterResult } from "./libs/auth/Authenticator";
import { GraphQLError } from "graphql";
import { User } from "@prisma/client";
import ExpenseRepository from "./repositories/ExpenseRepository";
import UserRepository from "./repositories/UserRepository";
import PaymentRepository from "./repositories/PaymentRepository";

type IImportResult = {
  status: string;
  total: number;
  totalImported: number;
};

export const builder = new SchemaBuilder<{
  AuthScopes: {
    loggedIn: boolean;
  };
  Context: {
    user: User;
    expenseRepository: ExpenseRepository;
    paymentRepository: PaymentRepository;
    userRepository: UserRepository;
  };
  Scalars: {
    Date: { Input: Date; Output: Date };
    File: { Input: File; Output: never };
  };
  PrismaTypes: PrismaTypes;
  Objects: {
    LoginResult: ILoginResult;
    JwtToken: JwtToken;
    RegisterResult: IRegisterResult;
    ImportResult: IImportResult;
  };
}>({
  scopeAuthOptions: {
    unauthorizedError: (parent, context, info, result) =>
      new GraphQLError(`Not authorized`, { extensions: { code: "FORBIDDEN" } }),
  },
  plugins: [ScopeAuthPlugin, PrismaPlugin],
  authScopes: async (context) => ({
    loggedIn: !!context.user,
  }),
  prisma: {
    client: prisma,
  },
});

builder.addScalarType("Date", DateResolver, {});

builder.queryType({});
builder.mutationType({});
