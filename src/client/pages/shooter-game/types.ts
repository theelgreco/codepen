import { DIRECTIONS, HEALTH_LEVELS } from "./constants";

export interface Position {
    x: number;
    y: number;
}

export interface Dimension {
    width: number;
    height: number;
}

export type HealthLevel = (typeof HEALTH_LEVELS)[keyof typeof HEALTH_LEVELS];

export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

export interface Corners {
    topLeft: Position;
    topRight: Position;
    bottomRight: Position;
    bottomLeft: Position;
}

export interface Key {
    name: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";
    pressed: boolean;
}
