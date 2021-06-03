import { GenericObject, WhereOptions } from "./types";
/**
 * @author Roberth González
 */
export default class Lsdb {
    private database;
    private data;
    /**
     *
     * @param {String} database - The "Database" name
     */
    constructor(database: string);
    /**
     * Count the number of entries in the collection
     * @param {String} entity - Name of collection
     * @returns {Number} - Number of data within the collection
     */
    count(entity: string): number;
    /**
     * Get multiple entries
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Array|Error} - Array of matched data or thrown an error in case of invalid where clause
     */
    find<T>(entity: string, { where }: {
        where: WhereOptions<T>;
    }): T[] | undefined;
    /**
     * Get single entry
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
     */
    findOne<T>(entity: string, { where }: {
        where: WhereOptions<T>;
    }): T;
    /**
     * Creating list of collections
     * @param {Array} data - Contains the name of the collections
     */
    collection(data: string[]): void;
    /**
     * Creating collection entry
     * @param {String} entity - Name of collection
     * @param data - Data of collection
     * @returns Array of created collection
     */
    insert(entity: string, { data }: {
        data: any;
    }): any[];
    /**
     * @returns - returns all the collections
     */
    all(): object;
    /**
     * Update collection entry
     * @param {String} entity - Name of collection
     * @param {Object} params - Parameters to change
     * @param data - Data of collection
     * @returns Array of created collection
     */
    update(entity: string, params: GenericObject, data: any): any;
    /**
     * Delete entry from collection
     * @param {String} entity - Name of collection
     * @param where - Options which consist of mongo-like definition
     * @returns {Object|Error} - Object of matched data or thrown an error in case of invalid where clause
     */
    delete<T>(entity: string, { where }: {
        where: WhereOptions<T>;
    }): T;
}
