declare global {
  type Entry = {
    _id?: string;
    [key: string]: unknown;
  };

  type Collection = Entry[];

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

  type WhereQuery<T> = {
    [K in keyof T]?: {
      [key in Operator]?: T[K] | T[K][];
    };
  }

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
}

export {}