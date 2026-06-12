<script setup lang="ts">
import { Button, type ButtonProps } from "./button.arv";

const tone: NonNullable<ButtonProps["tone"]> = "danger";
const styles = Button({ tone });
</script>

<template>
  <button :class="styles.root">
    <span :class="styles.label">Save</span>
  </button>
</template>
