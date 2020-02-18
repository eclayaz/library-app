<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :search="search"
      :options.sync="options"
      :server-items-length="totalDesserts"
      :loading="loading"
      sort-by="calories"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Books</v-toolbar-title>
        </v-toolbar>
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
                    <v-container>
                      <v-col sm="8">
                        <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
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
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="save">Save</v-btn>
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
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: "LibrarianPortal",
  data: () => ({
    dialog: false,
    search: "",
    headers: [
      {
        text: "Dessert (100g serving)",
        align: "left",
        sortable: false,
        value: "name"
      },
      { text: "Calories", value: "calories" },
      { text: "Fat (g)", value: "fat" },
      { text: "Carbs (g)", value: "carbs" },
      { text: "Protein (g)", value: "protein" },
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
      date: null
    },
    defaultItem: {
      name: "",
      isbn: "",
      category: "",
      date: new Date().toISOString().substr(0, 10)
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
    ]
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New book" : "Edit book";
    }
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi().then(data => {
          this.desserts = data.items;
          this.totalDesserts = data.total;
        });
      },
      deep: true
    },
    dialog(val) {
      val || this.close();
    },
    search() {
      console.log("searching");
    },
    publishedDateMenu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = "YEAR"));
    }
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.getDataFromApi().then(data => {
        this.desserts = data.items;
        this.totalDesserts = data.total;
      });
    },
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
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        this.desserts.push(this.editedItem);
      }
      this.close();
    },
    getDataFromApi() {
      this.loading = true;
      return new Promise(resolve => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        let items = this.getDesserts();
        const total = items.length;
        if (sortBy.length === 1 && sortDesc.length === 1) {
          items = items.sort((a, b) => {
            const sortA = a[sortBy[0]];
            const sortB = b[sortBy[0]];
            if (sortDesc[0]) {
              if (sortA < sortB) return 1;
              if (sortA > sortB) return -1;
              return 0;
            } else {
              if (sortA < sortB) return -1;
              if (sortA > sortB) return 1;
              return 0;
            }
          });
        }
        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        }
        setTimeout(() => {
          this.loading = false;
          resolve({
            items,
            total
          });
        }, 1000);
      });
    },
    savePublishDate(date) {
      this.$refs.menu.save(date);
    },
    getDesserts() {
      return [
        {
          name: "Frozen Yogurt",
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: "1%"
        },
        {
          name: "Ice cream sandwich",
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: "1%"
        },
        {
          name: "Eclair",
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: "7%"
        },
        {
          name: "Cupcake",
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: "8%"
        },
        {
          name: "Gingerbread",
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: "16%"
        },
        {
          name: "Jelly bean",
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: "0%"
        },
        {
          name: "Lollipop",
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: "2%"
        },
        {
          name: "Honeycomb",
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: "45%"
        },
        {
          name: "Donut",
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: "22%"
        },
        {
          name: "KitKat",
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: "6%"
        }
      ];
    }
  }
};
</script>

<style></style>
