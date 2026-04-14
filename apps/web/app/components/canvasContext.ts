import { RefObject } from "react";
import { coordinatesType } from "../utils";
import sendShapes from "./sendShapes";
import { drawCanvas } from "./drawCanvas";
import {
	allToolsType,
	shapeGeometryType,
	shapesType,
} from "../../zustandState/storeTypes";
import { nanoid } from "nanoid";

export function canvasContext(
	canvas: HTMLCanvasElement,
	startX: RefObject<number>,
	startY: RefObject<number>,
	roomId: string | null,
	socket: WebSocket | undefined,
	currentTool: allToolsType,
	changeTool: (tool: allToolsType) => void,
	allShapes: shapesType[],
	addShapes: (newShape: shapesType) => void,
) {
	const ctx = canvas.getContext("2d");
	const userName: string | null = localStorage.getItem("userName")
		? localStorage.getItem("token")
		: null;

	if (!ctx) {
		return;
	}

	ctx.strokeStyle = "white";
	ctx.lineWidth = 1.5;
	ctx.letterSpacing = "2px";
	ctx.fontKerning = "normal";
	ctx.font = "16px cursive";
	let clicked = false;
	drawCanvas(ctx, allShapes, canvas);
	console.log(
		`In canvas context => clicked = ${clicked} & currentTool = ${currentTool}`,
	);

	let allCoordinates: coordinatesType[] = [];
	let text: string = "";

	const writeText = (e: KeyboardEvent) => {
		if (e.key == "Escape") {
			document.removeEventListener("keydown", writeText);
			const shape: {
				position: { x: number; y: number };
				geometry: shapeGeometryType;
			} = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "text",
					text: text,
					//mock value for now
					width: 200,
					height: 30,
					fontSize: 15,
				},
			};
			const newText = {
				id: nanoid(),
				position: shape.position,
				geometry: shape.geometry,
				style: {
					fill: true,
					color: "white",
					strokeWidth: 2,
					opacity: 1,
				},
				transform: {
					rotation: 0,
					scaleX: 1,
					scaleY: 2,
				},
				metadata: {
					createdAt: Date.now(),
					updatedAt: Date.now(),
					createdBy: "User1",
				},
			};
			addShapes(newText);
			text = "";
			changeTool("select");
			return;
		}
		if (currentTool === "cursor") {
			return;
		} else if (currentTool == "text") {
			drawCanvas(ctx, allShapes, canvas);
			ctx.fillStyle = "white";
			text += e.key;
			ctx.fillText(`${text}`, startX.current, startY.current);
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (currentTool == "cursor") {
			return;
		}
		clicked = true;
		startX.current = e.clientX;
		startY.current = e.clientY;
		if (currentTool == "select") {
			return;
		}
		if (currentTool == "text") {
			document.addEventListener("keydown", writeText);
		}
	};

	const handleMouseUp = (e: MouseEvent) => {
		if (!clicked || currentTool == "cursor") {
			return;
		}
		clicked = false;
		let shape:
			| {
					type: "rect";
					x: number;
					y: number;
					width: number;
					height: number;
			  }
			| {
					type: "circle";
					x: number;
					y: number;
					radX: number;
					radY: number;
			  }
			| {
					type: "line";
					x: number;
					y: number;
					toX: number;
					toY: number;
			  }
			| {
					type: "draw";
					x: number;
					y: number;
					allCoordinates: coordinatesType[];
			  }
			| {
					type: "text";
					x: number;
					y: number;
					text: string;
			  }
			| null = null;
		interface shapeSpecificType {
			position: {
				x: number;
				y: number;
			};
			geometry: shapeGeometryType;
		}
		let shapeSpecificProps: shapeSpecificType | null = null;

		if (currentTool === "rect") {
			let width = e.clientX - startX.current;
			let height = e.clientY - startY.current;

			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "rect",
					width: width,
					height: height,
				},
			};
		} else if (currentTool === "circle") {
			let centerX = (startX.current + e.clientX) / 2;
			let centerY = (startY.current + e.clientY) / 2;
			let radX = Math.abs(centerX - e.clientX);
			let radY = Math.abs(centerY - e.clientY);

			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "circle",
					radX: radX,
					radY: radY,
				},
			};
		} else if (currentTool == "line") {
			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "line",
					dX: e.clientX,
					dY: e.clientY,
				},
			};
		} else if (currentTool == "draw") {
			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "draw",
					allCoordinates: allCoordinates,
				},
			};
			allCoordinates = [];
		}

		if (!shapeSpecificProps) {
			return;
		}
		let genericShape = {
			id: nanoid(),
			position: shapeSpecificProps.position,
			geometry: shapeSpecificProps.geometry,
			style: {
				fill: true,
				color: "white",
				strokeWidth: 2,
				opacity: 1,
			},
			transform: {
				rotation: 0,
				scaleX: 1,
				scaleY: 2,
			},
			metadata: {
				createdAt: Date.now(),
				updatedAt: Date.now(),
				createdBy: "User1",
			},
		};
		addShapes(genericShape);

		if (roomId) {
			// console.log('sending');
			sendShapes(socket!, shape!, roomId, userName!);
		}
		drawCanvas(ctx, allShapes, canvas);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!clicked || currentTool === "cursor") {
			return;
		}

		canvas.addEventListener("keydown", (e) => {
			// console.log("key pressed = ", e.key);
		});
		console.log("current tool in canvasContext  = ", currentTool);

		if (currentTool === "rect") {
			let width = e.clientX - startX.current;
			let height = e.clientY - startY.current;
			drawCanvas(ctx, allShapes, canvas);
			ctx.beginPath();
			ctx.roundRect(
				startX.current,
				startY.current,
				width,
				height,
				Math.abs((width + height) / 50),
			);
			ctx.stroke();
		} else if (currentTool === "circle") {
			// console.log('circle');
			let centerX = (startX.current + e.clientX) / 2;
			let centerY = (startY.current + e.clientY) / 2;
			let radX = Math.abs(centerX - e.clientX);
			let radY = Math.abs(centerY - e.clientY);
			drawCanvas(ctx, allShapes, canvas);
			ctx.beginPath();
			ctx.ellipse(centerX, centerY, radX, radY, 0, 0, 2 * Math.PI, false);
			ctx.stroke();
		} else if (currentTool == "line") {
			// console.log('line');
			drawCanvas(ctx, allShapes, canvas);
			ctx.beginPath();
			ctx.lineJoin = "round";
			ctx.moveTo(startX.current, startY.current);
			ctx.lineTo(e.clientX, e.clientY);
			ctx.lineCap = "round";
			ctx.stroke();
		} else if (currentTool == "draw") {
			// console.log('draw');
			allCoordinates.push({ x: e.clientX, y: e.clientY });
			drawCanvas(ctx, allShapes, canvas);

			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(startX.current, startY.current);
			allCoordinates.map((a) => ctx.lineTo(a.x, a.y));
			ctx.stroke();
		}
	};

	canvas.addEventListener("mousedown", handleMouseDown);

	canvas.addEventListener("mouseup", handleMouseUp);

	canvas.addEventListener("mousemove", handleMouseMove);

	return () => {
		canvas.removeEventListener("mousedown", handleMouseDown);
		canvas.removeEventListener("mousemove", handleMouseMove);
		canvas.removeEventListener("mouseup", handleMouseUp);
	};
}
