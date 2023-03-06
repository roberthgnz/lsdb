export type Entry = {
  _id?: string;
  [key: string]: unknown;
};

export type Collection = Entry[];

export enum Operator {
  Equals = '$eq',
  NotEquals = '$ne',
  In = '$in',
  NotIn = '$nin',
  GreaterThen = '$gt',
  GreaterThenOrEqual = '$gte',
  LessThen = '$lt',
  LessThenOrEqual = '$lte',
}

export type WhereQuery<T> = {
  [K in keyof T]?: {
    [key in Operator]?: T[K] | T[K][];
  };
};

export type FindOptions<T> = {
  where?: WhereQuery<T>;
  limit?: number;
  skip?: number;
  sort?: {
    field: keyof T;
    order: 'asc' | 'desc';
  };
};

export type WhereOut = {
  valueToFilterBy: any;
  field: string;
  operator: string;
};
