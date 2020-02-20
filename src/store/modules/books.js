import axios from "axios";

const COUCH_DB_BASEURL = process.env.VUE_APP_COUCH_DB_BASEURL;

const state = {
	status: "",
	books: [],
	checkoutBookList: [],
	bookCount: 0
};

const getters = {
	allBooks: state => state.books,
	bookCount: state => state.bookCount,
	checkoutBookList: state => state.checkoutBookList
};

const actions = {
	book_create({ commit }, book) {
		return new Promise((resolve, reject) => {
			commit("book_request");

			axios({
				method: "PUT",
				url: `${COUCH_DB_BASEURL}/library/${book.category}-${book.isbn}`,
				data: {
					_id: `${book.category}-${book.isbn}`,
					type: "book",
					name: book.name,
					category: book.category,
					isbn: book.isbn,
					author: book.author,
					published_date: book.published_date,
					availability: {
						status: true,
						taken_by: "",
						taken_name: "",
						date: ""
					},
					comments: []
				},
				withCredentials: true
			})
				.then(resp => {
					const newBook = {
						id: resp.data.id,
						key: book.name,
						value: {
							_rev: resp.data.rev,
							name: book.name,
							isbn: book.isbn,
							category: book.category,
							author: book.author,
							published_date: book.published_date,
							availability: {
								status: true,
								taken_by: "",
								taken_name: "",
								date: ""
							},
							comments: []
						}
					};

					commit("book_create", newBook);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	},
	book_edit({ commit }, book) {
		return new Promise((resolve, reject) => {
			commit("book_request");

			axios({
				method: "PUT",
				url: `${COUCH_DB_BASEURL}/library/${book._id}`,
				data: {
					_rev: book._rev,
					type: "book",
					name: book.name,
					category: book.category,
					isbn: book.isbn,
					author: book.author,
					published_date: book.published_date,
					availability: book.availability,
					comments: book.comments
				},
				withCredentials: true
			})
				.then(resp => {
					const updatedBook = {
						id: book._id,
						key: book.name,
						value: {
							_rev: resp.data.rev,
							name: book.name,
							isbn: book.isbn,
							category: book.category,
							author: book.author,
							published_date: book.published_date,
							availability: book.availability,
							comments: book.published_date
						}
					};
					commit("book_edit", updatedBook);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	},
	book_delete({ commit }, book) {
		return new Promise((resolve, reject) => {
			commit("book_request");

			axios({
				method: "DELETE",
				url: `${COUCH_DB_BASEURL}/library/${book._id}?rev=${book._rev}`,
				withCredentials: true
			})
				.then(resp => {
					commit("book_delete", book._id);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	},
	fetch_books({ commit }, options) {
		return new Promise((resolve, reject) => {
			commit("book_request");
			const skip = (options.page - 1) * options.itemsPerPage;

			const view = options.search
				? `_design/books/_view/_search?limit=${options.itemsPerPage}&skip=${skip}&key="${options.search}"`
				: `_design/books/_view/_info?limit=${options.itemsPerPage}&skip=${skip}`;

			axios({
				method: "GET",
				url: `${COUCH_DB_BASEURL}/library/${view}`,
				withCredentials: true
			})
				.then(resp => {
					commit("book_list", resp.data);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	},
	getCheckoutBooks({ commit }) {
		return new Promise((resolve, reject) => {
			commit("book_request");

			axios({
				method: "GET",
				url: `${COUCH_DB_BASEURL}/library/_design/books/_view/_find_checkout_by_user?key="aaas"`,
				withCredentials: true
			})
				.then(resp => {
					commit("checkoutBookList", resp.data.rows);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	},
	returnBook({ commit }, book) {
		return new Promise((resolve, reject) => {
			axios({
				method: "PUT",
				url: `${COUCH_DB_BASEURL}/library/${book.id}`,
				data: {
					_rev: book.value._rev,
					type: "book",
					name: book.value.name,
					category: book.value.category,
					isbn: book.value.isbn,
					author: book.value.author,
					published_date: book.value.published_date,
					availability: {
						status: true,
						taken_by: "",
						taken_name: "",
						date: ""
					},
					comments: book.value.comments
				},
				withCredentials: true
			})
				.then(resp => {
					commit("returnBook", resp.data);
					resolve(resp);
				})
				.catch(err => {
					commit("book_error");
					reject(err);
				});
		});
	},
	checkoutBook({ commit, dispatch }, book) {
		dispatch("book_edit", book).then(resp => {
			book["_rev"] = resp.data.rev;
			commit("checkoutBook", book);
		});
	}
};

const mutations = {
	book_request(state) {
		state.status = "loading";
	},
	book_list(state, data) {
		state.status = "success";
		state.books = data.rows;
		state.bookCount = data.total_rows;
	},
	book_create(state, book) {
		state.status = "created";
		state.books.unshift(book);
	},
	book_edit(state, updatedBook) {
		state.status = "edited";
		const index = state.books.findIndex(book => book.id === updatedBook.id);
		if (index !== -1) {
			state.books.splice(index, 1, updatedBook);
		}
	},
	book_delete(state, id) {
		state.status = "deleted";
		state.books = state.books.filter(book => book.id !== id);
		state.checkoutBookList = state.checkoutBookList.filter(
			book => book.id !== id
		);
		state.bookCount--;
	},
	book_error(state) {
		state.status = "error";
	},
	checkoutBookList(state, bookList) {
		state.checkoutBookList = bookList;
	},
	returnBook(state, returnedBook) {
		state.checkoutBookList = state.checkoutBookList.filter(
			book => book.id !== returnedBook.id
		);

		const index = state.books.findIndex(book => book.id === returnedBook.id);
		if (index !== -1) {
			let obj = state.books[index];
			obj["value"]["_rev"] = returnedBook.rev;
			obj["value"]["availability"] = {
				status: true,
				taken_by: "",
				taken_name: "",
				date: ""
			};
			state.books.splice(index, 1, obj);
		}
	},
	checkoutBook(state, updatedBook) {
		let book = {
			id: updatedBook._id,
			key: updatedBook.availability.taken_by,
			value: {
				_rev: updatedBook._rev,
				name: updatedBook.name,
				isbn: updatedBook.isbn,
				category: updatedBook.category,
				author: updatedBook.author,
				availability: updatedBook.availability,
				comments: updatedBook.comments
			}
		};

		state.checkoutBookList.unshift(book);
	}
};

export default {
	state,
	getters,
	actions,
	mutations
};
