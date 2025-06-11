import type { Collection, Note } from "./Db";

export default class FakeDb {
  getCollection(): Promise<Collection> {
    throw new Error("Method not implemented.");
  }

  getNotes(): Record<number, Note> {
    return {
      0: {
        id: 0,
        guid: "fake-guid",
        mid: 0,
        mod: 0,
        usn: 0,
        tags: "",
        flds: `doesn't support this format`,
        sfld: "doesn't support this format",
        csum: 0,
        flags: 0,
        data: "",
        cards: [],
      },
    };
  }

  async getModels(): Promise<Record<number, unknown>> {
    return {
      [0]: {
        id: 0,
        name: "message",
        flds: [
          {
            name: "message",
          },
        ],
      },
    };
  }
}
