import { Model as ORMModel } from '@vuex-orm/core';

/**
 * Wrapper for models to provide model level convenience methods for interacting with the store and persistence.
 * Will be built into vuex-orm in the future. See https://github.com/vuex-orm/vuex-orm/issues/60
 *
 * Requires the inflected npm package.
 */
export default class Model extends ORMModel {
    /**
     * Helper method to return the singular name of the entity
     */
    static singularEntity() {
        return inflection.singularize(this.entity);
    }


    /**
     * Helper method which creates a Vuex-ORM query object containing all relations.
     */
    static buildQuery() {
        return this.getters('query')().withAll();
    }


    /**
     * Load records from server
     * @param filter id or filter object
     * @param bypassCache
     */
    static async fetch(filter, bypassCache = false) {
        if (typeof filter !== 'object') filter = {id: filter};
        return this.dispatch('fetch', {filter, bypassCache});
    }


    /**
     * Get all records from vuex store
     */
    static findAll() {
        let query = this.buildQuery();
        return query.all();
    }


    /**
     * Get all records from vuex store with  filter
     */
    static where(filter) {
        let query = this.buildQuery();

        Object.keys(filter).forEach((key) => {
            query = query.where(key, filter[key]);
        });

        return query.all();
    }


    /**
     * Find single record from vuex store
     * @param id
     */
    static find(id) {
        const query = this.buildQuery();
        return query.where('id', id).first();
    }


    /**
     * Get the first record form the vuex store
     */
    static first() {
        let query = this.buildQuery();
        return query.first();
    }


    /**
     * Get the last record form the vuex store
     */
    static last() {
        let query = this.buildQuery();
        return query.last();
    }


    /**
     * Deletes all records from server
     * @returns {Promise<void>}
     */
    static async destroyAll() {
        return this.dispatch('destroyAll');
    }


    /**
     * Deletes all from vuex store
     */
    static async deleteAll() {
        return this.dispatch('deleteAll');
    }


    /**
     * Create object in vuex store
     * @param data
     */
    static async create(data) {
        const insertedData = await this.dispatch('insert', { data });
        return insertedData[this.entity][0];
    }


    /**
     * Alias for create
     */
    static async insert(data) {
        return this.create(data);
    }


    /**
     * Calls delete and destroy.
     * @returns {Promise<void>}
     */
    async deleteAndDestroy() {
        await this.delete();
        return this.destroy();
    }


    /**
     * Delete from server
     * @returns {Promise<void>}
     */
    async destroy() {
        return this.$dispatch('destroy', {id: this.id});
    }


    /**
     * Delete from vuex store
     */
    async delete() {
        return this.$dispatch('delete', this.id);
    }


    /**
     * Delete from vuex store via filter closure
     */
    static async delete(filterClosure) {
        return this.dispatch('delete', filterClosure);
    }


    /**
     * Alias for update
     */
    async save() {
        return this.update();
    }


    /**
     * Update vuex store
     */
    async update() {
        return this.$dispatch('update', {where: this.id, data: this});
    }


    /**
     * Saves a new object to the server
     * @returns {Promise<void>}
     */
    async persist(args = {}) {
        return this.$dispatch('persist', {id: this.id, args});
    }

    /**
     * Saves an update to the server
     * @returns {Promise<void>}
     */
    async push(args = {}) {
        return this.$dispatch('push', {data: this, args});
    }

    /**
     * Runs a non-CURD mutation against the server
     * @returns {Promise<void>}
     */
    static async mutate(name, args) {
        args['mutation'] = name;
        return this.dispatch('mutate', args);
    }


    /**
     * Reverts the records property values to the stores state.
     * @returns {Promise<void>}
     */
    async $revert() {
        const recordFromStore = this.constructor.find(this.id).$toJson();

        Object.keys(recordFromStore).forEach((key) => {
            const value = recordFromStore[key];
            if (!key.startsWith('$') && typeof value !== 'object') {
                this[key] = value;
            }
        });
    }


    /**
     * Tells if there are any changed properties (compared to the state in the store)
     * @returns {boolean}
     */
    get $isDirty() {
        const recordFromStore = this.constructor.find(this.id).$toJson();

        const dirtyProperty = Object.keys(recordFromStore).find((key) => {
            const value = recordFromStore[key];
            return !key.startsWith('$') && typeof value !== 'object' && value !== this[key];
        });

        return !!dirtyProperty;
    }
}
