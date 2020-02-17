import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../views/Home.vue";
import Login from "../components/auth/Login.vue";
import Signup from "../components/auth/Signup.vue";
import LibrarianPortal from "../components/LibrarianPortal.vue";
import store from "../store/index";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		name: "Home",
		component: LibrarianPortal,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: "/about",
		name: "About",
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () =>
			import(/* webpackChunkName: "about" */ "../views/About.vue")
	},
	//new routes
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
