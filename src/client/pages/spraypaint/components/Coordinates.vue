<script setup lang="ts">
import { useMouse } from "@vueuse/core";
import { useBrush } from "../composables";

const { x, y } = useMouse();
const { brushSize } = useBrush();
</script>

<template>
    <div class="flex flex-col p-5 border w-fit border-neutral-800 select-none fixed bottom-10 right-10 shadow-xl bg-[#111]">
        <span><small class="font-thin">x: </small>{{ x }}</span>
        <span><small class="font-thin">y: </small>{{ y }}</span>
        <span><small class="font-thin">Brush size: </small>{{ brushSize }}</span>
    </div>
</template>
