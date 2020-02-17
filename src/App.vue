<template>
  <v-app>
    <Menu />

    <v-content>
      <v-container fluid>
        <LibrarianPortal />
        <!-- If using vue-router -->
        <!-- <router-view></router-view> -->
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
import Menu from "./components/Menu";
import LibrarianPortal from "./components/LibrarianPortal";

export default {
  name: "App",

  components: {
    // Login,
    // Signup,
    Menu,
    LibrarianPortal
  },

  data: () => ({
    //
  })
};
</script>
