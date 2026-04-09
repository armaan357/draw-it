export type shapesType = {
	id: string;
	type: "rect" | "circle" | "line" | "draw" | "text";
	zIndex: number;
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

type shapeGeometryType =
	| {
			width: number;
			height: number;
	  }
	| {
			radX: number;
			radY: number;
	  }
	| {
			dX: number;
			dY: number;
	  }
	| {
			allCoordinates: { x: number; y: number }[];
	  }
	| {
			text: string;
			width: number;
			height: number;
			fontSize: number;
	  };

type allToolsType =
	| "cursor"
	| "rect"
	| "circle"
	| "line"
	| "draw"
	| "drag"
	| "text"
	| "eraser"
	| "select";

export interface currentToolState {
	currentTool: allToolsType;
	changeTool: (tool: allToolsType) => void;
}

export type appStoreType = currentToolState;
