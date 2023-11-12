import { builder } from "../builder";
import { GraphQLError } from "graphql";
import CsvReader from "../utils/CsvReader";

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
  description: "Resulting parsed importable expenses",
  fields: (t) => ({
    status: t.string({
      resolve: (parent) => {
        return parent.status;
      },
    }),
  }),
});

builder.scalarType("File", {
  serialize: () => {
    throw new Error("Uploads can only be used as input types");
  },
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
    },
    resolve: async (parent, args, ctx) => {
      try {
        const csvReader = new CsvReader(args.file);

        const result = await csvReader.read()
        
        console.log(result.headers);
        console.log(result.records[0]);
        //console.log(records);
        // records.forEach((record) => {
        //   console.log(record[4])
        // })

        /**
         * Plan
         *
         * 1) csv reader class?
         *
         * 2) RBCImportConvertor class to create ImportablePaymentRecords
         *
         * 3) ImportGuard class to check if ImportablePaymentRecords need/don't need to be imported (already exist in DB etc)
         *
         * 4) return the ImportablePaymentRecords in json format
         */

        // const records = textContent.split("\n");

        // records.forEach((record) => {
        //   let parsed = record.split(",");

        //   let type = parsed[4];

        //   //console.log(type);
        // });

        return { status: '123' };
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);
