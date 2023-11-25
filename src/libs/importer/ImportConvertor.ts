import { CsvResult } from "../../utils/CsvReader";
import { RbcImportConvertor, ScotiaImportConvertor, Importer } from "./RbcImportConvertor";

const importTypes = new Map<string, { new (csvResult: CsvResult): Importer }>();
importTypes.set("rbc", RbcImportConvertor);
importTypes.set("scotia", ScotiaImportConvertor);

const importConvertorFactory = {
  createImporter(importType: string, csvResult: CsvResult) {
    const Importer = importTypes.get(importType);
    if (!Importer) throw new Error("Invalid type");

    return new Importer(csvResult);
  },
};

export default importConvertorFactory;
