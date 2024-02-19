import ExpenseRepository from "../../repositories/ExpenseRepository";
import PaymentRepository from "../../repositories/PaymentRepository";
import UserRepository from "../../repositories/UserRepository";
import { CsvResult } from "../../utils/CsvReader";
import { RbcImportConvertor, ScotiaImportConvertor, Importer } from "./RbcImportConvertor";
import CsvReader from "../../utils/CsvReader";

const importTypes = new Map<string, { new (csvResult: CsvResult): Importer }>();
importTypes.set("rbc", RbcImportConvertor);
importTypes.set("scotia", ScotiaImportConvertor);


class ImportConvertorFactory {

  async createImporter(importType: string, file: File) {
    const Importer = importTypes.get(importType);
    if (!Importer) throw new Error("Invalid type");

    const csvReader = new CsvReader(file);
    return new Importer(await csvReader.read());
  }
}

export default ImportConvertorFactory;
