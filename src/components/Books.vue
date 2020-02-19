<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="allBooks"
      :search="search"
      :options.sync="options"
      :server-items-length="bookCount"
      :loading="loading"
      sort-by="name"
      class="elevation-1"
    >
      <template
        v-slot:item.value.availability.status="{ item }"
      >{{getAvaialibilityText(item.value.availability) }}</template>
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Books</v-toolbar-title>
        </v-toolbar>
        <v-alert :color="showMessage.class" :value="showMessage.display">{{showMessage.message}}</v-alert>
        <v-container fill-height fluid class="mt-0 pt-0">
          <v-row no-gutters align="center" justify="center">
            <v-col cols="3">
              <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
                class="pr-5"
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="2" class="d-flex justify-end">
              <v-dialog v-model="dialog" max-width="500px" v-if="!isReader">
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" dark class="mb-2" v-on="on">New Book</v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-form>
                      <v-container>
                        <v-col sm="8">
                          <v-text-field
                            v-model="editedItem.name"
                            label="Name"
                            :rules="[rules.required]"
                          ></v-text-field>
                        </v-col>
                        <v-col sm="8">
                          <v-text-field v-model="editedItem.isbn" label="ISBN" type="number"></v-text-field>
                        </v-col>
                        <v-col sm="8">
                          <v-select
                            :items="bookCategories"
                            v-model="editedItem.category"
                            label="Catagory"
                            outlined
                          ></v-select>
                        </v-col>
                        <v-col sm="8">
                          <v-menu
                            ref="menu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="editedItem.date"
                                label="Published date"
                                prepend-icon="event"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              ref="sa"
                              v-model="editedItem.date"
                              :max="new Date().toISOString().substr(0, 10)"
                              @change="savePublishDate"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col sm="8">
                          <v-text-field v-model="editedItem.author" label="Author"></v-text-field>
                        </v-col>
                      </v-container>
                    </v-form>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                    <v-btn
                      v-if="!isEdit"
                      color="blue darken-1"
                      :disabled="!isComplete"
                      text
                      @click.prevent="save()"
                    >Create</v-btn>
                    <v-btn
                      v-if="isEdit"
                      color="blue darken-1"
                      :disabled="!isComplete"
                      text
                      @click.prevent="edit()"
                    >Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-if="!isReader" v-slot:item.action="{ item }">
        <v-btn
          @click="openAssignUserModal(item)"
          v-if="typeof(item.value.availability) === 'undefined' || item.value.availability.status"
          depressed
          small
        >Assign</v-btn>
        <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon small @click="deleteItem(item)">delete</v-icon>
      </template>
      <template v-if="isReader" v-slot:item.action="{ item }">
        <v-btn
          @click="checkoutBook(item)"
          v-if="typeof(item.value.availability) === 'undefined' || item.value.availability.status"
          depressed
          small
        >Checkout</v-btn>
      </template>
    </v-data-table>
    <v-row justify="center">
      <v-dialog v-model="assignToUserModel" persistent max-width="450">
        <v-card>
          <v-card-title class="headline">Assign to Reader</v-card-title>
          <v-card-text>
            <v-container>
              <v-col sm="12">
                <v-select
                  v-model="assignToReader"
                  :items="this.allReaders"
                  item-text="value.name"
                  outlined
                ></v-select>
              </v-col>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="closeAssignUserModal">Cancel</v-btn>
            <v-btn color="green darken-1" text @click="assignToUser">Assign</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "LibrarianPortal",
  data: () => ({
    dialog: false,
    assignToUserModel: false,
    assignToReader: null,
    showMessage: {
      actios: "",
      success: null,
      message: "",
      display: false,
      class: "success"
    },
    search: "",
    loading: true,
    options: {},
    editedIndex: -1,
    editedItem: {
      name: "",
      isbn: "",
      category: "Action",
      date: null,
      author: ""
    },
    defaultItem: {
      name: "",
      isbn: "",
      category: "",
      date: null,
      author: ""
    },
    bookCategories: [
      "Action",
      "Classics",
      "Comic",
      "Detective",
      "Fantasy",
      "Fiction",
      "Romance",
      "Science"
    ],
    rules: {
      required: value => !!value || "Required"
    }
  }),
  computed: {
    ...mapGetters([
      "allBooks",
      "bookCount",
      "isReader",
      "allReaders",
      "userDetails"
    ]),
    formTitle() {
      return this.editedIndex === -1 ? "New book" : "Edit book";
    },
    isEdit() {
      return this.editedIndex !== -1;
    },
    isComplete() {
      return (
        this.editedItem.name &&
        this.editedItem.isbn &&
        this.editedItem.category &&
        this.editedItem.date
      );
    },
    headers() {
      let headers = [
        {
          text: "Name",
          align: "left",
          sortable: false,
          value: "value.name"
        },
        { text: "ISBN", value: "value.isbn", sortable: false },
        { text: "Category", value: "value.category", sortable: false },
        { text: "Author", value: "value.author", sortable: false },
        {
          text: "Published date",
          value: "value.published_date",
          sortable: false
        },
        { text: "Status", value: "value.availability.status", sortable: false }
      ];

      headers.push({
        text: "Actions",
        value: "action",
        sortable: false
      });

      return headers;
    }
  },
  watch: {
    options: {
      handler() {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        const search = this.search;
        this.fetchData({ sortBy, sortDesc, page, itemsPerPage, search });
      },
      deep: true
    },
    dialog(val) {
      val || this.close();
    },
    search() {
      const { sortBy, sortDesc, itemsPerPage } = this.options;
      const search = this.search;
      this.fetchData({ sortBy, sortDesc, page: 1, itemsPerPage, search });
    },
    publishedDateMenu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = "YEAR"));
    }
  },
  methods: {
    ...mapActions(["fetch_books", "getReaders"]),
    editItem(item) {
      this.editedIndex = 1;
      this.editedItem = {
        _id: item.id,
        _rev: item.value._rev,
        name: item.value.name,
        isbn: item.value.isbn,
        category: item.value.category,
        date: item.value.published_date,
        author: item.value.author,
        comments: item.value.comments,
        availability: item.value.availability
      };
      this.dialog = true;
    },
    deleteItem(item) {
      confirm("Are you sure you want to delete this item?") &&
        this.$store
          .dispatch("book_delete", {
            _id: item.id,
            _rev: item.value._rev
          })
          .catch(err => {
            this.showMessage = {
              actios: "delete",
              success: false,
              message: err.response.data.reason,
              display: true,
              class: "error"
            };
          });

      this.close();
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
      this.$store
        .dispatch("book_create", {
          name: this.editedItem.name,
          isbn: this.editedItem.isbn,
          category: this.editedItem.category,
          published_date: this.editedItem.date,
          author: this.editedItem.author
        })
        .then(() => {
          this.showMessage = {
            actios: "created",
            success: true,
            message: `Book ${this.editedItem.name} created successfully.`,
            display: true,
            class: "success"
          };
        })
        .catch(err => {
          this.showMessage = {
            actios: "created",
            success: false,
            message:
              err.response.status === 409
                ? `The book you are trying to create is already exist.`
                : err.response.data.reason,
            display: true,
            class: "error"
          };
        });

      this.close();
    },
    edit() {
      this.$store
        .dispatch("book_edit", {
          _id: this.editedItem._id,
          _rev: this.editedItem._rev,
          name: this.editedItem.name,
          isbn: this.editedItem.isbn,
          category: this.editedItem.category,
          published_date: this.editedItem.date,
          author: this.editedItem.author,
          comments: this.editedItem.comments,
          availability: this.editedItem.availability
        })
        .catch(err => {
          this.showMessage = {
            actios: "edit",
            success: false,
            message: err.response.data.reason,
            display: true,
            class: "error"
          };
        });

      this.close();
    },
    savePublishDate(date) {
      this.$refs.menu.save(date);
      this.loading = false;
    },
    fetchData(options) {
      this.loading = true;
      return new Promise(resolve => {
        this.fetch_books(options);
        resolve();
        this.loading = false;
      });
    },
    getAvaialibilityText(availability) {
      if (typeof availability === "undefined") {
        return "Available";
      }
      return availability.status ? "Available" : "Not Available";
    },
    openAssignUserModal(item) {
      this.editedItem = {
        _id: item.id,
        _rev: item.value._rev,
        name: item.value.name,
        isbn: item.value.isbn,
        category: item.value.category,
        date: item.value.published_date,
        author: item.value.author,
        comments: item.value.comments,
        availability: item.value.availability
      };
      this.assignToUserModel = true;
    },
    closeAssignUserModal() {
      this.assignToUserModel = false;
      this.assignToReader = null;
    },
    assignToUser() {
      this.$store
        .dispatch("book_edit", {
          _id: this.editedItem._id,
          _rev: this.editedItem._rev,
          name: this.editedItem.name,
          isbn: this.editedItem.isbn,
          category: this.editedItem.category,
          published_date: this.editedItem.date,
          author: this.editedItem.author,
          comments: this.editedItem.comments,
          availability: {
            status: false,
            taken_by: this.assignToReader.name,
            taken_name: `${this.assignToReader.first_name} ${this.assignToReader.last_name}`,
            date: new Date().toISOString().substr(0, 10)
          }
        })
        .catch(err => {
          this.showMessage = {
            actios: "edit",
            success: false,
            message: err.response.data.reason,
            display: true,
            class: "error"
          };
        });
      this.closeAssignUserModal();
    },
    checkoutBook(item) {
      confirm("Are you sure you want to checkout this book?") &&
        this.$store
          .dispatch("book_edit", {
            _id: item.id,
            _rev: item.value._rev,
            name: item.value.name,
            isbn: item.value.isbn,
            category: item.value.category,
            date: item.value.published_date,
            author: item.value.author,
            comments: item.value.comments,
            availability: {
              status: false,
              taken_by: this.userDetails.name,
              taken_name: `${this.userDetails.first_name} ${this.userDetails.last_name}`,
              date: new Date().toISOString().substr(0, 10)
            }
          })
          .catch(err => {
            this.showMessage = {
              actios: "edit",
              success: false,
              message: err.response.data.reason,
              display: true,
              class: "error"
            };
          });
    }
  },
  created() {
    if (!this.isReader) {
      this.getReaders();
    }
  }
};
</script>
