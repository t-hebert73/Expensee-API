import { CsvResult } from "../../utils/CsvReader";

type ImportablePaymentRecord = {
  amount: number;
  paidAt: Date;
  description: string;
};

type ImportableResults = {
  records: ImportablePaymentRecord[];
};

abstract class Importer {
  csvResult: CsvResult;

  constructor(csvResult: CsvResult) {
    this.csvResult = csvResult;
  }

  abstract run(): ImportableResults;
}

type RbcRecord = {
  accountType: string;
  accountNumber: string;
  transactionDate: Date;
  chequeNumber: string;
  descriptionOne: string;
  descriptionTwo: string;
  cad: number;
  usd: string;
};

class RbcImportConvertor extends Importer {
  constructor(csvResult: CsvResult) {
    super(csvResult);
  }

  run(): ImportableResults {
    const keywords = ["mortgage", "property tax", "enbridge gas", "welland hydro", "water bill"];

    const importableResults: ImportablePaymentRecord[] = [];

    this.csvResult.records.forEach((record) => {
      const [accountType, accountNumber, transactionDate, chequeNumber, descriptionOne, descriptionTwo, cad, usd] =
        record;
      const rbcRecord: RbcRecord = {
        accountType,
        accountNumber,
        transactionDate: new Date(transactionDate),
        chequeNumber,
        descriptionOne: descriptionOne.replace(/"/g, "").trim(),
        descriptionTwo: descriptionTwo.replace(/"/g, "").trim(),
        cad: parseFloat(cad),
        usd,
      };

      keywords.every((keyword) => {
        if (descriptionTwo.toLowerCase().includes(keyword)) {
          importableResults.push({
            amount: rbcRecord.cad,
            paidAt: rbcRecord.transactionDate,
            description: rbcRecord.descriptionTwo
          });

          return false; 
        }

        return true;
      });
    });
    //console.log(this.csvResult.headers);

    return {
      records: importableResults,
    };
  }
}

class ScotiaImportConvertor extends Importer {
  constructor(csvResult: CsvResult) {
    super(csvResult);
  }

  run(): ImportableResults {
    return {
      records: [],
    };
  }
}

export { RbcImportConvertor, ScotiaImportConvertor, Importer };
