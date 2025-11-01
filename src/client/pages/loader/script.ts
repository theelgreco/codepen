const loaders = document.querySelectorAll(".loader");

loaders.forEach((loader) => {
    const loaderElement = loader as HTMLDivElement;

    const numHands = parseInt(loaderElement.dataset.numHands || "") || 20;
    const animationDuration = parseInt(loaderElement.dataset.animationDuration || "") || 600;

    for (let i = 0; i < numHands; i++) {
        const hand = document.createElement("span");
        hand.style.transform = `rotate(${(360 / numHands) * i}deg)`;
        hand.style.animationDuration = `${animationDuration}ms`;
        hand.style.animationDelay = `${(animationDuration / numHands) * i}ms`;
        hand.style.opacity = "0";
        loader.appendChild(hand);
    }

    loaderElement.style.setProperty("--loader-height", loaderElement.style.height || `${loaderElement.parentElement?.offsetHeight || 0}px`);
});
