const numHands = 20;
const animationDuration = 600;
const loader = document.getElementById("loader") as HTMLDivElement;

for (let i = 0; i < numHands; i++) {
    const hand = document.createElement("span");
    hand.style.transform = `rotate(${(360 / numHands) * i}deg)`;
    hand.style.animationDuration = `${animationDuration}ms`;
    hand.style.animationDelay = `${(animationDuration / numHands) * i}ms`;
    loader.appendChild(hand);
}
