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

  let collection = JSON.parse(localStorage.getItem(dbname));

  /**
   *
   * @param {string} name
   */
  function defaults(data) {
    const key = Object.keys(data)[0];
    const doc = collection[key];

    if (!doc) collection[key] = data[key];

    if (Array.isArray(collection[key])) {
      // Set _id
      collection[key] = collection[key].map((doc, index) => {
        return {
          _id: index,
          ...doc,
        };
      });
    }

    localStorage.setItem(dbname, JSON.stringify(collection));
  }

  function set(name, data) {
    let docs = [...get(name)];
    let limit = collection[name].length - 1;
    let _id = !collection[name].length
      ? 0
      : Number(collection[name][limit]["_id"]) + 1;
    docs.push({
      _id,
      ...data,
    });
    collection[name] = docs;
    localStorage.setItem(dbname, JSON.stringify(collection));
  }

  function get(name) {
    return collection[name];
  }

  function find(name, params) {
    const key = Object.keys(params)[0];
    return [...get(name)].find((i) => {
      return i[key] === params[key];
    });
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

  const db = {
    defaults,
    set,
    get,
    find,
    update,
    remove,
  };

  return { db };
};
