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
              <v-dialog v-model="dialog" max-width="500px">
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
                      color="blue darken-1"
                      :disabled="!isComplete"
                      text
                      @click.prevent="save()"
                    >Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon small @click="deleteItem(item)">delete</v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "LibrarianPortal",
  data: () => ({
    dialog: false,
    showMessage: {
      actios: "",
      success: null,
      message: "",
      display: false,
      class: "success"
    },
    search: "",
    headers: [
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
      { text: "Actions", value: "action", sortable: false }
    ],
    totalDesserts: 0,
    loading: true,
    options: {},
    desserts: [],
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
      date: new Date().toISOString().substr(0, 10),
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
    ...mapGetters(["allBooks", "bookCount"]),
    formTitle() {
      return this.editedIndex === -1 ? "New book" : "Edit book";
    },
    isComplete() {
      return (
        this.editedItem.name &&
        this.editedItem.isbn &&
        this.editedItem.category &&
        this.editedItem.date
      );
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
    ...mapActions(["fetch_books"]),
    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      const index = this.desserts.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.desserts.splice(index, 1);
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
    }
  }
};
</script>
