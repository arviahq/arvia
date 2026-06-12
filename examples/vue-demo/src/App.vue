<script setup lang="ts">
import { setTheme } from "./arvia-theme";
import { Badge } from "./components/badge.arv";
import { Button, type ButtonProps } from "./components/button.arv";
import { Stack } from "./components/stack.arv";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly ButtonProps["size"][];
const TONES = ["primary", "danger", "ghost"] as const satisfies readonly ButtonProps["tone"][];
const BADGE_TONES = ["neutral", "success", "warning", "danger"] as const;

const page = Stack({ gap: "5" });
const row = Stack({ direction: "row", gap: "3", align: "center", wrap: "yes" });
const ghostSm = Button({ size: "sm", tone: "ghost" });
</script>

<template>
  <main :class="page.root" style="max-width: 720px; margin: 0 auto; padding: 24px">
    <header :class="row.root" style="justify-content: space-between">
      <h1>Arvia + Vue</h1>
      <div :class="row.root">
        <button type="button" :class="ghostSm.root" @click="setTheme('light')">
          <span :class="ghostSm.label">Light</span>
        </button>
        <button type="button" :class="ghostSm.root" @click="setTheme('dark')">
          <span :class="ghostSm.label">Dark</span>
        </button>
      </div>
    </header>

    <p>Every style on this page is compiled from <code>.arv</code> files — zero runtime CSS.</p>

    <section :class="Stack({ gap: '4' }).root">
      <h2>Button — sizes × tones, compound variant on sm + danger</h2>
      <div v-for="tone in TONES" :key="tone" :class="row.root">
        <button
          v-for="size in SIZES"
          :key="size"
          type="button"
          :class="Button({ size, tone }).root"
        >
          <span :class="Button({ size, tone }).icon">✦</span>
          <span :class="Button({ size, tone }).label">{{ tone }} {{ size }}</span>
        </button>
        <button type="button" :class="Button({ tone }).root" disabled>
          <span :class="Button({ tone }).label">disabled</span>
        </button>
      </div>
    </section>

    <section :class="Stack({ gap: '4' }).root">
      <h2>Badge — tone variants</h2>
      <div :class="row.root">
        <span v-for="tone in BADGE_TONES" :key="tone" :class="Badge({ tone }).root">
          {{ tone }}
        </span>
      </div>
    </section>
  </main>
</template>
