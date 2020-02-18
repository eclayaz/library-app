import axios from "axios";

const state = {
	status: "",
	books: [],
	bookCount: 0
};

const getters = {
	allBooks: state => state.books,
	bookCount: state => state.bookCount
};

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
					const newBook = {
						id: resp.data.id,
						key: book.name,
						value: {
							_rev: resp.data.rev,
							isbn: book.isbn,
							category: book.category,
							author: book.author,
							published_date: book.published_date
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
	fetch_books({ commit }, options) {
		return new Promise((resolve, reject) => {
			commit("book_request");
			const skip = (options.page - 1) * options.itemsPerPage;
			axios({
				method: "GET",
				url: `http://localhost:5984/library/_design/books/_view/basic_info?limit=${options.itemsPerPage}&skip=${skip}`,
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
		console.log(book);

		state.books.unshift(book);
	},
	book_edit(state, data, book) {
		//wrong
		state.status = "created";
		state.books = state.books.unshift(book);
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
