/**
 * @author Roberth González
 * @param {String} dbname - The "Database" name
 */
const lsdb = (dbname) => {
  // Check if database exists
  const ls = localStorage.getItem(dbname);

  if (ls === null) {
    localStorage.setItem(dbname, JSON.stringify({}));
  }

  let localData = JSON.parse(localStorage.getItem(dbname));

  /**
   *
   * @param {array} data Contains the name of the collections
   */
  function collection(data) {
    try {
      if (!Array.isArray(data)) throw new Error("An array was expected");
      if (data.some((value) => typeof value !== "string")) {
        throw new Error("All values must be string");
      }
      data.forEach((value) => (localData[value] = []));
      localStorage.setItem(dbname, JSON.stringify(localData));
    } catch (e) {
      console.error(e.name + ": " + e.message);
    }
  }

  function insert(name, { data }) {
    let docs = [...get(name)];
    let limit = localData[name].length - 1;
    let _id = !localData[name].length
      ? 0
      : Number(localData[name][limit]["_id"]) + 1;
    docs.push({
      _id,
      ...data,
    });
    localData[name] = docs;
    localStorage.setItem(dbname, JSON.stringify(localData));
    return docs;
  }

  function get(name) {
    return localData[name];
  }

  /**
   *  Get multiple documents
   * @param {Object} options - Options
   * @param {Object} options.collection - Collection name
   * @param {Object} options.field - Filtered field
   * @param {Object} options.operator - Filter operator (=,in,not eq etc..)
   * @param {Object} options.value - Filter value
   */
  function find({ collection, field, operator, value }) {
    switch (operator) {
      case "eq":
        return get(collection).filter((i) => i[field] === value);
      case "ne":
        return get(collection).filter((i) => i[field] !== value);
      default:
        throw new Error(`Unhandled whereClause: ${field} ${operator} ${value}`);
    }
  }

  /**
   *  Get single document
   * @param {Object} options - Options
   * @param {Object} options.collection - Collection name
   * @param {Object} options.field - Filtered field
   * @param {Object} options.operator - Filter operator (=,in,not eq etc..)
   * @param {Object} options.value - Filter value
   */
  function findOne({ collection, field, operator, value }) {
    switch (operator) {
      case "eq":
        return get(collection).find((i) => i[field] === value);
      case "ne":
        return get(collection).find((i) => i[field] !== value);
      default:
        throw new Error(`Unhandled whereClause: ${field} ${operator} ${value}`);
    }
  }

  function update(name, params, data) {
    const key = Object.keys(params)[0];
    const index = [...get(name)].findIndex((i) => {
      return i[key] === params[key];
    });
    let doc = localData[name][index];
    localData[name][index] = { ...doc, ...data };
    localStorage.setItem(dbname, JSON.stringify(localData));
  }

  function remove(name, params) {
    const key = Object.keys(params)[0];
    localData[name] = [...get(name)].filter((i) => {
      return i[key] !== params[key];
    });
    localStorage.setItem(dbname, JSON.stringify(localData));
  }

  const all = () => localData;

  const db = {
    collection,
    insert,
    all,
    get,
    find,
    findOne,
    update,
    remove,
  };

  return { db };
};
