import axios from "axios";
import qs from "querystring";

const COUCH_DB_BASEURL = process.env.VUE_APP_COUCH_DB_BASEURL;

const state = {
	status: "",
	user: localStorage.getItem("logged-user") || "",
	userDetails: JSON.parse(localStorage.getItem("userDetails")) || {},
	created_username: "",
	singup_notification: {
		display: false,
		text: ""
	}
};

const getters = {
	isAuthenticated: state => !!state.user,
	authStatus: state => state.status,
	createdUsername: state => state.created_username,
	singupNotification: state => state.singup_notification,
	userDetails: state => state.userDetails,
	isAdmin: state =>
		state.userDetails.roles
			? state.userDetails.roles.filter(role => role === "admin").length > 0
			: false,
	isLibrarian: state =>
		state.userDetails.roles
			? state.userDetails.roles.filter(role => role === "librarian").length > 0
			: false,
	isReader: state =>
		state.userDetails.roles
			? state.userDetails.roles.filter(role => role === "reader").length > 0
			: false
};

const actions = {
	login({ commit }, user) {
		return new Promise((resolve, reject) => {
			commit("auth_request");

			axios({
				method: "POST",
				url: `${COUCH_DB_BASEURL}/_session`,
				data: qs.stringify({
					username: user.username,
					password: user.password
				}),
				withCredentials: true
			})
				.then(resp => {
					const user = resp.data.name;

					localStorage.setItem("logged-user", user);
					commit("auth_success", user);
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
				url: `${COUCH_DB_BASEURL}/_users/org.couchdb.user:${user.username}`,
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
				url: `${COUCH_DB_BASEURL}/_session`,
				withCredentials: true
			});

			commit("logout");
			localStorage.removeItem("logged-user");
			localStorage.removeItem("userDetails");
			resolve();
		});
	},
	setUserDetails({ commit }) {
		commit("auth_request");
		return new Promise((resolve, reject) => {
			axios({
				method: "GET",
				url: `${COUCH_DB_BASEURL}/_users/org.couchdb.user:${state.user}`,
				withCredentials: true
			})
				.then(resp => {
					localStorage.setItem("userDetails", JSON.stringify(resp.data));
					commit("setUserDetails", resp.data);
					resolve(resp);
				})
				.catch(err => {
					commit("auth_error");
					localStorage.removeItem("logged-user");
					reject(err);
				});
		});
	}
};

const mutations = {
	auth_request(state) {
		state.status = "loading";
	},
	auth_success(state, user) {
		state.status = "success";
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
		state.user = "";
		state.userDetails = {};
	},
	setUserDetails(state, user) {
		state.userDetails = user;
	},
	singup_notification(state, singup_notification) {
		state.singup_notification = singup_notification;
	}
};

export default {
	state,
	getters,
	actions,
	mutations
};
