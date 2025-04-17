// import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.esm.browser.js';
// import VueRouter from 'https://unpkg.com/vue-router@3.6.5/dist/vue-router.esm.browser.js';
import router from './utils/router.js';
import store from './utils/store.js';
import Navbar from './components/Navbar.js';



new Vue({
    el: '#app',
    template: `
    <div>
        <Navbar />
        <router-view></router-view>
    </div>`,
    components: {
        Navbar,
    },
    router,
    store,
});
