const loaders = document.querySelectorAll(".loader");

loaders.forEach((loader) => {
    const numHands = parseInt((loader as HTMLDivElement).dataset.numHands || "") || 20;
    const animationDuration = parseInt((loader as HTMLDivElement).dataset.animationDuration || "") || 600;

    for (let i = 0; i < numHands; i++) {
        const hand = document.createElement("span");
        hand.style.transform = `rotate(${(360 / numHands) * i}deg)`;
        hand.style.animationDuration = `${animationDuration}ms`;
        hand.style.animationDelay = `${(animationDuration / numHands) * i}ms`;
        loader.appendChild(hand);
    }
});
