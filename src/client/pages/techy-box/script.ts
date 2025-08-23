interface MenuElements {
    menu: HTMLDivElement;
    midPoint: number;
    menuItems: HTMLAnchorElement[];
    currentMenuItem: HTMLAnchorElement | undefined;
}

const menuElements: MenuElements = {
    menu: document.querySelector(".menu") as HTMLDivElement,
    get midPoint() {
        return Math.ceil(this.menuItems.length / 2);
    },
    get menuItems() {
        return Array.from(this.menu.children) as HTMLAnchorElement[];
    },
    get currentMenuItem() {
        return this.menuItems.find((el) => {
            return el.classList.contains("current");
        }) as HTMLAnchorElement;
    },
    set currentMenuItem(value: HTMLAnchorElement) {
        if (this.currentMenuItem) {
            this.currentMenuItem.classList.remove("current");
        }

        value.classList.add("current");
    },
};

window.addEventListener("DOMContentLoaded", () => {
    const { hash } = window.location;

    menuElements.currentMenuItem = menuElements.menuItems.find((el) => {
        return el.hash === hash;
    }) as HTMLAnchorElement;
});

window.addEventListener("hashchange", (ev) => {
    const { hash } = window.location;

    menuElements.currentMenuItem = menuElements.menuItems.find((el) => {
        return el.hash === hash;
    }) as HTMLAnchorElement;
});
