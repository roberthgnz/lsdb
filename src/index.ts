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
  [Operator.In]: (a: any, b: any[]) => {
    const aArray = makeArray(a);
    const bArray = makeArray(b);
    return bArray.some((value) => aArray.includes(value));
  },
  [Operator.NotIn]: (a: any, b: any[]) => {
    const aArray = makeArray(a);
    const bArray = makeArray(b);
    return bArray.some((value) => !aArray.includes(value));
  },
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
    Partial<WhereCondition<WhereArrayOperators, any[]>>;
};
type FindOptions<T> = {
  where?: WhereOptions<T>;
  limit?: number;
  skip?: number;
  sort?: {
    field: keyof T;
    order: 'asc' | 'desc';
  };
};

type WhereOut = {
  valueToFilterBy: any;
  field: string;
  operator: string;
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

  private handleWhere(where: WhereOptions<Document> | undefined): WhereOut {
    if (!where) return { valueToFilterBy: undefined, field: '', operator: '' };

    for (const field in where) {
      if (!where[field]) continue;

      const filters = where[field];

      for (const op in filters) {
        const operator = op as Operator;

        if (Object.prototype.hasOwnProperty.call(filters, operator)) {
          const areOptionsProvided = Object.prototype.hasOwnProperty.call(filters[operator], 'values');

          const valueToFilterBy = areOptionsProvided ? filters[operator].values : filters[operator];

          return { field, operator, valueToFilterBy };
        }
      }
    }

    return { valueToFilterBy: undefined, field: '', operator: '' };
  }

  private createEntry(data: Document): Document {
    const _id = Math.random().toString(36).substr(2, 9);

    const entry = {
      ...data,
      _id,
    };

    return entry;
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
   * @param {FindOptions} options Options, where, limit, skip, sort
   * @returns {Collection|undefined} Collection or undefined
   */
  find(entity: string, { where, limit, skip = 0, sort }: FindOptions<Document>): Collection | undefined {
    const dataset = this.collections[entity];

    let result = dataset.slice(skip, limit);

    if (where) {
      const { field, operator, valueToFilterBy } = this.handleWhere(where);
      result = result.filter((x) => OperatorOperations[operator as Operator](x[field], valueToFilterBy));
    }

    if (sort) {
      const { field, order } = sort;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result = result.sort((a, b) => (order === 'asc' ? a[field] - b[field] : b[field] - a[field]));
    }

    return result;
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

    return dataset.find((x) => OperatorOperations[operator as Operator](x[field], valueToFilterBy));
  }

  /**
   * Creating list of collections
   * @param {String|Array} data Contains the name of the collection/s
   * @param {boolean} replace If set to true, previously created collections will be deleted.
   * @returns Success or failure
   */
  collection(data: string | string[], replace = false): unknown {
    try {
      if (Array.isArray(data)) {
        data.forEach((x) => {
          if (typeof x !== 'string') {
            throw new Error('All values must be strings');
          }
        });
      } else {
        if (typeof data !== 'string') {
          throw new Error('Value must be string');
        }
      }

      if (Array.isArray(data)) {
        data.forEach((collection) => {
          this.collections[collection] = replace ? [] : this.collections[collection] || [];
        });
      } else {
        this.collections[data] = replace ? [] : this.collections[data] || [];
      }

      localStorage.setItem(this.database, JSON.stringify(this.collections));

      return {
        status: 'success',
      };
    } catch (e) {
      return e;
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

    const entry = this.createEntry(data);

    const dataset = [...collection, entry];

    this.collections[entity] = dataset;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return entry;
  }

  /**
   * Creating many collection entries
   * @param {String} entity Name of collection
   * @param {Document[]} data Data of collection
   * @returns {Document[]} Multiple entries
   */
  insertMany(entity: string, data: Document[]): Document[] {
    const collection = this.collections[entity];

    const entries = data.map((data) => this.createEntry(data));

    const dataset = [...collection, ...entries];

    this.collections[entity] = dataset;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return entries;
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
  delete(entity: string, { where }: { where: WhereOptions<Document> }): Collection {
    const dataset = this.collections[entity];

    const { valueToFilterBy, field, operator } = this.handleWhere(where);

    const filtered = dataset.filter((x) => !OperatorOperations[operator as Operator](x[field], valueToFilterBy));

    this.collections[entity] = filtered;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return filtered;
  }
}

export default Lsdb;
