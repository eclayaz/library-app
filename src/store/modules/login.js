import axios from "axios";
import qs from "querystring";

const state = {
	status: "",
	token: localStorage.getItem("token") || "",
	user: {}
};

const getters = {};

const actions = {
	login({ commit }, user) {
		return new Promise((resolve, reject) => {
			commit("auth_request");

			axios({
				method: "POST",
				url: "http://localhost:15984/_session",
				data: qs.stringify({
					username: "value1",
					password: "value2"
				}),
				headers: {
					"content-type": "application/x-www-form-urlencoded;charset=utf-8",
					"Access-Control-Allow-Origin": "*"
				}
			})
				// axios(
				// 	{
				// 		url: "http://localhost:15984/_session",
				// 		data: qs.stringify({
				// 			item1: "value1",
				// 			item2: "value2"
				// 		}),
				// 		method: "POST"
				// 	},
				// 	options
				// )
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
					commit("auth_error");
					localStorage.removeItem("token");
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
			commit("logout");
			localStorage.removeItem("token");
			delete axios.defaults.headers.common["Authorization"];
			resolve();
		});
	}
};

const mutations = {
	auth_request(state) {
		state.status = "loading";
	},
	auth_success(state, token, user) {
		state.status = "success";
		state.token = token;
		state.user = user;
	},
	auth_error(state) {
		state.status = "error";
	},
	logout(state) {
		state.status = "";
		state.token = "";
	}
};

export default {
	state,
	getters,
	actions,
	mutations
};
