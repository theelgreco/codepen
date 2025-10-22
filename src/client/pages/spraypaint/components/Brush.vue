<script setup lang="ts">
import { useBrush } from "../composables";

const { brush } = useBrush();
</script>

<template>
    <svg class="fixed" :style="{ top: brush.y, left: brush.x }" ref="svg" :width="brush.width" :height="brush.height">
        <circle :cx="brush.cx" :cy="brush.cy" :r="brush.r" stroke="white" fill="transparent"></circle>
    </svg>
</template>
