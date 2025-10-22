<script setup lang="ts">
import { useMouse } from "@vueuse/core";
import { onMounted, ref } from "vue";

const { x, y } = useMouse();
</script>

<template>
    <main>
        <div class="p-5">
            <h1>
                <span><small class="font-thin">x: </small></span>
                {{ x }}
            </h1>
            <h1>
                <span><small class="font-thin">y: </small></span>
                {{ y }}
            </h1>
        </div>
    </main>
</template>
