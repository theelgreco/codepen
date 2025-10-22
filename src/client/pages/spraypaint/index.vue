<script setup lang="ts">
import { useMouse } from "@vueuse/core";
import Coordinates from "./components/Coordinates.vue";
import { computed, ref, watch } from "vue";
import { useMouseWheel } from "./composables";
import { clamp } from "lodash";

const { deltaY } = useMouseWheel();
const { x: mouseX, y: mouseY } = useMouse();

const radius = ref(35);

const svgProps = computed(() => {
    const coords = radius.value + 15;
    const size = coords * 2;
    const x = mouseX.value - size / 2;
    const y = mouseY.value - size / 2;

    return {
        width: size,
        height: size,
        cx: coords,
        cy: coords,
        r: radius.value,
        x,
        y,
    };
});

watch(deltaY, (newValue) => {
    radius.value = clamp(0, radius.value + newValue, 300);
});
</script>

<template>
    <main class="p-10">
        <svg class="fixed" :style="{ top: svgProps.y, left: svgProps.x }" ref="svg" :width="svgProps.width" :height="svgProps.height">
            <circle :cx="svgProps.cx" :cy="svgProps.cy" :r="svgProps.r" stroke="white" fill="transparent"></circle>
        </svg>
    </main>
    <Coordinates />
</template>
