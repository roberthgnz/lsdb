"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var _a;
var Operator;
(function (Operator) {
    Operator["Equals"] = "$eq";
    Operator["NotEquals"] = "$ne";
    Operator["In"] = "$in";
    Operator["GreaterThen"] = "$gt";
    Operator["GreaterThenOrEqual"] = "$gte";
    Operator["LessThen"] = "$lt";
    Operator["LessThenOrEqual"] = "$lte";
})(Operator || (Operator = {}));
function makeArray(a) {
    if (!a) {
        return [];
    }
    var value = Array.isArray(a) ? a : [a];
    return value;
}
var OperatorOperations = (_a = {},
    _a[Operator.Equals] = function (a, b) { return a === b; },
    _a[Operator.NotEquals] = function (a, b) { return a !== b; },
    _a[Operator.GreaterThen] = function (a, b) { return a > b; },
    _a[Operator.GreaterThenOrEqual] = function (a, b) { return a >= b; },
    _a[Operator.LessThen] = function (a, b) { return a < b; },
    _a[Operator.LessThenOrEqual] = function (a, b) { return a <= b; },
    _a[Operator.In] = function (a, b) {
        return makeArray(a).some(function (c) { return b.some(function (x) { return String(c).includes(x); }); });
    },
    _a);
/**
 * @author Roberth González
 */
var Lsdb = /** @class */ (function () {
    /**
     *
     * @param {String} database - The "Database" name
     */
    function Lsdb(database) {
        this.database = database;
        if (localStorage.getItem(this.database) === null) {
            localStorage.setItem(database, JSON.stringify({}));
        }
        this.data = JSON.parse(localStorage.getItem(database) || "{}");
    }
    /**
     * Count the number of entries in the collection
     * @param {String} entity - Name of collection
     * @returns {Number} - Number of data within the collection
     */
    Lsdb.prototype.count = function (entity) {
        return this.data[entity].length;
    };
    /**
     * Get multiple entries
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Array|Error} - Array of matched data or thrown an error in case of invalid where clause
     */
    Lsdb.prototype.find = function (entity, _a) {
        var where = _a.where;
        var dataset = this.data[entity];
        var _loop_1 = function (field) {
            var filters = where[field];
            var _loop_2 = function (operator) {
                var valueToFilterBy = filters[operator];
                dataset = dataset.filter(function (x) {
                    return OperatorOperations[operator](x[field], valueToFilterBy);
                });
            };
            for (var operator in where[field]) {
                _loop_2(operator);
            }
        };
        for (var field in where) {
            _loop_1(field);
        }
        return dataset;
    };
    /**
     * Get single entry
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
     */
    Lsdb.prototype.findOne = function (entity, _a) {
        var where = _a.where;
        var dataset = this.data[entity];
        var _loop_3 = function (field) {
            var filters = where[field];
            var _loop_4 = function (operator) {
                var valueToFilterBy = filters[operator];
                return { value: dataset.find(function (x) {
                        return OperatorOperations[operator](x[field], valueToFilterBy);
                    }) };
            };
            for (var operator in where[field]) {
                var state_2 = _loop_4(operator);
                if (typeof state_2 === "object")
                    return state_2;
            }
        };
        for (var field in where) {
            var state_1 = _loop_3(field);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return dataset;
    };
    /**
     * Creating list of collections
     * @param {Array} data - Contains the name of the collections
     */
    Lsdb.prototype.collection = function (data) {
        var _this = this;
        try {
            if (!Array.isArray(data))
                throw new Error("An array was expected");
            if (data.some(function (value) { return typeof value !== "string"; })) {
                throw new Error("All values must be string");
            }
            data.forEach(function (value) { return (_this.data[value] = []); });
            localStorage.setItem(this.database, JSON.stringify(this.data));
        }
        catch (e) {
            console.error(e.name + ": " + e.message);
        }
    };
    /**
     * Creating collection entry
     * @param {String} entity - Name of collection
     * @param data - Data of collection
     * @returns Array of created collection
     */
    Lsdb.prototype.insert = function (entity, _a) {
        var data = _a.data;
        var docs = __spreadArray([], this.data[entity]);
        var limit = docs.length - 1;
        var _id = !docs.length ? 0 : Number(docs[limit]["_id"]) + 1;
        docs.push(__assign({ _id: _id }, data));
        this.data[entity] = docs;
        localStorage.setItem(this.database, JSON.stringify(this.data));
        return docs;
    };
    /**
     * @returns - returns all the collections
     */
    Lsdb.prototype.all = function () {
        return this.data;
    };
    /**
     * Update collection entry
     * @param {String} entity - Name of collection
     * @param {Object} params - Parameters to change
     * @param data - Data of collection
     * @returns Array of created collection
     */
    Lsdb.prototype.update = function (entity, params, data) {
        var key = Object.keys(params)[0];
        var index = this.data[entity].findIndex(function (i) {
            return i[key] === params[key];
        });
        var doc = this.data[entity][index];
        this.data[entity][index] = __assign(__assign({}, doc), data);
        localStorage.setItem(this.database, JSON.stringify(this.data));
        return doc;
    };
    /**
     * Delete entry from collection
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
     */
    Lsdb.prototype.delete = function (entity, _a) {
        var where = _a.where;
        var dataset = this.data[entity];
        var _loop_5 = function (field) {
            var filters = where[field];
            var _loop_6 = function (operator) {
                var valueToFilterBy = filters[operator];
                var index = dataset.findIndex(function (x) {
                    return OperatorOperations[operator](x[field], valueToFilterBy);
                });
                var entry = dataset[index];
                dataset.splice(index, 1);
                localStorage.setItem(this_1.database, JSON.stringify(this_1.data));
                return { value: entry };
            };
            for (var operator in where[field]) {
                var state_4 = _loop_6(operator);
                if (typeof state_4 === "object")
                    return state_4;
            }
        };
        var this_1 = this;
        for (var field in where) {
            var state_3 = _loop_5(field);
            if (typeof state_3 === "object")
                return state_3.value;
        }
        return dataset;
    };
    return Lsdb;
}());
