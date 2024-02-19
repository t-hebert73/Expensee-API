import { GraphQLError } from "graphql";
import { builder } from "../builder";
import PaymentImporter from "../libs/importer/PaymentImporter";

builder.prismaObject("Payment", {
  fields: (t) => ({
    id: t.exposeID("id"),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    amount: t.exposeFloat("amount"),
    paidAt: t.expose("paidAt", {
      type: "Date",
    }),
  }),
});

builder.queryField("payment", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Payment",
    args: {
      id: t.arg.int({
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      try {
        return await ctx.paymentRepository.get(args.id);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

const PaymentInput = builder.inputType("PaymentInput", {
  fields: (t) => ({
    amount: t.float({ required: true }),
    paidAt: t.field({
      required: true,
      type: "Date",
    }),
  }),
});

builder.mutationField("createPayment", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Payment",
    args: {
      expenseId: t.arg.int({ required: true }),
      paymentInput: t.arg({
        type: PaymentInput,
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      try {
        return await ctx.paymentRepository.create({
          ...args.paymentInput,
          expense: {
            connect: {
              id: args.expenseId
            }
          },
        });
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

builder.mutationField("updatePayment", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Payment",
    args: {
      id: t.arg.int({
        required: true,
      }),
      paymentInput: t.arg({
        type: PaymentInput,
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      try {
        return await ctx.paymentRepository.update(args.id, args.paymentInput);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

builder.mutationField("deletePayment", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Payment",
    args: {
      id: t.arg.int({
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      try {
        return await ctx.paymentRepository.delete(args.id);
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

builder.mutationField("importPayments", (t) =>
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
