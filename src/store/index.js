import 'nativescript-nodeify';

import Vue from 'nativescript-vue';
import Vuex from 'vuex';
import VuexORM from '@vuex-orm/core';

import User from './models/user';
import UserModule from './modules/user';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

// Setup Database
const database = new VuexORM.Database();
database.register(User, UserModule);

import installVuexORMApollo from '@vuex-orm/plugin-apollo';
VuexORM.use(installVuexORMApollo, {
    database,
    debug,
    url: 'http://localhost:4000/api/v2'
});

const store = new Vuex.Store({
    plugins: [VuexORM.install(database)]
});

Vue.prototype.$store = store;

export default store;
