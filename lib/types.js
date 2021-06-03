define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Operator = void 0;
    var Operator;
    (function (Operator) {
        Operator["Equals"] = "$eq";
        Operator["NotEquals"] = "$ne";
        Operator["In"] = "$in";
        Operator["GreaterThen"] = "$gt";
        Operator["GreaterThenOrEqual"] = "$gte";
        Operator["LessThen"] = "$lt";
        Operator["LessThenOrEqual"] = "$lte";
    })(Operator = exports.Operator || (exports.Operator = {}));
});
