import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store/index";
import Home from "@/views/Home.vue";
import Login from "@/views/auth/Login.vue";
import Signup from "@/views/auth/Signup.vue";

Vue.use(VueRouter);

const routes = [
	{
		path: "/login",
		name: "Login",
		component: Login,
		meta: {
			guest: true
		}
	},
	{
		path: "/signup",
		name: "Signup",
		component: Signup,
		meta: {
			guest: true
		}
	},
	{
		path: "/",
		name: "Home",
		component: Home,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: "/reader-return-books",
		name: "ReaderReturnBooks",
		component: Home,
		meta: {
			requiresAuth: true
		}
	}
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
});

router.beforeEach((to, from, next) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (!store.getters.isAuthenticated) {
			next({
				path: "/login",
				params: { nextUrl: to.fullPath }
			});
		} else {
			// console.log(store.getters.isAdmin);
			next();
		}
	} else if (to.matched.some(record => record.meta.guest)) {
		if (!store.getters.isAuthenticated) {
			next();
		} else {
			next({ name: "Home" });
		}
	} else {
		next();
	}
});

export default router;
