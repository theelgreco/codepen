<script setup lang="ts">
import { BrushStroke } from "../composables/useBrush";

interface Props {
    brushStroke: BrushStroke;
}

defineProps<Props>();
</script>

<template>
    <svg
        class="fixed"
        :style="{ top: brushStroke.y, left: brushStroke.x }"
        ref="svg"
        :width="brushStroke.width"
        :height="brushStroke.height"
    >
        <circle :cx="brushStroke.cx" :cy="brushStroke.cy" :r="brushStroke.r" :stroke="brushStroke.stroke" :fill="brushStroke.fill"></circle>
    </svg>
</template>
