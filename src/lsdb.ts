interface whereOptions {
  field: string;
  operator: string;
  value: any;
}

/**
 * @author Roberth González
 */
class Lsdb {
  private database: string;
  private data: object;

  constructor(database: string) {
    this.database = database;

    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }

    this.data = JSON.parse(localStorage.getItem(database));
  }

  count(entity: string): number {
    return this.data[entity].length
  }

  find(entity: string, { where }): any[] {
    const { field, operator, value }: whereOptions = where;
    switch (operator) {
      case "eq":
        return this.data[entity].filter(
          (i: { [x: string]: any }) => i[field] === value
        );
      case "ne":
        return this.data[entity].filter(
          (i: { [x: string]: any }) => i[field] !== value
        );
      case "in":
        return this.data[entity].filter(
          (i: { [x: string]: any; }) => String(i[field]).includes(value)
        );
      default:
        throw new Error(`Unhandled whereClause: ${field} ${operator} ${value}`);
    }
  }

  findOne(entity: string, { where }): any {
    const { field, operator, value }: whereOptions = where;
    switch (operator) {
      case "eq":
        return this.data[entity].find(
          (i: { [x: string]: any }) => i[field] === value
        );
      case "ne":
        return this.data[entity].find(
          (i: { [x: string]: any }) => i[field] !== value
        );
      default:
        throw new Error(`Unhandled whereClause: ${field} ${operator} ${value}`);
    }
  }

  collection(data: string[]): void {
    try {
      if (!Array.isArray(data)) throw new Error("An array was expected");
      if (data.some((value) => typeof value !== "string")) {
        throw new Error("All values must be string");
      }
      data.forEach((value) => (this.data[value] = []));
      localStorage.setItem(this.database, JSON.stringify(this.data));
    } catch (e) {
      console.error(e.name + ": " + e.message);
    }
  }

  create(entity: string, { data }: { data: any }) {
    let docs = [...this.data[entity]];
    let limit = docs.length - 1;
    let _id = !docs.length ? 0 : Number(docs[limit]["_id"]) + 1;

    docs.push({
      _id,
      ...data,
    });

    this.data[entity] = docs;

    localStorage.setItem(this.database, JSON.stringify(this.data));

    return docs;
  }

  all(): object {
    return this.data;
  }

  update(entity: string, params: object, data: any): any {
    const key = Object.keys(params)[0];
    const index = this.data[entity].findIndex((i: { [x: string]: any }) => {
      return i[key] === params[key];
    });
    let doc = this.data[entity][index];
    this.data[entity][index] = { ...doc, ...data };
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return doc;
  }

  delete(entity: string, params: object): void {
    const key = Object.keys(params)[0];
    this.data[entity] = [...this.data[entity]].filter((i) => {
      return i[key] !== params[key];
    });
    localStorage.setItem(this.database, JSON.stringify(this.data));
  }
}
