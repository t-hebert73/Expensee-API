import { GraphQLError } from "graphql";
import { builder } from "../builder";

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
        return await ctx.paymentRepository.create(args.expenseId, args.paymentInput);
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
