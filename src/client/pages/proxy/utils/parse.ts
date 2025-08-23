const OPENING_TOKEN = "<";
const CLOSING_TOKEN = ">";

type StelementTypes = "div" | "p" | "body";

class Stelement {
    type: StelementTypes;
    text: string = "";
    children: Stelement[] = [];

    constructor(type: StelementTypes) {
        this.type = type;
    }

    get hasChildren() {
        return this.children.length;
    }

    addChild(newChild: Stelement) {
        this.children.push(newChild);
    }
}

interface DOM {
    elements: [];
}

export function parse(html: string) {
    const obj = {};
}
