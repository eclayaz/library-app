import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/auth/Login.vue";
import Signup from "@/views/auth/Signup.vue";
import store from "@/store/index";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
		meta: {
			requiresAuth: true
		}
	},
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
			console.log(store.getters.isAdmin);

			// let user = JSON.parse(localStorage.getItem("user"));
			// if (to.matched.some(record => record.meta.is_admin)) {
			// 	if (user.is_admin == 1) {
			// 		next();
			// 	} else {
			// 		next({ name: "Home" });
			// 	}
			// } else {
			// 	next();
			// }
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
