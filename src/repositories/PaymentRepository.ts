import { prisma } from "../db";
import { Prisma, User } from "@prisma/client";

type IPaymentData = {
  amount: number;
  paidAt: Date;
};

type IDateRange = {
  start: Date;
  end: Date;
};

type IWhereData = {
  amount?: number;
  expenseId?: number;
  expenseImportKeyword?: string;
  dateRange?: IDateRange | undefined | null;
};

class PaymentRepository {
  currentUser: User;

  constructor(currentUser: User) {
    this.currentUser = currentUser;
  }

  async create(createData: Prisma.PaymentCreateInput) {
    const expense = await prisma.expense.findFirst({
      where: { id: createData.expense.connect?.id, userId: this.currentUser.id },
    });

    if (!expense) throw new Error("Expense doesn't exist.");

    const payment = {
      amount: createData.amount,
      paidAt: createData.paidAt,
      expense: { connect: { id: createData.expense.connect?.id } },
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

  async getWhere(whereData: IWhereData) {
    const query: Prisma.PaymentFindFirstOrThrowArgs =  {};
    query.where = {};

    query.where.expenseId = whereData.expenseId ? whereData.expenseId : undefined;

    query.where.paidAt = {
      gte: whereData.dateRange?.start,
      lte: whereData.dateRange?.end,
    };

    query.where.expense = {
      userId: this.currentUser.id,
    };

    return prisma.payment.findMany(query);
  }

  async getOneWhere(whereData: Prisma.PaymentWhereInput) {
    const query: Prisma.PaymentFindFirstArgs = {};

    query.where = whereData;
    if (!query.where.expense) query.where.expense = {}

    query.where.expense.userId = this.currentUser.id

    return prisma.payment.findFirst(query);
  }

}

export default PaymentRepository;
