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

const CreatePaymentInput = builder.inputType("PaymentInput", {
  fields: (t) => ({
    amount: t.float({ required: true }),
    paidAt: t.field({
      required: true,
      type: "Date",
    }),
    expenseId: t.int({ required: true }),
  }),
});

builder.mutationField("createPayment", (t) =>
  t.prismaField({
    authScopes: {
      loggedIn: true,
    },
    type: "Payment",
    args: {
      paymentInput: t.arg({
        type: CreatePaymentInput,
        required: true,
      }),
    },
    resolve: async (parent, root, args, ctx, info) => {
      try {
        return await ctx.paymentRepository.create(args.paymentInput);
      } catch (error) {
        const err = error as Error;
        throw new GraphQLError(err.message);
      }
    },
  })
);

const UpdatePaymentInput = builder.inputType("UpdatePaymentInput", {
  fields: (t) => ({
    amount: t.float({ required: true }),
    paidAt: t.field({
      required: true,
      type: "Date",
    }),
  }),
});

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
        type: UpdatePaymentInput,
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
