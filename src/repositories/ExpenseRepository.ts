import { prisma } from "../db";
import { Prisma, User } from "@prisma/client";

type IExpenseData = {
  category: string;
  frequency: string;
  provider: string;
  name: string;
};

class ExpenseRepository {
  currentUser: User;

  constructor(currentUser: User) {
    this.currentUser = currentUser;
  }

  async create(expenseData: IExpenseData) {
    return prisma.expense.create({
      data: {
        ...expenseData,
        user: { connect: { id: this.currentUser.id } },
      },
    });
  }

  async update(id: number, expenseData: IExpenseData) {
    const existingExpense = await prisma.expense.findFirst({ where: { id: id, userId: this.currentUser.id } });
    if (!existingExpense) throw new Error("Expense doesn't exist.");

    return prisma.expense.update({
      where: {
        id: id,
      },
      data: expenseData,
    });
  }

  async getMany(category: string | undefined | null) {
    const query: Prisma.ExpenseFindManyArgs = {};
    query.where = {};

    query.where.category = category ? category : undefined;

    query.where.user = {
      id: this.currentUser.id,
    };

    return prisma.expense.findMany(query);
  }

  async get(id: number) {
    const query: Prisma.ExpenseFindFirstOrThrowArgs = {};
    query.where = {
      id: id,
    };

    query.where.user = {
      id: this.currentUser.id,
    };

    return prisma.expense.findFirstOrThrow(query);
  }
}

export default ExpenseRepository;
