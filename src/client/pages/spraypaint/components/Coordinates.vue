<script setup lang="ts">
import { useMouse } from "@vueuse/core";

const { x, y } = useMouse();
</script>

<template>
    <div class="flex flex-col p-5 border w-fit border-neutral-800 select-none fixed bottom-10 right-10 shadow-xl">
        <span><small class="font-thin">x: </small>{{ x }}</span>
        <span><small class="font-thin">y: </small>{{ y }}</span>
    </div>
</template>
