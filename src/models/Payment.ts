import { builder } from "../builder";

builder.prismaObject("Payment", {
    fields: t => ({
        id: t.exposeID("id"),
        createdAt: t.expose("createdAt", {
            type: "Date",
        }),
        amount: t.exposeFloat("amount"),
        expense: t.relation("expense"),
        paidAt: t.expose("paidAt", {
            type: "Date",
        }),
    })
})