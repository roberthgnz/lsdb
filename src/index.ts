type GenericObject = {
  [key: string]: unknown;
};

type Document = {
  _id?: string;
  [key: string]: unknown;
};

type Collection = Document[];

enum Operator {
  Equals = '$eq',
  NotEquals = '$ne',
  In = '$in',
  NotIn = '$nin',
  GreaterThen = '$gt',
  GreaterThenOrEqual = '$gte',
  LessThen = '$lt',
  LessThenOrEqual = '$lte',
}

function makeArray(a: unknown): unknown[] {
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
  [Operator.In]: (a: any, b: any[], options?: { strict: boolean }) => {
    const predicate = options?.strict
      ? (c: any) => b.some((x: any) => c === x) 
      : (c: any) => b.some((x: any) => String(c).includes(x));
    return makeArray(a).some(predicate);
  },
  [Operator.NotIn]: (a: any, b: any[], options?: { strict: boolean }) => {
    const aList = makeArray(a);

    if (aList.length === 0) {
      return true;
    }
    const predicate = options?.strict
      ? (c: any) => b.some((x: any) => c === x) 
      : (c: any) => b.some((x: any) => String(c).includes(x));

    return !makeArray(a).some(predicate);
  }
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

type WhereArrayOperators = Operator.In | Operator.NotIn;

type WhereCondition<T extends string, T1> = { [x in T]: T1 };
type WhereOptions<T> = {
  [fieldKey in keyof T]: Partial<WhereCondition<WhereOperators, any>> &
    (Partial<WhereCondition<WhereArrayOperators, any[]>> | Partial<WhereCondition<WhereArrayOperators, {
      values: any[],
      strict: true
    }>>);
};

type WhereOut = {
  valueToFilterBy: any;
  field: string;
  operator: string;
  options?: {
    strict: boolean
  }
};

class Lsdb {
  private database: string;
  private collections: { [key: string]: Collection };

  /**
   * @param {String} database The "Database" name
   */
  constructor(database: string) {
    this.database = database;

    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }

    this.collections = JSON.parse(localStorage.getItem(database) || '{}');
  }

  private handleWhere(where: WhereOptions<Document>): WhereOut {
    for (const field in where) {
      if (!where[field]) continue;

      const filters = where[field];

      for (const op in filters) {
        const operator = op as Operator;

        if (Object.prototype.hasOwnProperty.call(filters, operator)) {          
          const areOptionsProvided = Object.prototype.hasOwnProperty.call(filters[operator], 'values');

          const valueToFilterBy = areOptionsProvided 
            ? filters[operator].values 
            : filters[operator];

          const options = areOptionsProvided ? {
            strict: Boolean(filters[operator].strict)
          } : undefined

          return { field, operator, valueToFilterBy, options };
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
   * @param {String} entity Name of collection
   * @returns {Number} Number of data within the collection
   */
  count(entity: string): number {
    return Object.keys(this.collections[entity]).length;
  }

  /**
   * Get multiple entries
   * @param {String} entity Name of collection
   * @param {WhereOptions} where Options which consist of mongo-like definition
   * @returns {Collection|undefined} Collection or undefined
   */
  find(entity: string, { where }: { where: WhereOptions<Document> }): Collection | undefined {
    const dataset = this.collections[entity];

    const { valueToFilterBy, field, operator, options } = this.handleWhere(where);

    return dataset.filter((x: Query<GenericObject>) =>
      OperatorOperations[operator as Operator](x[field], valueToFilterBy, options),
    );
  }

  /**
   * Get single entry
   * @param {String} entity Name of collection
   * @param where Options which consist of mongo-like definition
   * @returns {Document|undefined} Single entry or undefined
   */
  findOne(entity: string, { where }: { where: WhereOptions<Document> }): Document | undefined {
    const dataset = this.collections[entity];

    const { valueToFilterBy, field, operator } = this.handleWhere(where);

    if (!operator) return undefined;

    return dataset.find((x: Query<GenericObject>) =>
      OperatorOperations[operator as Operator](x[field], valueToFilterBy),
    );
  }

  /**
   * Creating list of collections
   * @param {Array} data Contains the name of the collections
   * @param {boolean} replace If set to true, previously created collections will be deleted.
   * @returns Success or failure
   */
  collection(
    data: string[],
    replace = false,
  ): {
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

      data.forEach((value) => {
        this.collections[value] = replace ? [] : this.collections[value] || [];
      });

      localStorage.setItem(this.database, JSON.stringify(this.collections));

      return {
        success: 'Collection created',
      };
    } catch (e) {
      return { error: 'Something went wrong' };
    }
  }

  /**
   * Creating collection entry
   * @param {String} entity Name of collection
   * @param {Document} data Data of collection
   * @returns {Document} Single entry
   */
  insert(entity: string, data: Document): Document {
    const collection = this.collections[entity];

    const _id = Math.random().toString(36).substr(2, 9);

    const entry = {
      ...data,
      _id,
    };

    const dataset = [...collection, entry];

    this.collections[entity] = dataset;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return entry;
  }

  /**
   * Get single collection or all collection entries
   * @returns {Array} Collection or entries of collection
   */
  all(entity?: string): Collection | { [key: string]: Collection } {
    if (entity) {
      return this.collections[entity];
    }
    return this.collections;
  }

  /**
   * Update collection entry
   * @param {String} entity Name of collection
   * @param {Document} params Parameters to change
   * @param {Document} data Data of collection
   * @returns {Document} Updated collection entry
   */
  update(entity: string, params: Document, data: Document): Document {
    const key = Object.keys(params)[0];

    const index = this.collections[entity].findIndex((i) => {
      return i[key] === params[key];
    });

    const doc = this.collections[entity][index];

    this.collections[entity][index] = { ...doc, ...data };

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return doc;
  }

  /**
   * Delete entry from collection
   * @param {String} entity Name of collection
   * @param where Options which consist of mongo-like definition
   * @returns {Collection} Collection without deleted entry
   */
  delete<Document>(entity: string, { where }: { where: WhereOptions<Document> }): Collection {
    const dataset = this.collections[entity];

    const { valueToFilterBy, field, operator, options } = this.handleWhere(where);

    const filtered = dataset.filter(
      (x: Query<GenericObject>) => !OperatorOperations[operator as Operator](x[field], valueToFilterBy, options),
    );

    this.collections[entity] = filtered;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return filtered;
  }
}

export default Lsdb;
