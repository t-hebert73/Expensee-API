import { prisma } from "../db";
import { Prisma, User } from "@prisma/client";

type IPaymentData = {
  amount: number;
  paidAt: Date;
};

class PaymentRepository {
  currentUser: User;

  constructor(currentUser: User) {
    this.currentUser = currentUser;
  }

  async create(expenseId: number, paymentData: IPaymentData) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId: this.currentUser.id },
    });

    if (!expense) throw new Error("Expense doesn't exist.");

    const payment = {
      amount: paymentData.amount,
      paidAt: paymentData.paidAt,
      expense: { connect: { id: expenseId } },
    };

    return prisma.payment.create({
      data: payment,
    });
  }

  async update(id: number, paymentData: IPaymentData) {
    const payment = await prisma.payment.findFirst({ where: { id: id }, include: { expense: true } });
    if (payment?.expense.userId !== this.currentUser.id) throw new Error("Payment doesn't exist.");

    return prisma.payment.update({
      where: {
        id: id,
      },
      data: paymentData,
    });
  }

  async delete(id: number) {
    const payment = await prisma.payment.findFirst({ where: { id: id }, include: { expense: true } });
    if (payment?.expense.userId !== this.currentUser.id) throw new Error("Payment doesn't exist.");

    return prisma.payment.delete({
      where: {
        id: id,
      },
    });
  }

  async getMany(category: string | undefined | null) {
    const query: Prisma.PaymentFindManyArgs = {};
    query.where = {};
    query.where.expense = {};

    query.where.expense.userId = this.currentUser.id;

    return prisma.payment.findMany(query);
  }

  async get(id: number) {
    const query: Prisma.PaymentFindFirstOrThrowArgs = {};
    query.where = {
      id: id,
      expense: {
        userId: this.currentUser.id,
      },
    };

    return prisma.payment.findFirstOrThrow(query);
  }
}

export default PaymentRepository;
