import { ref, watch } from "vue";
import { useMouseWheel } from ".";
import { clamp } from "lodash";

export type UseBrushOptions = { minBrushSize: number; maxBrushSize: number; initialBrushSize: number };

export function useBrush(
    { minBrushSize, maxBrushSize, initialBrushSize }: UseBrushOptions = { minBrushSize: 0, maxBrushSize: Infinity, initialBrushSize: 35 }
) {
    const brushSize = ref(initialBrushSize);

    const { deltaY } = useMouseWheel();

    function setBrushSize(size: number) {
        brushSize.value = clamp(minBrushSize, size, maxBrushSize);
    }

    watch(deltaY, (newValue) => {
        brushSize.value = clamp(minBrushSize, brushSize.value + newValue, maxBrushSize);
    });

    return { brushSize, setBrushSize };
}
