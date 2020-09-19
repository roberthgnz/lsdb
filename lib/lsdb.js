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

  function matchQuery(item, query) {
    let match = false;
    let limit = Object.keys(item).length;
    let keys = Object.keys(item);
    let index = 0;
    let value;
    while (index < limit && !match) {
      value = keys[index];
      match = item[value] === query[value];
      index++;
    }
    return match;
  }

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
   * @param {string} name Name of the collection where the documents are
   * @param {object} options Define the filters to apply in the query
   */
  function find(name, options) {
    if (!options || typeof options !== "object") {
      throw new Error("An object was expected");
    }
    let result = [];
    const keys = Object.keys(options);
    if (keys.includes("where")) {
      result = get(name).filter((item) => matchQuery(item, options["where"]));
    }
    return result;
  }

  /**
   *  Get single document
   * @param {string} name Name of the collection where the document is
   * @param {object} options Define the filters to apply in the query
   */
  function findOne(name, options) {
    if (!options || typeof options !== "object") {
      throw new Error("An object was expected");
    }
    let result = null;
    const keys = Object.keys(options);
    if (keys.includes("where")) {
      result = get(name).find((item) => matchQuery(item, options["where"]));
    }
    return result;
  }

  function update(name, params, data) {
    const key = Object.keys(params)[0];
    const index = [...get(name)].findIndex((i) => {
      return i[key] === params[key];
    });
    let doc = collection[name][index];
    collection[name][index] = { ...doc, ...data };
    localStorage.setItem(dbname, JSON.stringify(collection));
  }

  function remove(name, params) {
    const key = Object.keys(params)[0];
    collection[name] = [...get(name)].filter((i) => {
      return i[key] !== params[key];
    });
    localStorage.setItem(dbname, JSON.stringify(collection));
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

// module.exports = lsdb
