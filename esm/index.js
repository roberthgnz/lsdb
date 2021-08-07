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
    const value = Array.isArray(a) ? a : [a];
    return value;
}
const OperatorOperations = {
    [Operator.Equals]: (a, b) => a === b,
    [Operator.NotEquals]: (a, b) => a !== b,
    [Operator.GreaterThen]: (a, b) => a > b,
    [Operator.GreaterThenOrEqual]: (a, b) => a >= b,
    [Operator.LessThen]: (a, b) => a < b,
    [Operator.LessThenOrEqual]: (a, b) => a <= b,
    [Operator.In]: (a, b) => makeArray(a).some((c) => b.some((x) => String(c).includes(x))),
};
/**
 * @author Roberth González
 */
class Lsdb {
    /**
     *
     * @param {String} database - The "Database" name
     */
    constructor(database) {
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
    count(entity) {
        return this.data[entity].length;
    }
    /**
     * Get multiple entries
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Array|Error} - Array of matched data or thrown an error in case of invalid where clause
     */
    find(entity, { where }) {
        let dataset = this.data[entity];
        for (const field in where) {
            const filters = where[field];
            for (const operator in where[field]) {
                const valueToFilterBy = filters[operator];
                dataset = dataset.filter((x) => OperatorOperations[operator](x[field], valueToFilterBy));
            }
        }
        return dataset;
    }
    /**
     * Get single entry
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
     */
    findOne(entity, { where }) {
        let dataset = this.data[entity];
        for (const field in where) {
            const filters = where[field];
            for (const operator in where[field]) {
                const valueToFilterBy = filters[operator];
                return dataset.find((x) => OperatorOperations[operator](x[field], valueToFilterBy));
            }
        }
        return dataset;
    }
    /**
     * Creating list of collections
     * @param {Array} data - Contains the name of the collections
     */
    collection(data) {
        try {
            if (!Array.isArray(data))
                throw new Error("An array was expected");
            if (data.some((value) => typeof value !== "string")) {
                throw new Error("All values must be string");
            }
            data.forEach((value) => (this.data[value] = []));
            localStorage.setItem(this.database, JSON.stringify(this.data));
        }
        catch (e) {
            console.error(e.name + ": " + e.message);
        }
    }
    /**
     * Creating collection entry
     * @param {String} entity - Name of collection
     * @param data - Data of collection
     * @returns Array of created collection
     */
    insert(entity, { data }) {
        let docs = [...this.data[entity]];
        let limit = docs.length - 1;
        let _id = !docs.length ? 0 : Number(docs[limit]["_id"]) + 1;
        docs.push(Object.assign({ _id }, data));
        this.data[entity] = docs;
        localStorage.setItem(this.database, JSON.stringify(this.data));
        return docs;
    }
    /**
     * @returns - returns all the collections
     */
    all() {
        return this.data;
    }
    /**
     * Update collection entry
     * @param {String} entity - Name of collection
     * @param {Object} params - Parameters to change
     * @param data - Data of collection
     * @returns Array of created collection
     */
    update(entity, params, data) {
        const key = Object.keys(params)[0];
        const index = this.data[entity].findIndex((i) => {
            return i[key] === params[key];
        });
        let doc = this.data[entity][index];
        this.data[entity][index] = Object.assign(Object.assign({}, doc), data);
        localStorage.setItem(this.database, JSON.stringify(this.data));
        return doc;
    }
    /**
     * Delete entry from collection
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
     */
    delete(entity, { where }) {
        let dataset = this.data[entity];
        for (const field in where) {
            const filters = where[field];
            for (const operator in where[field]) {
                const valueToFilterBy = filters[operator];
                const index = dataset.findIndex((x) => OperatorOperations[operator](x[field], valueToFilterBy));
                const entry = dataset[index];
                dataset.splice(index, 1);
                localStorage.setItem(this.database, JSON.stringify(this.data));
                return entry;
            }
        }
        return dataset;
    }
}
export default Lsdb;
