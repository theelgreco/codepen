<script setup lang="ts">
import Coordinates from "./components/Coordinates.vue";
import Brush from "./components/Brush.vue";
import { useBrush } from "./composables";
import Stroke from "./components/Stroke.vue";
import { useMousePressed } from "@vueuse/core";
import { useMagicKeys } from "@vueuse/core";
import { watch } from "vue";

const { strokes, addStroke, undoStroke } = useBrush();
const { pressed } = useMousePressed();
const { meta, z } = useMagicKeys();

function handleDraw() {
    if (pressed.value) {
        addStroke();
    }
}

watch([meta, z], ([newMeta, newZ]) => {
    if (newMeta && newZ) undoStroke();
});
</script>

<template>
    <main class="p-10" @mousemove="handleDraw" @mousedown="addStroke">
        <Brush />
        <Stroke v-for="stroke in strokes" :key="stroke.id" :brushStroke="stroke" />
    </main>
    <Coordinates />
</template>
