import { CsvResult } from "../../utils/CsvReader";

class RbcImportConvertor {
  csvResult: CsvResult;

  constructor(csvResult: CsvResult) {
    this.csvResult = csvResult;
  }
}

export default RbcImportConvertor;
