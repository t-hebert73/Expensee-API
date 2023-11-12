type CsvResult = {
  records: Array<Array<string>>;
  headers: Array<string>;
};

class CsvReader {
  file: File;
  delimeter: string = "";
  records: Array<Array<string>> = [];
  headers: Array<string> = [];

  constructor(file: File, delimeter: string = ",") {
    this.file = file;
    this.delimeter = delimeter;
  }

  async read(): Promise<CsvResult> {
    const textContent = await this.file.text();

    this.records = textContent.split("\n").map((x) => x.split(this.delimeter));
    this.headers = this.records.splice(0, 1)[0];

    return {
      records: this.records,
      headers: this.headers,
    };
  }
}

export default CsvReader;

export type { CsvResult };