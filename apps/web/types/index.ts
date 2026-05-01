import { RefObject } from "react";
import {
	allToolsType,
	shapeGeometryType,
	shapesType,
} from "../zustandState/storeTypes";
import { currShapeBoundingBoxType } from "../app/components/drawCanvas";

export type EngineRefsArgumentType = {
	startXRef: RefObject<number>;
	startYRef: RefObject<number>;
	allShapesRef: RefObject<shapesType[]>;
	zoomRef: RefObject<number>;
	offsetXRef: RefObject<number>;
	offsetYRef: RefObject<number>;
	currentShapeBeingDrawnRef: RefObject<{
		position: {
			x: number;
			y: number;
		};
		geometry: shapeGeometryType;
	} | null>;
	currSelectedShapeRef: RefObject<currShapeBoundingBoxType | null>;
	isTextAreaActiveRef: RefObject<{
		isActive: boolean;
		position: {
			x: number;
			y: number;
		} | null;
	}>;
};

export type EngineActionsArgumentType = {
	addShapes: (newShape: shapesType) => void;
	setIsTextAreaActive: (toggle: boolean) => void;
	setTextAreaPosition: (worldX: number, worldY: number) => void;
	setTextAreaValue: (val: string) => void;
	changeZoom: (newZoom: number) => void;
	changeOffset: (newOffsetX: number, newOffsetY: number) => void;
};

export type EngineStateArgumentType = {
	canvas: HTMLCanvasElement;
	roomId: string | null;
	socket: WebSocket | undefined;
	currentTool: allToolsType;
};
