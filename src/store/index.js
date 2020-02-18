import Vuex from "vuex";
import Vue from "vue";
import authentication from "./modules/authentication";
import books from "./modules/books";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		authentication,
		books
	}
});
