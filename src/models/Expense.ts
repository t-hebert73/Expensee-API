import { builder } from "../builder";
import { prisma } from "../db";
import { GraphQLError } from "graphql";
import { Prisma, User } from "@prisma/client";

builder.prismaObject("Expense", {
  fields: (t) => ({
    id: t.exposeID("id"),
    category: t.exposeString("category"),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    frequency: t.exposeString("frequency"),
    name: t.exposeString("name"),
    payments: t.relation("payments"),
    provider: t.exposeString("provider"),
    user: t.relation("user"),
  }),
});

builder.queryField("expenses", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: ["Expense"],
    args: {
      category: t.arg.string(),
    },
    resolve: async (parent, root, args, ctx, info) => {
      const query: Prisma.ExpenseFindManyArgs = {};
      query.where = {};

      query.where.category = args.category ? args.category : undefined;

      query.where.user = {
        id: ctx.user.id,
      };

      return await prisma.expense.findMany(query);
    },
  })
);

const expenseInput = builder.inputType("ExpenseInput", {
  fields: (t) => ({
    category: t.string({ required: true }),
    frequency: t.string({ required: true }),
    provider: t.string({ required: true }),
    name: t.string({ required: true }),
  }),
});

builder.mutationField("createExpense", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Expense",
    args: {
      expenseInput: t.arg({
        type: expenseInput,
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      const expense = {
        category: args.expenseInput.category,
        frequency: args.expenseInput.frequency,
        provider: args.expenseInput.provider,
        user: { connect: { id: ctx.user.id } },
        name: args.expenseInput.name,
      };
      return await prisma.expense.create({
        data: expense,
      });
    },
  })
);

builder.mutationField("updateExpense", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Expense",
    args: {
      id: t.arg.int({
        required: true,
      }),
      expenseInput: t.arg({
        type: expenseInput,
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      const expense = {
        category: args.expenseInput.category,
        frequency: args.expenseInput.frequency,
        provider: args.expenseInput.provider,
        name: args.expenseInput.name,
      };
      try {
        return await prisma.expense.update({
          where: {
            id: args.id,
          },
          data: expense,
        });
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);
