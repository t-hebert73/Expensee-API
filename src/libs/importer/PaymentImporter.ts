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

    const importableRecords = importer.run();

    importableRecords.records.forEach(async (importableRecord, i) => {

      const expense = await this.ctx.expenseRepository.getOneWhere({
        importKeyword: importableRecord.expenseImportKeyword,
      });

      if (!expense) return;

      const existingPayment = await this.ctx.paymentRepository.getOneWhere({
        expenseId: expense.id,
        amount: importableRecord.amount,
        paidAt: importableRecord.paidAt,
      });

      if (existingPayment) return;

      await this.ctx.paymentRepository.create({
        ...importableRecord,
        expense: {
          connect: {
            id: expense.id
          },
        },
      });

    });
  }

  async createImporter(importType: string, file: File) {
    const Importer = importTypes.get(importType);
    if (!Importer) throw new Error("Invalid type");

    const csvReader = new CsvReader(file);
    return new Importer(await csvReader.read());
  }
}

export default PaymentImporter;
