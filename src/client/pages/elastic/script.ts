import { throttle } from "@/utils/debounce";

enum ScrollDirection {
    UP = -1,
    DOWN = 1,
}

const elastic = document.getElementById("elastic")!;

function drawSvg(height: number) {
    return `M 0 0 C 26 ${height} 34 ${height} 65 0`;
}

elastic.setAttribute("d", drawSvg(0));

const throttledSetAttr = throttle((e: WheelEvent) => {
    // @ts-ignore
    elastic.setAttribute("d", drawSvg(e.wheelDeltaY * 0.1));
}, 10);

document.addEventListener("wheel", throttledSetAttr);

document.addEventListener("scrollend", (e) => {
    console.log(e);
    elastic.setAttribute("d", drawSvg(0));
});
