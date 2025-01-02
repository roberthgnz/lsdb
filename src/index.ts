type Element<T = unknown> = T & {
  _id: string;
};

type Collection<T = unknown> = Element<T>[];

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

type EqualsOperation<T> = (a: T, b: T) => boolean;
type InOperation<T> = (a: T, b: T[]) => boolean;
type ComparisonOperation = (a: number, b: number) => boolean;

interface OperatorMap<T> {
  [Operator.Equals]: EqualsOperation<T>;
  [Operator.NotEquals]: EqualsOperation<T>;
  [Operator.In]: InOperation<T>;
  [Operator.NotIn]: InOperation<T>;
  [Operator.GreaterThen]: ComparisonOperation;
  [Operator.GreaterThenOrEqual]: ComparisonOperation;
  [Operator.LessThen]: ComparisonOperation;
  [Operator.LessThenOrEqual]: ComparisonOperation;
}

type WhereQuery<T> = {
  [K in keyof T]?: {
    [key in Operator]?: T[K] | T[K][];
  };
};

type FindOptions<T> = {
  where?: WhereQuery<T>;
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

const makeArray = (a: unknown): unknown[] => {
  if (!a) {
    return [];
  }
  const value = Array.isArray(a) ? a : [a];

  return value;
};

const sortByField = <T>(field: keyof T, order = 'asc') => {
  return (a: T, b: T) => {
    const aValue = a[field];
    const bValue = b[field];
    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    } else if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    } else {
      return 0;
    }
  };
};

const OperatorOperations: OperatorMap<any> = {
  [Operator.Equals]: (a, b) => a === b,
  [Operator.NotEquals]: (a, b) => a !== b,
  [Operator.In]: (a, b) => {
    const aArray = makeArray(a);
    const bArray = makeArray(b);
    return bArray.some((value) => aArray.includes(value));
  },
  [Operator.NotIn]: (a, b) => {
    const aArray = makeArray(a);
    const bArray = makeArray(b);
    return bArray.some((value) => !aArray.includes(value));
  },
  [Operator.GreaterThen]: (a, b) => a > b,
  [Operator.GreaterThenOrEqual]: (a, b) => a >= b,
  [Operator.LessThen]: (a, b) => a < b,
  [Operator.LessThenOrEqual]: (a, b) => a <= b,
};

class Lsdb {
  private database: string;
  private collections: { [key: string]: Collection };

  constructor(database: string) {
    this.database = database;

    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }

    this.collections = JSON.parse(localStorage.getItem(database) || '{}');
  }

  private handleWhere<T>(where: WhereQuery<T> | undefined): WhereOut {
    if (!where) return { valueToFilterBy: undefined, field: '', operator: '' };

    for (const field in where) {
      if (!where[field]) continue;

      const filters = where[field];

      for (const op in filters) {
        const operator = op as Operator;

        if (!OperatorOperations[operator]) {
          throw new Error(`Operator ${operator} is not supported`);
        }

        return { valueToFilterBy: filters[operator], field, operator };
      }
    }

    return { valueToFilterBy: undefined, field: '', operator: '' };
  }

  private insertElement<T>(data: T): Element<T> {
    const _id = Math.random().toString(36).slice(2, 9);

    const Element = {
      ...data,
      _id,
    };

    return Element;
  }

  /**
   * Count the number of entries in the collection
   */
  count(entity: string): number {
    return Object.keys(this.collections[entity]).length;
  }

  /**
   * Get multiple entries
   */
  find<T>(entity: string, { where, limit, skip = 0, sort }: FindOptions<T>): Element<T>[] | undefined {
    const dataset = this.collections[entity] as Element<T>[];

    let result = sort ? dataset : dataset.slice(skip, limit);

    if (where) {
      const { field, operator, valueToFilterBy } = this.handleWhere(where);
      result = result.filter((x) => OperatorOperations[operator as Operator](x[field], valueToFilterBy));
    }

    if (sort) {
      const { field, order } = sort;

      result = result.sort(sortByField(field, order));
    }

    return result.slice(skip, limit);
  }

  /**
   * Get single Element
   */
  findOne<T>(entity: string, { where }: { where: WhereQuery<T> }): Element<T> | undefined {
    const dataset = this.collections[entity] as Element<T>[];

    const { valueToFilterBy, field, operator } = this.handleWhere(where);

    if (!operator) return undefined;

    return dataset.find((x) => OperatorOperations[operator as Operator](x[field], valueToFilterBy));
  }

  /**
   * Creating list of collections
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
   * Creating collection Element
   */
  insert<T>(entity: string, data: T): Element<T> {
    const collection = this.collections[entity] as Element<T>[];

    const Element = this.insertElement(data);

    const dataset = [...collection, Element];

    this.collections[entity] = dataset;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return Element;
  }

  /**
   * Creating many collection entries
   */
  insertMany<T>(entity: string, data: T[]): Element<T>[] {
    const collection = this.collections[entity] as Element<T>[];

    const entries = data.map((data) => this.insertElement(data));

    const dataset = [...collection, ...entries];

    this.collections[entity] = dataset;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return entries;
  }

  /**
   * Get single collection or all collection entries
   */
  all<T>(entity?: string): Element<T>[] | { [key: string]: Element<T>[] } {
    if (entity) {
      return this.collections[entity] as Element<T>[];
    }
    return this.collections as { [key: string]: Element<T>[] };
  }

  /**
   * Update collection Element
   */
  update<T>(
    entity: string,
    params: {
      [key: string]: unknown;
    },
    data: T,
  ): Element<T> {
    const key = Object.keys(params)[0];

    const index = (this.collections[entity] as Element<T>[]).findIndex((i) => {
      return i[key] === params[key];
    });

    const doc = (this.collections[entity] as Element<T>[])[index];

    this.collections[entity][index] = { ...doc, ...data };

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return doc;
  }

  /**
   * Delete Element from collection
   */
  delete<T>(entity: string, { where }: { where: WhereQuery<T> }): Element<T>[] {
    const dataset = this.collections[entity] as Element<T>[];

    const { valueToFilterBy, field, operator } = this.handleWhere(where);

    const filtered = dataset.filter((x) => !OperatorOperations[operator as Operator](x[field], valueToFilterBy));

    this.collections[entity] = filtered;

    localStorage.setItem(this.database, JSON.stringify(this.collections));

    return filtered;
  }
}

export default Lsdb;
