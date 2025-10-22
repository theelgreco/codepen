<script setup lang="ts">
import Coordinates from "./components/Coordinates.vue";
import Brush from "./components/Brush.vue";
import { useBrush } from "./composables";
import Stroke from "./components/Stroke.vue";

const { strokes, addStroke } = useBrush();
</script>

<template>
    <main class="p-10" @click="addStroke">
        <Brush />
        <Stroke v-for="stroke in strokes" :key="stroke.timestamp" :brushStroke="stroke" />
    </main>
    <Coordinates />
</template>
