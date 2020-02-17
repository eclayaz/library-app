<template>
	<v-navigation-drawer absolute permanent right app>
		<template v-slot:prepend>
			<v-list-item two-line>
				<v-list-item-avatar>
					<img src="https://randomuser.me/api/portraits/women/81.jpg" />
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title>Jane Smith</v-list-item-title>
					<v-list-item-subtitle>Logged In</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
			<v-card-actions>
				<v-btn @click="logout" rounded color="indigo" dark>Logout</v-btn>
			</v-card-actions>
		</template>

		<v-divider></v-divider>

		<v-list dense>
			<v-list-item v-for="item in items" :key="item.title">
				<v-list-item-icon>
					<v-icon>{{ item.icon }}</v-icon>
				</v-list-item-icon>

				<v-list-item-content>
					<v-list-item-title>{{ item.title }}</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
export default {
	name: "Menu",
	data() {
		return {
			items: [
				{ title: "Home", icon: "mdi-home-city" },
				{ title: "My Account", icon: "mdi-account" },
				{ title: "Users", icon: "mdi-account-group-outline" }
			]
		};
	},
	methods: {
		logout() {
			this.$store.dispatch("logout").then(() => {
				this.$router.push("/login");
			});
		}
	}
};
</script>
