<template>
  <v-app>
    <Menu />
    <v-container fluid>
      <v-content>
        <Books />
      </v-content>
    </v-container>
  </v-app>
</template>

<script>
import Books from "@/components/Books";
import Menu from "@/components/Menu";

export default {
  name: "Home",
  components: {
    Books,
    Menu
  }
};
</script>
