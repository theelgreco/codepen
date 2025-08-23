const container = document.querySelector(".container") as HTMLDivElement;
const documentStyle = getComputedStyle(document.documentElement);

for (let i = 0; i < 2000; i++) {
    const div = document.createElement("div");
    div.classList.add("card");
    container.appendChild(div);
}

document.addEventListener("mousemove", (e) => {
    document.documentElement.style.setProperty("--x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--y", `${e.clientY}px`);
});
