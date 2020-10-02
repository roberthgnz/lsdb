interface obj {
  [key: string]: any;
}

enum Operator {
  Equals = "$eq",
  NotEquals = "$ne",
  In = "$in",
  GreaterThen = "$gt",
  GreaterThenOrEqual = "$gte",
  LessThen = "$lt",
  LessThenOrEqual = "$lte",
}

const OperatorOperations = {
  [Operator.Equals]: (a: any, b: any) => a === b,
  [Operator.NotEquals]: (a: any, b: any) => a !== b,
  [Operator.GreaterThen]: (a: any, b: any) => a > b,
  [Operator.GreaterThenOrEqual]: (a: any, b: any) => a >= b,
  [Operator.LessThen]: (a: any, b: any) => a < b,
  [Operator.LessThenOrEqual]: (a: any, b: any) => a <= b,
  [Operator.In]: (a: any, b: any) => String(a).includes(b),
};

type WhereOperators =
  | Operator.Equals
  | Operator.NotEquals
  | Operator.GreaterThen
  | Operator.GreaterThenOrEqual
  | Operator.LessThen
  | Operator.LessThenOrEqual;

type WhereArrayOperators = Operator.In;

type WhereCondition<T extends string, T1> = { [x in T]: T1 };
type WhereOptions<T> = {
  [fieldKey in keyof T]: Partial<WhereCondition<WhereOperators, any>> &
    Partial<WhereCondition<WhereArrayOperators, Array<any>>>;
};

/**
 * @author Roberth González
 */
class Lsdb {
  private database: string;
  private data: obj;

  /**
   *
   * @param {String} database - The "Database" name
   */
  constructor(database: string) {
    this.database = database;

    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }

    this.data = JSON.parse(localStorage.getItem(database) || "{}");
  }

  /**
   * Count number of collection items
   * @param {String} entity - Name of collection
   * @returns {Number} - Number of data within the collection
   */
  count(entity: string): number {
    return this.data[entity].length;
  }

  /**
   * Get multiple documents
   * @param {String} entity - Name of collection
   * @param where - Options which consist of mongo-like definition
   * @returns {Array|Error} - Array of matched data or thrown an error in case of invalid where clause
   */
  find<T>(
    entity: string,
    { where }: { where: WhereOptions<T> }
  ): T[] | undefined {
    let dataset = this.data[entity];

    for (const field in where) {
      const filters = where[field];
      for (const operator in where[field]) {
        const valueToFilterBy = filters[operator as Operator];
        dataset = dataset.filter((x: { [x in keyof T]: any }) =>
          OperatorOperations[operator as Operator](x[field], valueToFilterBy)
        );
      }
    }

    return dataset;
  }

  /**
   * Get single document
   * @param {String} entity - Name of collection
   * @param where - Options which consist of mongo-like definition
   * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
   */
  findOne<T>(entity: string, { where }: { where: WhereOptions<T> }): T {
    let dataset = this.data[entity];

    for (const field in where) {
      const filters = where[field];
      for (const operator in where[field]) {
        const valueToFilterBy = filters[operator as Operator];
        return dataset.find((x: { [x in keyof T]: any }) =>
          OperatorOperations[operator as Operator](x[field], valueToFilterBy)
        );
      }
    }

    return dataset;
  }

  /**
   * Creating list of collections
   * @param {Array} data - Contains the name of the collections
   */
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

  /**
   * Creating new collection
   * @param {String} entity - Name of collection
   * @param data - Data of collection
   * @returns Array of created collection
   */
  insert(entity: string, { data }: { data: any }) {
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

  /**
   * @returns - returns all the collections
   */
  all(): object {
    return this.data;
  }

  /**
   * Update collection
   * @param {String} entity - Name of collection
   * @param {Object} params - Parameters to change
   * @param data - Data of collection
   * @returns Array of created collection
   */
  update(entity: string, params: obj, data: any): any {
    const key = Object.keys(params)[0];
    const index = this.data[entity].findIndex((i: { [x: string]: any }) => {
      return i[key] === params[key];
    });
    let doc = this.data[entity][index];
    this.data[entity][index] = { ...doc, ...data };
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return doc;
  }

  /**
   * Creating new collection
   * @param {String} entity - Name of collection
   * @param params - Parameters to delete
   * @returns Array of created collection
   */
  delete(entity: string, params: obj): void {
    const key = Object.keys(params)[0];
    this.data[entity] = [...this.data[entity]].filter((i) => {
      return i[key] !== params[key];
    });
    localStorage.setItem(this.database, JSON.stringify(this.data));
  }
}
