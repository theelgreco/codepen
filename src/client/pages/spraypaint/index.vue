<script setup lang="ts">
import Coordinates from "./components/Coordinates.vue";
import Brush from "./components/Brush.vue";
import { useBrush } from "./composables";
import Stroke from "./components/Stroke.vue";
import { useMousePressed } from "@vueuse/core";

const { strokes, addStroke } = useBrush();
const { pressed } = useMousePressed();

function handleDraw() {
    if (pressed.value) {
        addStroke();
    }
}
</script>

<template>
    <main class="p-10" @mousemove="handleDraw" @mousedown="addStroke">
        <Brush />
        <Stroke v-for="stroke in strokes" :key="stroke.id" :brushStroke="stroke" />
    </main>
    <Coordinates />
</template>
