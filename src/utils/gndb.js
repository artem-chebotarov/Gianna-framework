/**
 * Wrapper class for IndexedDB operations (idb.js).
 * Provides a Promise-based API for managing local data.
1. return уберу.
2. async  * @author Artyom & Gemini (Bro-Apps)
 * @version 1.0.0
 */
 export class GNDB {
    constructor() {
        this.db = null;
    }

    /**
     * Imports data into the database from a JSON object.
     * @param {Object} json - The data object where keys are table names and values are arrays of records.
     * @param {boolean} [overwrite=false] - If true, clears the table before inserting new data.
     * @returns {Promise<boolean>} Returns true upon successful import.
     */
    async importData(json, overwrite = false) {
        if (typeof json !== "object") {
            throw "not object";
        }
        let keys = Object.keys(json);
        for (let key of keys) {
            if (!this.db.objectStoreNames.contains(key)) {
                console.log("not table " + key);
            } else {
                if (overwrite) {
                    await this.clear(key);
                }
                await this.put(key, json[key]);
            }
        }
        return true;
    }

    /**
     * Exports all data from the database to a JSON object.
     * @returns {Promise<Object>} An object containing all data from all tables.
     */
    async exportData() {
        let stores = Array.from(this.db.objectStoreNames);
        let data = {};
        for (let i = 0; i <= stores.length - 1; i++) {
            Object.assign(data, {
                [stores[i]]: await this.getAll(stores[i])
            });
        }
        return data;
    }

    /**
     * Deletes the database.
     * @param {string} database - The name of the database to delete.
     * @returns {Promise<boolean>} Returns true if deleted successfully.
     */
    drop(database) {
        return new Promise((ok, error) => {
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            let request = indexedDB.deleteDatabase(database);
            request.onblocked = (e) => {
                error("blocked");
            }
            request.onsuccess = (e) => {
                ok(true);
            }
            request.onerror = (e) => {
                error(e.target.error);
            }
        });
    }

    /**
     * Initializes the database connection and schema.
     * @param {string} database - Database name.
     * @param {number} version - Database version.
     * @param {Object} tables - Schema configuration object (tables and indexes).
     * @returns {Promise<boolean>}
     */
    async init(database, version, tables) {
        return new Promise((ok, error) => {
            const c = indexedDB.open(database, version);
            c.onupgradeneeded = (event) => {
                const db = event.target.result;
                const tsn = event.target.transaction;
                for (let table in tables) {
                    let data = tables[table];
                    let store = null;
                    if (!db.objectStoreNames.contains(table)) {
                        store = db.createObjectStore(table, {
                            keyPath: data.increment,
                            autoIncrement: true
                        });
                    } else {
                        store = tsn.objectStore(table);
                    }
                    for (let index in data.indexes) {
                        if (!store.indexNames.contains(index)) {
                            store.createIndex(index, data.indexes[index]?.name || index, {
                                unique: data.indexes[index].unique || false,
                                multiEntry: data.indexes[index].multiEntry || false
                            });
                        }
                    }
                }
            }
            c.onsuccess = (event) => {
                this.db = event.target.result;
                ok(true);
            }
            c.onerror = (event) => {
                error(event.target.error);
            }
        });
    }

    /**
     * Internal method to perform write operations (add/put).
     * @param {string} table - Table name.
     * @param {Object|Array} data - Data to write.
     * @param {string} method - IDB method: "add" or "put".
     * @returns {Promise<any>}
     */
    async write(table, data, method) {
        let tsn = this.db.transaction([table], "readwrite");
        let store = tsn.objectStore(table);
        if (Array.isArray(data)) {
            data.forEach(item => {
                store[method](item);
            })
            return await this.request({
                complete: true,
                tsn: tsn
            });
        } else {
            return await this.request({
                complete: false,
                request: store[method](data)
            });
        }
    }

    /**
     * Adds a new record. Fails if the key already exists (if key is not auto-increment).
     * @param {string} table - Table name.
     * @param {Object|Array} data - Data to add.
     * @returns {Promise<any>}
     */
    async add(table, data) {
        return await this.write(table, data, "add");
    }

    /**
     * Puts (inserts or updates) a record.
     * @param {string} table - Table name.
     * @param {Object|Array} data - Data to put.
     * @returns {Promise<any>}
     */
    async put(table, data) {
        return await this.write(table, data, "put");
    }

    /**
     * Deletes a record by ID.
     * @param {string} table - Table name.
     * @param {number|string} id - Record ID.
     * @returns {Promise<any>}
     */
    async delete(table, id) {
        let tsn = this.db.transaction([table], "readwrite");
        let store = tsn.objectStore(table);
        return await this.request({
            complete: false,
            request: store.delete(id)
        });
    }

    /**
     * Deletes multiple records.
     * @param {string} table - Table name.
     * @param {Array} data - Array of IDs to delete.
     * @returns {Promise<any>}
     */
    async deleteMany(table, data) {
        let tsn = this.db.transaction([table], "readwrite");
        let store = tsn.objectStore(table);
        data.forEach(item => {
            store.delete(item);
        });
        return await this.request({
            complete: true,
            tsn: tsn
        });
    }

    /**
     * Updates specific fields of an existing record.
     * @param {string} table - Table name.
     * @param {number|string} id - Record ID.
     * @param {Object} data - Fields to update.
     * @returns {Promise<boolean>}
     */
     async update(table, id, data) {
        return new Promise((ok, error) => {
            let tsn = this.db.transaction([table], "readwrite");
            let store = tsn.objectStore(table);
            let request = store.get(id);
            request.onsuccess = (e) => {
                let result = e.target.result;
                if (!result) {
                    error(`not date. table: ${table}. number: ${id}`);
                    return;
                }
                let newData = {
                    ...result,
                    ...data
                }
                store.put(newData);
            }
            tsn.oncomplete = (e) => {
                ok(true);
            }
            tsn.onerror = (e) => {
                error(e.target.error);
            }
        });
    }

    /**
     * Clears all data from a table.
     * @param {string} table - Table name.
     * @returns {Promise<any>}
     */
    async clear(table) {
        let tsn = this.db.transaction([table], "readwrite");
        let store = tsn.objectStore(table);
        return await this.request({
            complete: false,
            request: store.clear()
        });
    }

    /**
     * Gets a single record by ID.
     * @param {string} table - Table name.
     * @param {number|string} id - Record ID.
     * @returns {Promise<Object>}
     */
    async get(table, id) {
        let tsn = this.db.transaction([table], "readonly");
        let store = tsn.objectStore(table);
        return await this.request({
            complete: false,
            request: store.get(id)
        });
    }

    /**
     * Helper for finding records by index.
     * @param {string} table - Table name.
     * @param {string} index - Index name.
     * @param {any} value - Value to search.
     * @param {string} method - "by" (single) or "all" (multiple).
     * @returns {Promise<any>}
     */
    async find(table, index, value, method) {
        let tsn = this.db.transaction([table], "readonly");
        let store = tsn.objectStore(table);
        if (!store.indexNames.contains(index)) {
            throw `not index. table ${table}. index: ${index}`;
        }
        let i = store.index(index);
        return await this.request({
            complete: false,
            request: method == "by" ? i.get(value) : i.getAll(value)
        });
    }

    /**
     * Finds one record by index.
     */
    async findBy(table, index, value) {
        return await this.find(table, index, value, "by");
    }

    /**
     * Gets all records from a table.
     */
    async getAll(table) {
        let tsn = this.db.transaction([table], "readonly");
        let store = tsn.objectStore(table);
        let request = store.getAll();
        return await this.request({
            complete: false,
            request: request
        });
    }

    /**
     * Finds all records matching a value by index.
     */
    async findAll(table, index, value) {
        return await this.find(table, index, value, "all");
    }

    /**
     * Helper to create IDBKeyRange based on value type.
     * @param {any} value - The filter value or range object.
     * @returns {IDBKeyRange|null}
     */
    filter(value) {
        if (value === undefined) {
            return null;
        }
        if (value !== undefined && (typeof value == "string" || typeof value == "number")) {
            return IDBKeyRange.only(value);
        }
        if (value !== undefined && typeof value == "object" && value.start !== undefined && value.end !== undefined) {
            return IDBKeyRange.bound(value.start, value.end, false, false);
        }
        if (value !== undefined && typeof value == "object" && value.start !== undefined) {
            return IDBKeyRange.lowerBound(value.start, false);
        }
        if (value !== undefined && typeof value == "object" && value.end !== undefined) {
            return IDBKeyRange.upperBound(value.end, false);
        }
    }

    /**
     * Tokenizes a string into unique words for search.
     * @param {string} string - Input string.
     * @returns {Array<string>} Array of unique words.
     */
    tokens(string) {
        if (!string || typeof string !== "string") return [];
        let words = string.toLowerCase().match(/[\p{L}\p{N}]+/gu);
        return words ? [...new Set(words)] : [];
    }

    /**
     * Performs a full-text search using keyword intersection.
     * @param {string} table - Table name.
     * @param {string} index - Index name (must be multiEntry).
     * @param {string} query - Search query string.
     * @returns {Promise<Array>} Array of matching records.
     */
    async search(table, index, query) {
        let words = this.tokens(query);
        if (words.length === 0) return [];

        return new Promise((ok, error) => {
            let tsn = this.db.transaction([table], "readonly");
            let store = tsn.objectStore(table);

            if (!store.indexNames.contains(index)) {
                error(`Index '${index}' not found in table '${table}'`);
                return;
            }

            let i = store.index(index);

            let getKeys = (word) => {
                return new Promise((res, rej) => {
                    let req = i.getAllKeys(word);
                    req.onsuccess = () => res(req.result);
                    req.onerror = () => rej(req.error);
                });
            };

            Promise.all(words.map(word => getKeys(word)))
                .then(resultsArray => {

                    let commonIds = resultsArray[0];

                    if (resultsArray.length > 1) {
                        for (let k = 1; k < resultsArray.length; k++) {
                            let currentSet = new Set(resultsArray[k]);
                            commonIds = commonIds.filter(id => currentSet.has(id));
                            if (commonIds.length === 0) break;
                        }
                    }

                    if (commonIds.length === 0) {
                        ok([]);
                        return;
                    }

                    const getObject = (id) => {
                        return new Promise((res, rej) => {
                            let req = store.get(id);
                            req.onsuccess = () => res(req.result);
                            req.onerror = () => rej(req.error);
                        });
                    };

                    return Promise.all(commonIds.map(id => getObject(id)));
                })
                .then(finalObjects => {
                    ok(finalObjects);
                })
                .catch(err => {
                    error(err);
                });
        });
    }

    /**
     * Selects records with cursor options (limit, offset, direction).
     * @param {Object} input - Query configuration.
     * @returns {Promise<Array>}
     */
    async select(input) {
        return await this.query({
            type: "select",
            ...input
        });
    }

    /**
     * Counts records matching a filter.
     */
    async count(input) {
        return await this.query({
            type: "count",
            ...input
        });
    }

    /**
     * Removes records matching a filter (via cursor).
     */
    async remove(input) {
        return await this.query({
            type: "delete",
            ...input
        });
    }

    /**
     * Universal query handler using cursors.
     * @param {Object} input - Query params: table, index, value, limit, offset, direction.
     * @returns {Promise<any>}
     */
    query(input) {
        return new Promise((ok, error) => {
            let mode = input.type == "delete" ? "readwrite" : "readonly";
            let tsn = this.db.transaction(input.table, mode);
            let store = tsn.objectStore(input.table);
            let source = null;
            if (input.index !== undefined && store.indexNames.contains(input.index)) {
                let i = store.index(input.index);
                source = i;
            } else {
                source = store;
            }
            if (input.type == "count") {
                let r = source.count(this.filter(input.value));
                r.onsuccess = (e) => ok(e.target.result);
                r.onerror = (e) => error(e.target.error);
                return;
            }
            let direction = input.direction || "next";
            let request = source.openCursor(this.filter(input.value), direction);
            let count = 0;
            let data = [];
            let advanceFlag = false;
            request.onsuccess = (event) => {
                let cursor = event.target.result;
                if (!cursor) {
                    ok(input.type == "delete" ? count : data);
                    return;
                }
                if (input.offset !== undefined && !advanceFlag) {
                    advanceFlag = true;
                    cursor.advance(input.offset);
                    return;
                }
                if (input.type == "delete") {
                    cursor.delete();
                } else {
                    data.push(cursor.value);
                }
                count++;
                if (input.limit !== undefined && count >= input.limit) {
                    ok(input.type == "delete" ? count : data);
                    return;
                }
                cursor.continue();
            }
            request.onerror = (event) => {
                error(event.target.error);
            }
        });
    }

    /**
     * Promisifies IDBRequest operations.
     */
    request(data) {
        return new Promise((ok, error) => {
            if (data.complete == true) {
                data.tsn.onerror = (event) => {
                    error(event.target.error);
                }
                data.tsn.oncomplete = (event) => {
                    ok(true);
                }
            } else {
                data.request.onsuccess = (event) => {
                    let result = event.target.result;
                    ok(result);
                }
                data.request.onerror = (event) => {
                    error(event.target.error);
                }
            }
        });
    }
}

