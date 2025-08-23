import { test, expect, describe } from "vitest";
import { parse } from "../utils/parse";

describe("Tests parsing", () => {
    test("Parses simple HTML string", () => {
        const htmlString = `<div>{{myString}}</div>`;
        expect(parse(htmlString)).toBe();
    });
});
