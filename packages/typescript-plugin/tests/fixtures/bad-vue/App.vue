<script setup lang="ts">
import { Button } from "./button.arv";

// "warning" is not a declared tone variant — must fail typechecking.
const styles = Button({ tone: "warning" });
</script>

<template>
  <button :class="styles.root">Save</button>
</template>
