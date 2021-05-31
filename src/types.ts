export interface GenericObject {
  [key: string]: any;
}

export enum Operator {
  Equals = "$eq",
  NotEquals = "$ne",
  In = "$in",
  GreaterThen = "$gt",
  GreaterThenOrEqual = "$gte",
  LessThen = "$lt",
  LessThenOrEqual = "$lte",
}

export type WhereOperators =
  | Operator.Equals
  | Operator.NotEquals
  | Operator.GreaterThen
  | Operator.GreaterThenOrEqual
  | Operator.LessThen
  | Operator.LessThenOrEqual;

type WhereArrayOperators = Operator.In;
type WhereCondition<T extends string, T1> = { [x in T]: T1 };

export type WhereOptions<T> = {
  [fieldKey in keyof T]: Partial<WhereCondition<WhereOperators, any>> &
    Partial<WhereCondition<WhereArrayOperators, Array<any>>>;
};
