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
		position: CoordinatesType;
		geometry: shapeGeometryType;
	} | null>;
	currSelectedShapeRef: RefObject<currShapeBoundingBoxType | null>;
	isTextAreaActiveRef: RefObject<{
		isActive: boolean;
		position: CoordinatesType | null;
	}>;
};

export type EngineActionsArgumentType = {
	addShapes: (newShape: shapesType) => void;
	removeShape: (id: string) => void;
	repositionShape: (
		id: string,
		position: {
			x: number;
			y: number;
		},
	) => void;
	resizeShape: (
		id: string,
		geometry: shapeGeometryType,
		position?: CoordinatesType,
	) => void;
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

export type ShapeSpecificType = {
	position: CoordinatesType;
	geometry: shapeGeometryType;
};

export type CoordinatesType = {
	x: number;
	y: number;
};

export type EditingShapeInfoType = {
	id: string;
	shapeType: "rect" | "circle" | "text" | "line" | "draw" | null;
	cursorPosition: DetectBoundingBoxFnType;
	isMouseDown: boolean;
};

export type DetectBoundingBoxFnType =
	| {
			position: "inside";
	  }
	| {
			position: "edge";
			edgeNumber: number;
	  }
	| {
			position: "corner";
			cornerNumber: number;
	  }
	| {
			position: "none";
	  };