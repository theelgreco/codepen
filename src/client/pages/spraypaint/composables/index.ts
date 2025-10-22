import { debounce } from "lodash";
import { onMounted, onUnmounted, ref } from "vue";

export function useMouseWheel() {
    const isScrolling = ref(false);
    const deltaY = ref(0);

    const onWheelStop = debounce(() => {
        isScrolling.value = false;
        deltaY.value = 0;
    });

    function handlewheel(e: WheelEvent) {
        deltaY.value = e.deltaY;
        isScrolling.value = true;
        onWheelStop();
    }

    onMounted(() => {
        window.addEventListener("wheel", handlewheel);
    });

    onUnmounted(() => {
        window.removeEventListener("wheel", handlewheel);
    });

    return { isScrolling, deltaY };
}
