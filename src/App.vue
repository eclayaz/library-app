<template>
	<v-app>
		<Menu v-if="isAuthenticated" />
		<router-view></router-view>
	</v-app>
</template>

<script>
import Menu from "@/components/Menu";
import { mapGetters } from "vuex";

export default {
	name: "App",

	components: {
		Menu
	},
	computed: mapGetters(["isAuthenticated"]),

	data: () => ({
		//
	})
};
</script>
