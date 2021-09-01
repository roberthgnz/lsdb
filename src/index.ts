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
        if (Object.prototype.hasOwnProperty.call(filters, operator)) {
          const valueToFilterBy = filters[operator as Operator];
          return { field, operator, valueToFilterBy };
        }
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

    if (!operator) return dataset;

    return dataset.find((x: Query<GenericObject>) =>
      OperatorOperations[operator as Operator](x[field], valueToFilterBy),
    );
  }

  /**
   * Creating list of collections
   * @param {Array} data - Contains the name of the collections
   */
  collection(data: string[]): {
    error?: string;
    success?: string;
  } {
    try {
      if (!Array.isArray(data)) {
        return { error: 'Invalid data' };
      }
      if (data.some((value) => typeof value !== 'string')) {
        return { error: 'All values must be string' };
      }

      data.forEach((value) => (this.data[value] = []));
      localStorage.setItem(this.database, JSON.stringify(this.data));

      return {
        success: 'Collection created',
      };
    } catch (e) {
      return { error: 'Something went wrong' };
    }
  }

  /**
   * Creating collection entry
   * @param {String} entity - Name of collection
   * @param data - Data of collection
   * @returns Array of created collection
   */
  insert(entity: string, data: any): any {
    const dataset = [...this.data[entity]];

    // random string with length of 10
    const _id = Math.random().toString(36).substr(2, 9);

    const newData = { ...data, _id };

    dataset.push(newData);

    this.data[entity] = dataset;

    localStorage.setItem(this.database, JSON.stringify(this.data));

    return newData;
  }

  /**
   * @returns - returns all the collections
   */
  all(entity?: string): object {
    if (entity) {
      return this.data[entity];
    }
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
    const dataset = this.data[entity];
    const { valueToFilterBy, field, operator } = this.handleWhere(where);
    const filtered = dataset.filter(
      (x: Query<GenericObject>) => !OperatorOperations[operator as Operator](x[field], valueToFilterBy),
    );
    this.data[entity] = filtered;
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return dataset;
  }
}

export default Lsdb;
