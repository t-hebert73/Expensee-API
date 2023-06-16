// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

async function main() {
  // Delete all records
  await prisma.payment.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.user.deleteMany({});
  // (Re-)Create dummy `User`, 'Expense` and 'Payment' records

  const salt = await bcrypt.genSalt(10);
  const pass = await bcrypt.hash('dummypass', salt);

  await prisma.user.create({
    data: {
      name: "Jim Lahey",
      email: "jimlahey@sunnyvale.com",
      password: pass,
      expenses: {
        create: [
          {
            name: "Mortgage",
            category: "Mortgage",
            provider: "RBC",
            frequency: "Bi-weekly",
            payments: {
              create: [
                {
                  amount: 1274.29,
                  paidAt: new Date("2023-03-30 12:00:00"),
                },
                {
                  amount: 1274.29,
                  paidAt: new Date("2023-03-16 12:00:00"),
                },
                {
                  amount: 1274.29,
                  paidAt: new Date("2023-03-02 12:00:00"),
                },
                {
                  amount: 1274.29,
                  paidAt: new Date("2023-02-16 12:00:00"),
                },
              ],
            },
          },
          {
            name: "Hydro",
            category: "Utility",
            provider: "Welland Hydro",
            frequency: "Monthly",
            payments: {
              create: [
                {
                  amount: 141.43,
                  paidAt: new Date("2023-03-30 12:00:00"),
                },
                {
                  amount: 123.36,
                  paidAt: new Date("2023-02-30 12:00:00"),
                },
                {
                  amount: 129.55,
                  paidAt: new Date("2023-01-30 12:00:00"),
                },
              ],
            },
          },
          {
            name: "Gas",
            category: "Utility",
            provider: "Enbridge",
            frequency: "Monthly",
            payments: {
              create: [
                {
                  amount: 144.54,
                  paidAt: new Date("2023-03-20 12:00:00"),
                },
                {
                  amount: 153.36,
                  paidAt: new Date("2023-02-22 12:00:00"),
                },
                {
                  amount: 111.29,
                  paidAt: new Date("2023-01-19 12:00:00"),
                },
              ],
            },
          },
        ],
      },
    },
  });
}

main().then(() => {
  console.log("Data seeded...");
});
