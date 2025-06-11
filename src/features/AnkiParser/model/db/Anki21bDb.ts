import { Db } from "./Db";

type RawData = {
  columns: string[];
  values: (string | number | Uint8Array | null)[][];
};

type TemplateRow = Record<string, string | number | null>;

type Model = Record<string, string | number | null> & {
  id: string;
  tmpls?: TemplateRow[];
  flds?: Record<string, string | number | null>[];
};

export default class Anki21bDb extends Db {
  private decodeValue(
    value: string | number | Uint8Array | null
  ): string | number | null {
    if (value instanceof Uint8Array) {
      return new TextDecoder("utf-8").decode(value);
    }
    return value;
  }

  private parseRow(
    columns: string[],
    values: (string | number | Uint8Array | null)[]
  ): Record<string, string | number | null> {
    return columns.reduce((acc, columnName, idx) => {
      acc[columnName] = this.decodeValue(values[idx]);
      return acc;
    }, {} as Record<string, string | number | null>);
  }

  private async getFields(
    ntid: string
  ): Promise<Record<string, string | number | null>[]> {
    const rawFields: RawData[] = this.db.exec(
      `SELECT * FROM fields WHERE ntid = ${ntid}`
    );
    if (!rawFields.length) return [];

    const { columns, values } = rawFields[0];
    return values.map((valueArray) => this.parseRow(columns, valueArray));
  }

  private async getTemplates(ntid?: string): Promise<TemplateRow[]> {
    const rows: RawData[] = this.db.exec(
      ntid
        ? `SELECT * FROM templates WHERE ntid = ${ntid} ORDER BY ord`
        : `SELECT * FROM templates ORDER BY ord`
    );

    const result: TemplateRow[] = [];

    for (const raw of rows) {
      const { columns, values } = raw;
      for (const valueArray of values) {
        const row = this.parseRow(columns, valueArray);
        if (typeof row.config === "string") {
          const [qfmt = "", afmt = ""] = row.config.split("\u0012");
          row.qfmt = qfmt;
          row.afmt = afmt;
        }
        result.push(row);
      }
    }

    return result;
  }

  async getModels(): Promise<Record<string, Model>> {
    const modelsRaw = await this.getNoteTypes();
    const result: Record<string, Model> = {};

    for (const raw of modelsRaw) {
      const { columns, values } = raw;
      if (!values.length) continue;

      const model = this.parseRow(columns, values[0]) as Model;
      if (!model.id) continue;

      const modelId = model.id.toString();
      model.tmpls = await this.getTemplates(modelId);
      model.flds = await this.getFields(modelId);
      result[modelId] = model;
    }

    return result;
  }

  private async getNoteTypes(): Promise<RawData[]> {
    return this.db.exec("SELECT * FROM notetypes");
  }

  private async getNoteType(id: string): Promise<RawData[]> {
    return this.db.exec(`SELECT * FROM notetypes WHERE ntid = ${id}`);
  }
}
