import { builder } from "../builder";
import { GraphQLError } from "graphql";
import { IExpenseData } from "../repositories/ExpenseRepository";
import PaymentImporter from "../libs/importer/PaymentImporter";

const dateRangeInput = builder.inputType("DateRangeInput", {
  fields: (t) => ({
    start: t.field({ type: "Date", required: true }),
    end: t.field({ type: "Date", required: true }),
  }),
});

builder.prismaObject("Expense", {
  fields: (t) => ({
    id: t.exposeID("id"),
    category: t.exposeString("category"),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    frequency: t.exposeString("frequency"),
    importKeyword: t.exposeString("importKeyword", { nullable: true }),
    name: t.exposeString("name"),
    payments: t.relation("payments", {
      args: {
        paidAtDateRange: t.arg({ type: dateRangeInput }),
      },
      resolve: async (parent, root, args, ctx, info) => {
        return await ctx.paymentRepository.getWhere({ expenseId: root.id, dateRange: args.paidAtDateRange });
      },
      nullable: true,
    }),
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
    importKeyword: t.string({ required: false }),
    provider: t.string({ required: true }),
    name: t.string({ required: true }),
  }),
});

const cleanExpenseInput = (args: any): IExpenseData => {
  return {
    category: args.category,
    frequency: args.frequency,
    importKeyword: args.importKeyword !== undefined ? args.importKeyword : null,
    name: args.name,
    provider: args.provider,
  };
};

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
      return await ctx.expenseRepository.create(cleanExpenseInput(args.expenseInput));
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
        return await ctx.expenseRepository.update(args.id, cleanExpenseInput(args.expenseInput));
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

builder.mutationField("deleteExpense", (t) =>
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
        return await ctx.expenseRepository.delete(args.id);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

builder.objectType("ImportResult", {
  description: "Resulting imported results information.",
  fields: (t) => ({
    status: t.string({
      resolve: (parent) => {
        return parent.status;
      },
    }),

    total: t.int({
      resolve: (parent) => {
        return parent.total
      }
    }),

    totalImported: t.int({
      resolve: (parent) => {
        return parent.totalImported
      }
    })
  }),
});

builder.scalarType("File", {
  serialize: () => {
    throw new Error("Uploads can only be used as input types");
  },
});

export const importType = builder.enumType("ImportType", {
  values: ["rbc"] as const,
});

builder.mutationField("parseExpensesImport", (t) =>
  t.field({
    authScopes: {
      loggedIn: true,
    },
    type: "ImportResult",
    args: {
      file: t.arg({
        type: "File",
        required: true,
      }),
      type: t.arg({
        type: importType,
        required: true,
      }),
    },
    resolve: async (parent, args, ctx) => {
      try {
        const paymentImporter = new PaymentImporter(ctx, args);

        return { status: "success", ...await paymentImporter.run()};
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);
