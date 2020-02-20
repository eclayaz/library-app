<template>
  <v-navigation-drawer absolute permanent right app>
    <template v-slot:prepend>
      <v-list-item two-line>
        <v-list-item-avatar>
          <img src="https://randomuser.me/api/portraits/lego/1.jpg" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{userDetails.first_name}} {{userDetails.last_name}}</v-list-item-title>
          <v-list-item-subtitle>Logged in - {{userDetails.roles.join(', ')}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>Email: {{userDetails.email}}</v-list-item-subtitle>
          <v-list-item-subtitle>Phone: {{userDetails.phone}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-divider></v-divider>

    <v-list dense>
      <v-list-item @click="home">
        <v-list-item-icon>
          <v-icon>mdi-home-city</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-if="isAdmin" @click="manageUsers">
        <v-list-item-icon>
          <v-icon>mdi-account</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Manage Users</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-if="isAdmin" @click="manageUserRoles">
        <v-list-item-icon>
          <v-icon>mdi-account-group-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Manage User Roles</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-if="isReader" @click="returnBooks">
        <v-list-item-icon>
          <v-icon>mdi-account-group-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Return Books</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="logout">
        <v-list-item-icon>
          <v-icon></v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Menu",
  data() {
    return {};
  },
  methods: {
    logout() {
      confirm("Are you sure you want to delete this item?") &&
        this.$store.dispatch("logout").then(() => {
          this.$router.push("/login");
        });
    },
    home() {
      this.$router.push("/");
    },
    manageUsers() {
      this.$router.push("/manage-users");
    },
    manageUserRoles() {
      this.$router.push("/manage-user-roles");
    },
    returnBooks() {
      this.$router.push("/reader-return-books");
    }
  },
  computed: {
    ...mapGetters(["isAdmin", "isLibrarian", "isReader", "userDetails"])
  }
};
</script>
