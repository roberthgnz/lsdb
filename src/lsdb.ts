interface whereOptions {
  field: string;
  operator: string;
  value: any;
}

/**
 * @author Roberth González
 */
class Lsdb {
  private database: string;
  private data: object;

  /**
   * 
   * @param {String} database - The "Database" name
   */
  constructor(database: string) {
    this.database = database;

    if (localStorage.getItem(this.database) === null) {
      localStorage.setItem(database, JSON.stringify({}));
    }

    this.data = JSON.parse(localStorage.getItem(database));
  }

  /**
   * Count number of collection items
   * @param {String} entity - Name of collection
   * @returns {Number} - Number of data within the collection
   */
  count(entity: string): number {
    return this.data[entity].length
  }

  /**
   * Get multiple documents
   * @param {String} entity - Name of collection 
   * @param where - Options which consist of 
   * Filtered field, Filter operator (=,in,not eq etc..), Filter value
   * @returns {Array|Error} - Array of matched data or thrown an error in case of invalid where clause
   */
  find(entity: string, { where }): any[] {
    const { field, operator, value }: whereOptions = where;
    switch (operator) {
      case "eq":
        return this.data[entity].filter(
          (i: { [x: string]: any }) => i[field] === value
        );
      case "ne":
        return this.data[entity].filter(
          (i: { [x: string]: any }) => i[field] !== value
        );
      case "in":
        return this.data[entity].filter(
          (i: { [x: string]: any; }) => String(i[field]).includes(value)
        );
      default:
        throw new Error(`Unhandled whereClause: ${field} ${operator} ${value}`);
    }
  }

  /**
   * Get single document
   * @param {String} entity - Name of collection 
   * @param where - Options which consist of 
   * Filtered field, Filter operator (=,in,not eq etc..), Filter value
   * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
   */
  findOne(entity: string, { where }): any {
    const { field, operator, value }: whereOptions = where;
    switch (operator) {
      case "eq":
        return this.data[entity].find(
          (i: { [x: string]: any }) => i[field] === value
        );
      case "ne":
        return this.data[entity].find(
          (i: { [x: string]: any }) => i[field] !== value
        );
      default:
        throw new Error(`Unhandled whereClause: ${field} ${operator} ${value}`);
    }
  }

  /**
   * Creating list of collections
   * @param {Array} data - Contains the name of the collections
   */
  collection(data: string[]): void {
    try {
      if (!Array.isArray(data)) throw new Error("An array was expected");
      if (data.some((value) => typeof value !== "string")) {
        throw new Error("All values must be string");
      }
      data.forEach((value) => (this.data[value] = []));
      localStorage.setItem(this.database, JSON.stringify(this.data));
    } catch (e) {
      console.error(e.name + ": " + e.message);
    }
  }

  /**
   * Creating new collection
   * @param {String} entity - Name of collection
   * @param data - Data of collection
   * @returns Array of created collection
   */
  insert(entity: string, { data }: { data: any }) {
    let docs = [...this.data[entity]];
    let limit = docs.length - 1;
    let _id = !docs.length ? 0 : Number(docs[limit]["_id"]) + 1;

    docs.push({
      _id,
      ...data,
    });

    this.data[entity] = docs;

    localStorage.setItem(this.database, JSON.stringify(this.data));

    return docs;
  }

  /**
   * @returns - returns all the collections
   */
  all(): object {
    return this.data;
  }

  /**
   * Update collection
   * @param {String} entity - Name of collection
   * @param {Object} params - Parameters to change
   * @param data - Data of collection
   * @returns Array of created collection
   */
  update(entity: string, params: object, data: any): any {
    const key = Object.keys(params)[0];
    const index = this.data[entity].findIndex((i: { [x: string]: any }) => {
      return i[key] === params[key];
    });
    let doc = this.data[entity][index];
    this.data[entity][index] = { ...doc, ...data };
    localStorage.setItem(this.database, JSON.stringify(this.data));
    return doc;
  }

  /**
   * Creating new collection
   * @param {String} entity - Name of collection
   * @param params - Parameters to delete
   * @returns Array of created collection
   */
  delete(entity: string, params: object): void {
    const key = Object.keys(params)[0];
    this.data[entity] = [...this.data[entity]].filter((i) => {
      return i[key] !== params[key];
    });
    localStorage.setItem(this.database, JSON.stringify(this.data));
  }
}
