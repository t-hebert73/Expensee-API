import { builder } from "../builder";
import { GraphQLError } from "graphql";

builder.prismaObject("Expense", {
  fields: (t) => ({
    id: t.exposeID("id"),
    category: t.exposeString("category"),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    frequency: t.exposeString("frequency"),
    name: t.exposeString("name"),
    payments: t.relation("payments", { nullable: true }),
    provider: t.exposeString("provider"),
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
      return await ctx.expenseRepository.getMany(args.category);
    },
  })
);

builder.queryField("expense", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Expense",
    args: {
      id: t.arg.int({
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      try {
        return await ctx.expenseRepository.get(args.id);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
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
      return await ctx.expenseRepository.create(args.expenseInput);
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
      try {
        return await ctx.expenseRepository.update(args.id, args.expenseInput);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);
