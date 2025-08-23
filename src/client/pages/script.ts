async function getDirs(): Promise<string[]> {
    const response = await fetch("/api/directories");
    return await response.json();
}

async function addDirectoryElements() {
    const dirs = await getDirs();
    const container: HTMLDivElement = document.querySelector(".directories") as HTMLDivElement;

    if (dirs.length) {
        dirs.forEach((dir) => {
            const a: HTMLAnchorElement = document.createElement("a");
            a.href = dir;
            a.className = "directory";
            a.textContent = dir;
            container.appendChild(a);
        });
    } else {
        const div = document.createElement("div");
        div.className = "no-directories";

        const title = document.createElement("h2");
        title.textContent = "You have not added any pages yet";

        const subtitle = document.createElement("p");
        subtitle.textContent = "Run 'npm run add-page <page-name>' to get started";

        div.appendChild(title);
        div.appendChild(subtitle);
        container.appendChild(div);
    }
}

addDirectoryElements();
