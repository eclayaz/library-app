import axios from "axios";
import qs from "querystring";

const state = {
	status: "",
	user: localStorage.getItem("logged-user") || ""
};

const getters = {
	isAuthenticated: state => !!state.user
};

const actions = {
	login({ commit }, user) {
		return new Promise((resolve, reject) => {
			commit("auth_request");

			axios({
				method: "POST",
				url: "http://localhost:5984/_session",
				data: qs.stringify({
					username: user.username,
					password: user.password
				}),
				withCredentials: true
			})
				.then(resp => {
					const roles = resp.data.roles;
					const user = resp.data.name;

					localStorage.setItem("logged-user", user);
					commit("auth_success", user, roles);
					resolve(resp);
				})
				.catch(err => {
					commit("auth_error");
					localStorage.removeItem("logged-user");
					reject(err);
				});
		});
	},
	register({ commit }, user) {
		return new Promise((resolve, reject) => {
			commit("auth_request");
			axios({
				url: "http://localhost:3000/register",
				data: user,
				method: "POST"
			})
				.then(resp => {
					const token = resp.data.token;
					const user = resp.data.user;
					localStorage.setItem("token", token);
					// Add the following line:
					axios.defaults.headers.common["Authorization"] = token;
					commit("auth_success", token, user);
					resolve(resp);
				})
				.catch(err => {
					commit("auth_error", err);
					localStorage.removeItem("token");
					reject(err);
				});
		});
	},
	logout({ commit }) {
		return new Promise(resolve => {
			axios({
				method: "DELETE",
				url: "http://localhost:5984/_session",
				withCredentials: true
			});

			commit("logout");
			localStorage.removeItem("logged-user");
			resolve();
		});
	}
};

const mutations = {
	auth_request(state) {
		state.status = "loading";
	},
	auth_success(state, user, roles) {
		state.status = "success";
		state.roles = roles;
		state.user = user;
	},
	auth_error(state) {
		state.status = "error";
	},
	logout(state) {
		state.status = "";
		state.roles = "";
		state.user = "";
	}
};

export default {
	state,
	getters,
	actions,
	mutations
};
