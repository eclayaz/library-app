<template>
  <v-container fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md8>
        <v-card class="elevation-12">
          <v-toolbar dark color="blue">
            <v-toolbar-title>Reader signup form</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-alert
                :value="userExists"
                color="error"
                icon="warning"
              >This user already exists, try a different set of data.</v-alert>

              <v-text-field
                prepend-icon="person"
                name="username"
                v-model="username"
                label="Username"
                :rules="[rules.required]"
              ></v-text-field>

              <v-text-field
                prepend-icon="lock"
                name="password"
                label="Password"
                :rules="[rules.required]"
                type="password"
                v-model="password"
              ></v-text-field>

              <v-text-field
                prepend-icon="lock"
                name="password"
                label="Confirm Password"
                :rules="[rules.required]"
                type="password"
                v-model="confirm_password"
                :error="!valid()"
              ></v-text-field>

              <v-text-field
                prepend-icon="person"
                name="first_name"
                v-model="first_name"
                label="First name"
                :rules="[rules.required]"
              ></v-text-field>

              <v-text-field
                prepend-icon="person"
                name="last_name"
                v-model="last_name"
                label="Last name"
                :rules="[rules.required]"
              ></v-text-field>

              <v-text-field
                prepend-icon="email"
                name="email"
                v-model="email"
                label="Email"
                :rules="[rules.required, rules.email]"
              ></v-text-field>

              <v-text-field
                prepend-icon="phone"
                name="phone"
                v-model="phone"
                label="Phone"
                type="number"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-divider light></v-divider>
          <v-card-actions>
            <v-btn to="/login" rounded color="black" dark>Login</v-btn>
            <v-spacer></v-spacer>
            <v-btn rounded color="success" @click.prevent="register()">
              Register
              <v-icon>keyboard_arrow_up</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Signup",
  data: () => ({
    userExists: false,
    username: "aa",
    first_name: "bb",
    last_name: "cc",
    email: "eclayaz@gmail.com",
    password: "123",
    confirm_password: "123",
    phone: "0766",
    rules: {
      required: value => !!value || "Required",
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      }
    }
  }),
  methods: {
    register() {
      if (this.valid()) {
        this.$store
          .dispatch("register", {
            username: this.username,
            password: this.password,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone
          })
          .then(() => {
            this.$store.commit("singup_notification", {
              display: true,
              text:
                "Your account has been successfully created! you can now login."
            });
            this.$router.push("/");
          })
          .catch(() => {
            this.userExists = true;
          });
      }
    },
    valid() {
      return this.password === this.confirm_password;
    }
  }
};
</script>
