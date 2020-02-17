<template>
	<v-content>
		<v-container fluid>
			<Books />
		</v-container>
	</v-content>
</template>

<script>
import Books from "@/components/Books";

export default {
	name: "Home",
	components: {
		Books
	}
};
</script>
