import { Debounce, throttle } from "@/utils/debounce";

const HTMLItems: HTMLDivElement[] = [];

const menu = document.querySelector(".menu") as HTMLDivElement;

const items = ["Home", "Contact", "About", "Links", "Resources"];
const itemHeight = 50;

const midwayIndex = Math.floor(items.length / 2);

const animationDelay = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue("--delay"));

function addElements() {
    menu.style.height = `${items.length * itemHeight}px`;
    menu.style.minHeight = `${items.length * itemHeight}px`;
    menu.style.maxHeight = `${items.length * itemHeight}px`;

    items.forEach((item) => {
        // Create Elements
        const div = document.createElement("div");
        const p = document.createElement("p");

        // Set div attributes
        div.classList.add("menu-item");
        div.style.height = itemHeight + "px";
        div.style.minHeight = itemHeight + "px";
        div.style.maxHeight = itemHeight + "px";

        // Set p attributes
        p.classList.add("text");
        p.textContent = item;

        // Add elements to DOM
        div.appendChild(p);
        menu.appendChild(div);

        // Add div to HTMLItems
        HTMLItems.push(div);
    });
}

function setPositions() {
    HTMLItems.forEach((item, index) => {
        if (index < midwayIndex) {
            const diff = midwayIndex - index;
            item.style.top = `calc(50% - ${diff * itemHeight}px)`;
            item.classList.remove("current");
        } else if (index === midwayIndex) {
            item.style.top = 50 + "%";
            item.classList.add("current");
        } else {
            const diff = index - midwayIndex;
            item.style.top = `calc(50% + ${diff * itemHeight}px)`;
            item.classList.remove("current");
        }
    });
}

function lastToFirst() {
    const removedItem = HTMLItems.pop() as HTMLDivElement;
    HTMLItems.unshift(removedItem);

    removedItem.style.opacity = "0";
    setTimeout(() => {
        removedItem.style.opacity = "1";
    }, animationDelay);

    setPositions();
}

function firstToLast() {
    const removedItem = HTMLItems.shift() as HTMLDivElement;
    HTMLItems.push(removedItem);

    removedItem.style.opacity = "0";
    setTimeout(() => {
        removedItem.style.opacity = "1";
    }, animationDelay);

    setPositions();
}

document.body.addEventListener("mousemove", (e) => {
    document.documentElement.style.setProperty("--x", e.clientX.toString() + "px");
    document.documentElement.style.setProperty("--y", e.clientY.toString() + "px");
});

const handleWheelScroll = throttle((e: WheelEvent) => {
    if (e.deltaY > 0) {
        lastToFirst();
    } else if (e.deltaY < 0) {
        firstToLast();
    }
}, animationDelay);

menu.addEventListener("wheel", handleWheelScroll);

menu.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX - menu.offsetLeft;
    const mouseY = e.clientY - menu.offsetTop;

    console.log({
        mouseX,
        mouseY,
    });
});

addElements();
setPositions();
