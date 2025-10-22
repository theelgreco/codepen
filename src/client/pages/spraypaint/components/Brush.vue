<script setup lang="ts">
import { computed } from "vue";
import { useBrush } from "../composables";
import { useMouse } from "@vueuse/core";

const { x: mouseX, y: mouseY } = useMouse();
const { brushSize } = useBrush();

const svgProps = computed(() => {
    const coords = brushSize.value + 15;
    const size = coords * 2;
    const x = mouseX.value - size / 2;
    const y = mouseY.value - size / 2;

    return {
        width: size,
        height: size,
        cx: coords,
        cy: coords,
        r: brushSize.value,
        x,
        y,
    };
});
</script>

<template>
    <svg class="fixed" :style="{ top: svgProps.y, left: svgProps.x }" ref="svg" :width="svgProps.width" :height="svgProps.height">
        <circle :cx="svgProps.cx" :cy="svgProps.cy" :r="svgProps.r" stroke="white" fill="transparent"></circle>
    </svg>
</template>
