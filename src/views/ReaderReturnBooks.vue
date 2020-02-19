<template>
  <v-container>
    <h3>Return Books</h3>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">ISBN</th>
            <th class="text-left">Author</th>
            <th class="text-left">Checkout Date</th>
            <th class="text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in checkoutBookList" :key="item.id">
            <td>{{ item.value.name }}</td>
            <td>{{ item.value.isbn }}</td>
            <td>{{ item.value.author }}</td>
            <td>{{ item.value.availability.date }}</td>
            <td>
              <v-btn small @click="returnBook(item)">Return</v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ReaderReturnBooks",
  computed: {
    ...mapGetters(["checkoutBookList"])
  },
  methods: {
    ...mapActions(["getCheckoutBooks"]),
    returnBook(book) {
      this.$store.dispatch("returnBook", book).catch(err => {
        this.showMessage = {
          actios: "return",
          success: false,
          message: err.response.data.reason,
          display: true,
          class: "error"
        };
      });
    }
  },
  created() {
    this.getCheckoutBooks();
  }
};
</script>