import ExpenseRepository from "../../repositories/ExpenseRepository";
import PaymentRepository from "../../repositories/PaymentRepository";
import UserRepository from "../../repositories/UserRepository";
import { CsvResult } from "../../utils/CsvReader";
import { RbcImportConvertor, ScotiaImportConvertor, Importer } from "./RbcImportConvertor";
import CsvReader from "../../utils/CsvReader";
import ImportConvertorFactory from "./ImportConvertor";

const importTypes = new Map<string, { new (csvResult: CsvResult): Importer }>();
importTypes.set("rbc", RbcImportConvertor);
importTypes.set("scotia", ScotiaImportConvertor);

type IContext = {
  user: any;
  expenseRepository: ExpenseRepository;
  paymentRepository: PaymentRepository;
  userRepository: UserRepository;
};

type IImportArgs = {
  file: File;
  type: string;
};

class PaymentImporter {
  ctx: IContext;
  args: IImportArgs;
  constructor(ctx: IContext, args: IImportArgs) {
    this.ctx = ctx;
    this.args = args;
  }

  async run() {
    const importFactory = new ImportConvertorFactory();

    const importer = await importFactory.createImporter(this.args.type, this.args.file);

    const importableResults = importer.run();

    const result = {
      total: importableResults.totalRows,
      totalImported: 0,
    };

    for (const importableRecord of importableResults.records) {
      const expense = await this.ctx.expenseRepository.getOneWhere({
        importKeyword: importableRecord.expenseImportKeyword,
      });

      if (!expense) continue;

      const existingPayment = await this.ctx.paymentRepository.getOneWhere({
        expenseId: expense.id,
        amount: importableRecord.amount,
        paidAt: importableRecord.paidAt,
      });

      if (existingPayment) continue;

      await this.ctx.paymentRepository.create({
        ...importableRecord,
        expense: {
          connect: {
            id: expense.id,
          },
        },
      });

      result.totalImported++;
    }

    return result;
  }

  async createImporter(importType: string, file: File) {
    const Importer = importTypes.get(importType);
    if (!Importer) throw new Error("Invalid type");

    const csvReader = new CsvReader(file);
    return new Importer(await csvReader.read());
  }
}

export default PaymentImporter;
