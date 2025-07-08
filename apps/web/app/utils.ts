export const HTTP_URL = 'http://localhost:3001';
export const WS_URL = 'ws://localhost:8080';

export type coordinatesType = {
    x: number;
    y: number;
}

export type differentShapeNameType = 'rect' | 'circle' | 'line'| 'draw' | 'drag' | 'text' | 'eraser' | 'select' | null;

export type shapesType = {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: 'circle';
    x: number;
    y: number;
    radX: number;
    radY: number;
} | {
    type: 'line';
    x: number;
    y: number;
    toX: number;
    toY: number;
} | {
    type: 'draw';
    x: number;
    y: number;
    allCoordinates: coordinatesType[];
} | {
    type: 'text';
    x: number;
    y: number;
    text: string;
}