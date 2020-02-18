import axios from "axios";
import qs from "querystring";

const state = {
	status: "",
	user: localStorage.getItem("logged-user") || "",
	created_username: ""
};

const getters = {
	isAuthenticated: state => !!state.user,
	authStatus: state => state.status,
	createdUsername: state => state.created_username
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
				url: `http://localhost:5984/_users/org.couchdb.user:${user.username}`,
				method: "PUT",
				data: {
					_id: `org.couchdb.user:${user.username}`,
					name: user.username,
					password: user.password,
					first_name: user.first_name,
					last_name: user.last_name,
					email: user.email,
					phone: user.phone,
					roles: [],
					type: "user"
				},
				withCredentials: true
			})
				.then(resp => {
					commit("auth_created", user.username);
					localStorage.removeItem("logged-user");
					resolve(resp);
				})
				.catch(err => {
					commit("auth_error");
					localStorage.removeItem("logged-user");
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
	auth_created(state, username) {
		state.status = "created";
		state.created_username = username;
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
