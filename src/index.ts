interface GenericObject {
  [key: string]: any;
}

enum Operator {
  Equals = '$eq',
  NotEquals = '$ne',
  In = '$in',
  GreaterThen = '$gt',
  GreaterThenOrEqual = '$gte',
  LessThen = '$lt',
  LessThenOrEqual = '$lte',
}

function makeArray(a: any): any[] {
  if (!a) {
    return [];
  }
  const value = Array.isArray(a) ? a : [a];

  return value;
}

const OperatorOperations = {
  [Operator.Equals]: (a: any, b: any) => a === b,
  [Operator.NotEquals]: (a: any, b: any) => a !== b,
  [Operator.GreaterThen]: (a: any, b: any) => a > b,
  [Operator.GreaterThenOrEqual]: (a: any, b: any) => a >= b,
  [Operator.LessThen]: (a: any, b: any) => a < b,
  [Operator.LessThenOrEqual]: (a: any, b: any) => a <= b,
  [Operator.In]: (a: any, b: any[]) => makeArray(a).some((c) => b.some((x: any) => String(c).includes(x))),
};

type Query<T> = {
  [P in keyof T]?: T[P];
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
    Partial<WhereCondition<WhereArrayOperators, any[]>>;
};

type WhereOut = {
  valueToFilterBy: any;
  field: string;
  operator: string;
};

class Lsdb {
  private database: string;
  private data: GenericObject;

  /**
   *
   * @param {String} database - The "Database" name
   */
  constructor(database: string) {
    this.database = database;

    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }

    this.data = JSON.parse(localStorage.getItem(database) || '{}');
  }

  private handleWhere(where: WhereOptions<any>): WhereOut {
    for (const field in where) {
      if (!where[field]) continue;
      const filters = where[field];
      for (const operator in filters) {
        if (operator === '$in') {
          return {
            valueToFilterBy: filters[operator],
            field,
            operator,
          };
        }
        const valueToFilterBy = filters[operator as Operator];
        return { valueToFilterBy, field, operator };
      }
    }
    return {
      valueToFilterBy: '',
      field: '',
      operator: '',
    };
  }

  /**
   * Count the number of entries in the collection
   * @param {String} entity - Name of collection
   * @returns {Number} - Number of data within the collection
   */
  count(entity: string): number {
    return this.data[entity].length;
  }

  /**
   * Get multiple entries
   * @param {String} entity - Name of collection
   * @param where - Options which consist of mongo-like definition
   * @returns {Array|Error} - Array of matched data or thrown an error in case of invalid where clause
   */
  find<T>(entity: string, { where }: { where: WhereOptions<T> }): T[] | undefined {
    let dataset = this.data[entity];

    const { valueToFilterBy, field, operator }: WhereOut = this.handleWhere(where);

    dataset = dataset.filter((x: Query<GenericObject>) =>
      OperatorOperations[operator as Operator](x[field], valueToFilterBy),
    );

    return dataset;
  }

  /**
   * Get single entry
   * @param {String} entity - Name of collection
   * @param where - Options which consist of mongo-like definition
   * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
   */
  findOne<T>(entity: string, { where }: { where: WhereOptions<T> }): T {
    const dataset = this.data[entity];

    const { valueToFilterBy, field, operator } = this.handleWhere(where);

    return dataset.find((x: Query<GenericObject>) =>
      OperatorOperations[operator as Operator](x[field], valueToFilterBy),
    );
  }

  /**
   * Creating list of collections
   * @param {Array} data - Contains the name of the collections
   */
  collection(data: string[]): void {
    try {
      if (!Array.isArray(data)) throw new Error('An array was expected');
      if (data.some((value) => typeof value !== 'string')) {
        throw new Error('All values must be string');
      }
      data.forEach((value) => (this.data[value] = []));
      localStorage.setItem(this.database, JSON.stringify(this.data));
    } catch (e) {
      throw e;
    }
  }

  /**
   * Creating collection entry
   * @param {String} entity - Name of collection
   * @param data - Data of collection
   * @returns Array of created collection
   */
  insert(entity: string, { data }: { data: any }) {
    const docs = [...this.data[entity]];
    const limit = docs.length - 1;
    const _id = !docs.length ? 0 : Number(docs[limit]._id) + 1;

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
   * Update collection entry
   * @param {String} entity - Name of collection
   * @param {Object} params - Parameters to change
   * @param data - Data of collection
   * @returns Array of created collection
   */
  update(entity: string, params: GenericObject, data: any): any {
    const key = Object.keys(params)[0];
    const index = this.data[entity].findIndex((i: { [x: string]: any }) => {
      return i[key] === params[key];
    });
    const doc = this.data[entity][index];
    this.data[entity][index] = { ...doc, ...data };
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return doc;
  }

  /**
   * Delete entry from collection
   * @param {String} entity - Name of collection
   * @param where - Options which consist of mongo-like definition
   * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
   */
  delete<T>(entity: string, { where }: { where: WhereOptions<T> }): T {
    let dataset = this.data[entity];
    const { valueToFilterBy, field, operator } = this.handleWhere(where);
    dataset = dataset.filter(
      (x: Query<GenericObject>) => !OperatorOperations[operator as Operator](x[field], valueToFilterBy),
    );
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return dataset;
  }
}

export default Lsdb;
