var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
/**
 * @author Roberth González
 */
var Lsdb = /** @class */ (function () {
  function Lsdb(database) {
    this.database = database;
    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }
    this.data = JSON.parse(localStorage.getItem(database));
  }
  Lsdb.prototype.count = function (entity) {
    return this.data[entity].length;
  };
  Lsdb.prototype.find = function (entity, _a) {
    var where = _a.where;
    var field = where.field,
      operator = where.operator,
      value = where.value;
    switch (operator) {
      case "eq":
        return this.data[entity].filter(function (i) {
          return i[field] === value;
        });
      case "ne":
        return this.data[entity].filter(function (i) {
          return i[field] !== value;
        });
      case "in":
        return this.data[entity].filter(function (i) {
          return String(i[field]).includes(value);
        });
      default:
        throw new Error(
          "Unhandled whereClause: " + field + " " + operator + " " + value
        );
    }
  };
  Lsdb.prototype.findOne = function (entity, _a) {
    var where = _a.where;
    var field = where.field,
      operator = where.operator,
      value = where.value;
    switch (operator) {
      case "eq":
        return this.data[entity].find(function (i) {
          return i[field] === value;
        });
      case "ne":
        return this.data[entity].find(function (i) {
          return i[field] !== value;
        });
      default:
        throw new Error(
          "Unhandled whereClause: " + field + " " + operator + " " + value
        );
    }
  };
  Lsdb.prototype.collection = function (data) {
    var _this = this;
    try {
      if (!Array.isArray(data)) throw new Error("An array was expected");
      if (
        data.some(function (value) {
          return typeof value !== "string";
        })
      ) {
        throw new Error("All values must be string");
      }
      data.forEach(function (value) {
        return (_this.data[value] = []);
      });
      localStorage.setItem(this.database, JSON.stringify(this.data));
    } catch (e) {
      console.error(e.name + ": " + e.message);
    }
  };
  Lsdb.prototype.create = function (entity, _a) {
    var data = _a.data;
    var docs = __spreadArrays(this.data[entity]);
    var limit = docs.length - 1;
    var _id = !docs.length ? 0 : Number(docs[limit]["_id"]) + 1;
    docs.push(__assign({ _id: _id }, data));
    this.data[entity] = docs;
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return docs;
  };
  Lsdb.prototype.all = function () {
    return this.data;
  };
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
  Lsdb.prototype.delete = function (entity, params) {
    var key = Object.keys(params)[0];
    this.data[entity] = __spreadArrays(this.data[entity]).filter(function (i) {
      return i[key] !== params[key];
    });
    localStorage.setItem(this.database, JSON.stringify(this.data));
  };
  return Lsdb;
})();
