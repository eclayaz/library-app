<template>
  <v-app>
    <Menu />
    <v-container fluid>
      <v-content>
        <Books v-show="isHome" />
        <ReaderReturnBooks v-show="isReaderReturnBooks"></ReaderReturnBooks>
      </v-content>
    </v-container>
  </v-app>
</template>

<script>
import Books from "@/components/Books";
import Menu from "@/components/Menu";
import ReaderReturnBooks from "@/views/ReaderReturnBooks";

export default {
  name: "Home",
  components: {
    Books,
    Menu,
    ReaderReturnBooks
  },
  computed: {
    isHome() {
      return this.$route.name === "Home";
    },
    isReaderReturnBooks() {
      return this.$route.name === "ReaderReturnBooks";
    }
  }
};
</script>
