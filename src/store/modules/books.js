import axios from "axios";

const state = {
	status: ""
};

const getters = {};

const actions = {
	book_create({ commit }, book) {
		return new Promise((resolve, reject) => {
			commit("book_request");

			axios({
				method: "PUT",
				url: `http://localhost:5984/library/${book.category}-${book.isbn}`,
				data: {
					_id: `${book.category}-${book.isbn}`,
					type: "book",
					name: book.name,
					category: book.category,
					isbn: book.isbn,
					author: book.author,
					published_date: book.published_date,
					comments: []
				},
				withCredentials: true
			})
				.then(resp => {
					book["rev"] = resp.data.rev;
					commit("book_create", book);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	}
};

const mutations = {
	book_request(state) {
		state.status = "loading";
	},
	book_list(state, user, roles) {
		state.status = "success";
		state.roles = roles;
		state.user = user;
	},
	book_create(state, book) {
		state.status = "created";
		console.log({ book });
	},
	book_edit(state, data, book) {
		//fix this
		state.status = "created";
		console.log({ data, book });
	},
	book_error(state) {
		state.status = "error";
	}
};

export default {
	state,
	getters,
	actions,
	mutations
};
