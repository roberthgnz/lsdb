export interface GenericObject {
    [key: string]: any;
}
export declare enum Operator {
    Equals = "$eq",
    NotEquals = "$ne",
    In = "$in",
    GreaterThen = "$gt",
    GreaterThenOrEqual = "$gte",
    LessThen = "$lt",
    LessThenOrEqual = "$lte"
}
export declare type WhereOperators = Operator.Equals | Operator.NotEquals | Operator.GreaterThen | Operator.GreaterThenOrEqual | Operator.LessThen | Operator.LessThenOrEqual;
declare type WhereArrayOperators = Operator.In;
declare type WhereCondition<T extends string, T1> = {
    [x in T]: T1;
};
export declare type WhereOptions<T> = {
    [fieldKey in keyof T]: Partial<WhereCondition<WhereOperators, any>> & Partial<WhereCondition<WhereArrayOperators, Array<any>>>;
};
export {};
