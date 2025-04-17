// import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.esm.browser.js';
// import VueRouter from 'https://unpkg.com/vue-router@3.6.5/dist/vue-router.esm.browser.js';
import loginpage from '../pages/loginpage.js';
import admin_dashboard from '../pages/admin_dashboard.js';
import store from '../utils/store.js';
import register from '../pages/register.js';
import service from '../pages/service.js';
import edit_service from '../pages/edit_service.js';
import customer_dashboard from '../pages/customer_dashboard.js'; 
import book_service from '../pages/book_service.js';
import edit_request from '../pages/edit_request.js';
import professional_dashboard from '../pages/professional_dashboard.js';
import home from '../pages/home.js';
import close_request from '../pages/close_request.js';
import admin_search from '../pages/admin_search.js';
import customer_search from '../pages/customer_search.js'

if (!VueRouter.installed) {  
    Vue.use(VueRouter);
}



const routes = [
    { path: '/', component: home },
    { path: '/login', component: loginpage },
    { path: '/register', component: register },
    { path: '/admin_dashboard', component: admin_dashboard , meta :{requireslogin : true, role:"admin"} },
    {path:'/admin_search', component:admin_search,meta :{requireslogin : true, role:"admin"}},
    {path: '/service', component: service ,meta :{requireslogin : true, role:"admin"}},
    {path: '/edit_service/:service_id', component: edit_service,meta :{requireslogin : true, role:"admin"}},
    { path: '/customer_dashboard', component: customer_dashboard, meta :{requireslogin : true, role:"customer"} },
    {path:'/customer_search', component:customer_search,meta :{requireslogin : true, role:"customer"}},
    { path: '/book_service/:service_id', component: book_service,meta :{requireslogin : true, role:"customer"} },
    {path: '/edit_request/:request_id', component: edit_request,meta :{requireslogin : true, role:"customer"}},
    {path: '/close_request/:request_id', component:close_request,meta:{requireslogin:true, role:"customer"}},
    {path: '/professional_dashboard', component: professional_dashboard, meta :{requireslogin : true,role:"professional"} }
]

const router = new VueRouter({
    routes
})
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requireslogin)) {
        if (!store.state.loggedIn) 
            next({path :'/login'})
        else if(to.meta.role && to.meta.role !== store.state.role)
            next({path :'/login'})
        else
            next()
    }       
    else {
        next();
    }
})

export default router;