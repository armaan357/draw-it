export type shapeGeometryType =
	| {
			type: "rect";
			width: number;
			height: number;
	  }
	| {
			type: "circle";
			radX: number;
			radY: number;
	  }
	| {
			type: "line";
			dX: number;
			dY: number;
	  }
	| {
			type: "draw";
			allCoordinates: { x: number; y: number }[];
	  }
	| {
			type: "text";
			text: string;
			width: number;
			height: number;
			fontSize: number;
	  };

export type shapesType = {
	id: string;
	zIndex?: number;
	position: {
		x: number;
		y: number;
	};
	geometry: shapeGeometryType;
	style: {
		fill: boolean;
		color: string;
		strokeWidth: number;
		opacity: number;
	};
	transform: {
		rotation: number;
		scaleX?: number;
		scaleY?: number;
	};
	metadata: {
		createdAt: number;
		updatedAt: number;
		createdBy: string;
	};
};

export interface currentShapesStateType {
	allShapes: shapesType[];
	past: shapesType[][];
	future: shapesType[][];
	addShapes: (newShape: shapesType) => void;
	removeShape: (id: string) => void;
	resizeShape: (id: string, geometry: shapeGeometryType) => void;
	repositionShape: (id: string, position: { x: number; y: number }) => void;
	undo: () => void;
	redo: () => void;
	commitHistory: (snapShot: shapesType[]) => void;
}

export type allToolsType =
	| "cursor"
	| "rect"
	| "circle"
	| "line"
	| "arrow"
	| "draw"
	| "drag"
	| "text"
	| "eraser"
	| "select"
	| "drag";

export interface currentToolStateType {
	currentTool: allToolsType;
	changeTool: (tool: allToolsType) => void;
}

export interface currentUIStateType {
	currentTool: allToolsType;
	zoom: number;
	offsetX: number;
	offSetY: number;
	changeTool: (tool: allToolsType) => void;
	changeZoom: (newZoom: number) => void;
	changeOffset: (newOffsetX: number, newOffsetY: number) => void;
}

export type appStoreType = currentUIStateType & currentShapesStateType;