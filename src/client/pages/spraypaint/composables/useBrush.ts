import { computed, ref, watch } from "vue";
import { useMouseWheel } from ".";
import { clamp } from "lodash";
import { useMouse } from "@vueuse/core";

export type UseBrushOptions = { minBrushSize?: number; maxBrushSize?: number; initialBrushSize?: number };

export type Brush = { width: number; height: number; cx: number; cy: number; r: number; x: number; y: number };

export type BrushStroke = Brush & { id: string; timestamp: number; fill: string; stroke: string };

export function useBrush({ minBrushSize = 10, maxBrushSize = 300, initialBrushSize = 30 }: UseBrushOptions = {}) {
    const { x: mouseX, y: mouseY } = useMouse();
    const { deltaY } = useMouseWheel();

    const brushSize = ref(initialBrushSize);

    const fill = ref("white");

    const stroke = ref("transparent");

    const brush = computed<Brush>(() => {
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

    const strokes = ref<BrushStroke[]>([]);

    function setBrushSize(size: number) {
        brushSize.value = clamp(minBrushSize, size, maxBrushSize);
    }

    function addStroke() {
        strokes.value.push({
            ...brush.value,
            id: crypto.randomUUID(),
            timestamp: performance.now(),
            fill: fill.value,
            stroke: stroke.value,
        });
    }

    function undoStroke() {
        strokes.value = strokes.value.toSpliced(-1, 1);
    }

    watch(deltaY, (newValue) => {
        console.log(maxBrushSize);
        brushSize.value = Math.round(clamp(brushSize.value + newValue, minBrushSize, maxBrushSize));
    });

    return { brush, strokes, brushSize, setBrushSize, addStroke, undoStroke };
}
