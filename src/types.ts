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

export type EqualsOperation<T> = (a: T, b: T) => boolean;
export type InOperation<T> = (a: T, b: T[]) => boolean;
export type ComparisonOperation = (a: number, b: number) => boolean;

export interface OperatorMap<T> {
  [Operator.Equals]: EqualsOperation<T>;
  [Operator.NotEquals]: EqualsOperation<T>;
  [Operator.In]: InOperation<T>;
  [Operator.NotIn]: InOperation<T>;
  [Operator.GreaterThen]: ComparisonOperation;
  [Operator.GreaterThenOrEqual]: ComparisonOperation;
  [Operator.LessThen]: ComparisonOperation;
  [Operator.LessThenOrEqual]: ComparisonOperation;
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
