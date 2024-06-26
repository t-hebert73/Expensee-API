import { CsvResult } from "../../utils/CsvReader";

type ImportablePaymentRecord = {
  amount: number;
  paidAt: Date;
  description: string;
  expenseImportKeyword: string;
};

type ImportableResults = {
  records: ImportablePaymentRecord[];
  totalRows: number;
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
  description: string;
  cad: number;
  usd: string;
};

class RbcImportConvertor extends Importer {
  constructor(csvResult: CsvResult) {
    super(csvResult);
  }

  run(): ImportableResults {
    const keywords = [
      "caa insurance company",
      "enbridge gas",
      "mortgage",
      "property tax",
      "water bill",
      "welland hydro",
      "bell canada",
    ];

    const keywordOverrides = [
      {
        keyword: "caa insurance company",
        threshold: 1000,
        aboveThresholdKeyword: "caa insurance company property",
        belowThresholdKeyword: "caa insurance company car",
      },
      {
        keyword: "mortgage",
        threshold: 3000,
        aboveThresholdKeyword: "mortgage lumpsum",
        belowThresholdKeyword: "mortgage",
      },
    ];

    const importableResults: ImportablePaymentRecord[] = [];

    this.csvResult.records.forEach((record) => {
      const [accountType, accountNumber, transactionDate, chequeNumber, descriptionOne, descriptionTwo, cad, usd] =
        record;
      const rbcRecord: RbcRecord = {
        accountType,
        accountNumber,
        transactionDate: new Date(transactionDate),
        chequeNumber,
        description: descriptionOne.replace(/"/g, "").trim() + " " + descriptionTwo.replace(/"/g, "").trim(),
        cad: parseFloat(cad) * -1, // convert to postive
        usd,
      };

      keywords.every((keyword) => {
        if (descriptionOne.toLowerCase().includes(keyword)) {
          const overrideInfo = keywordOverrides.find((overrideInfo) => overrideInfo.keyword == keyword);
          if (overrideInfo) {
            keyword =
              rbcRecord.cad > overrideInfo.threshold
                ? overrideInfo.aboveThresholdKeyword
                : overrideInfo.belowThresholdKeyword;
          }

          const importableResult = {
            amount: rbcRecord.cad,
            paidAt: rbcRecord.transactionDate,
            description: rbcRecord.description,
            expenseImportKeyword: keyword,
          };

          importableResults.push(importableResult);

          return false;
        }

        return true;
      });
    });

    return {
      records: importableResults,
      totalRows: this.csvResult.records.length,
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
      totalRows: 0,
    };
  }
}

export { RbcImportConvertor, ScotiaImportConvertor, Importer };
