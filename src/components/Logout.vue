<template>
  <v-list-item @click="logout">
    <v-list-item-icon>
      <v-icon></v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>Logout</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: "Logout",
  methods: {
    logout() {
      confirm("Are you sure you want to delete this item?") &&
        this.$store.dispatch("logout");
      this.$router.push("/login");
    }
  }
};
</script>

<style>
</style>