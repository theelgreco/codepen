export class LoadingSpinner extends HTMLElement {
    size = 50;
    hands = 20;
    duration = 600;

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: "closed" });

        this.innerHTML = "";

        this.size = this.getAttribute("size") && parseInt(this.getAttribute("size")!) ? parseInt(this.getAttribute("size")!) : 0;
        this.hands = this.getAttribute("hands") && parseInt(this.getAttribute("hands")!) ? parseInt(this.getAttribute("hands")!) : 20;
        this.duration =
            this.getAttribute("duration") && parseInt(this.getAttribute("duration")!) ? parseInt(this.getAttribute("duration")!) : 600;

        const style = document.createElement("style");
        style.textContent = `
            :host {
                --loader-height: ${this.size || this.parentElement?.offsetHeight || 0}px;
                height: var(--loader-height);
                position: relative;
                aspect-ratio: 1;
                display: block;
            }

            span {
                --hand-height: calc(var(--loader-height) / 4);
                position: absolute;
                height: var(--hand-height);
                width: 1px;
                background-color: white;
                left: 50%;
                transform-origin: 50% calc(100% + var(--hand-height));
                animation-name: load;
                animation-iteration-count: infinite;
                animation-timing-function: ease-out;
                animation-fill-mode: both;
            }

            @keyframes load {
                1% {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;

        for (let i = 0; i < this.hands; i++) {
            const hand = document.createElement("span");
            hand.style.transform = `rotate(${(360 / this.hands) * i}deg)`;
            hand.style.animationDuration = `${this.duration}ms`;
            hand.style.animationDelay = `${(this.duration / this.hands) * i}ms`;
            hand.style.opacity = "0";
            shadowRoot.appendChild(hand);
        }

        shadowRoot.appendChild(style);
    }
}
