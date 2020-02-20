import axios from "axios";
import qs from "querystring";

const COUCH_DB_BASEURL = process.env.VUE_APP_COUCH_DB_BASEURL;

const state = {
	status: "",
	user: localStorage.getItem("logged-user") || "",
	userRoles: localStorage.getItem("user-roles") || "",
	userDetails: JSON.parse(localStorage.getItem("userDetails")) || {},
	created_username: "",
	singupNotification: {
		display: false,
		text: ""
	},
	readers: null,
	lastUserId: 1
};

const getters = {
	isAuthenticated: state => !!state.user,
	authStatus: state => state.status,
	createdUsername: state => state.created_username,
	singupNotification: state => state.singup_notification,
	userDetails: state => state.userDetails,
	allReaders: state => state.readers,
	isAdmin: state =>
		state.userDetails.roles[0] === "_admin" ||
		state.userDetails.roles[0] === "admin",
	isLibrarian: state => state.userDetails.roles[0] === "librarian",
	isReader: state => state.userDetails.roles[0] === "reader"
};

const actions = {
	login({ commit }, user) {
		return new Promise((resolve, reject) => {
			commit("requestAuth");

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
					localStorage.setItem("user-roles", resp.data.roles[0]);
					localStorage.setItem("logged-user", user);

					commit("successAuth", user);
					resolve(resp);
				})
				.catch(err => {
					commit("errorAuth");
					localStorage.removeItem("logged-user");
					reject(err);
				});
		});
	},
	register({ commit }, user) {
		return new Promise((resolve, reject) => {
			commit("requestAuth");
			const nextUserId = state.lastUserId + 1;
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
					user_id: nextUserId,
					roles: [],
					type: "user"
				},
				withCredentials: true
			})
				.then(resp => {
					commit("userCreated", user.username);
					localStorage.removeItem("logged-user");
					resolve(resp);
				})
				.catch(err => {
					commit("errorAuth");
					localStorage.removeItem("logged-user");
					reject(err);
				});
		});
	},
	logout({ commit }) {
		axios({
			method: "DELETE",
			url: `${COUCH_DB_BASEURL}/_session`,
			withCredentials: true
		});

		commit("logout");
		localStorage.removeItem("logged-user");
		localStorage.removeItem("user-roles");
		localStorage.removeItem("userDetails");
	},
	setUserDetails({ commit }) {
		commit("requestAuth");
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
					commit("errorAuth");
					localStorage.removeItem("logged-user");
					reject(err);
				});
		});
	},
	getReaders({ commit }) {
		commit("requestAuth");
		return new Promise((resolve, reject) => {
			axios({
				method: "GET",
				url: `${COUCH_DB_BASEURL}/_users/_design/list/_view/_reader`,
				withCredentials: true
			})
				.then(resp => {
					commit("readerList", resp.data);
					resolve(resp);
				})
				.catch(err => {
					commit("errorAuth");
					reject(err);
				});
		});
	},
	getLastUserId({ commit }) {
		return new Promise((resolve, reject) => {
			commit("requestAuth");

			axios({
				method: "GET",
				url: `${COUCH_DB_BASEURL}/_users/_design/info/_view/_user_id_seq`,
				withCredentials: true
			})
				.then(resp => {
					commit("getLastUserIdSuccess", resp.data.rows[0].value);
					resolve(resp);
				})
				.catch(err => {
					commit("errorAuth");
					reject(err);
				});
		});
	}
};

const mutations = {
	requestAuth(state) {
		state.status = "loading";
	},
	successAuth(state, user) {
		state.status = "success";
		state.user = user;
	},
	userCreated(state, username) {
		state.status = "created";
		state.created_username = username;
		state.lastUserId++;
	},
	errorAuth(state) {
		state.status = "error";
	},
	logout(state) {
		state.status = null;
		state.user = null;
		state.userRoles = null;
		state.userDetails = null;
		state.created_username = null;
		state.singup_notification = { display: false, text: "" };
		state.readers = null;
	},
	setUserDetails(state, user) {
		state.userDetails = user;
	},
	singupNotification(state, singup_notification) {
		state.singup_notification = singup_notification;
	},
	readerList(state, readers) {
		state.readers = readers.rows;
	},
	getLastUserIdSuccess(state, value) {
		state.lastUserId = value;
	}
};

export default {
	state,
	getters,
	actions,
	mutations
};
