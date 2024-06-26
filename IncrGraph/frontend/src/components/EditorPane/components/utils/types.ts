export interface Point {
    x: number;
    y: number;
}
export interface Node {
    width?: number | null | undefined;
    height?: number | null | undefined;
    positionAbsolute?: Point;
}