import { RefObject } from "react";
import { coordinatesType } from "../utils";
import sendShapes from "./sendShapes";
import { currShapeBoundingBoxType, drawCanvas, render } from "./drawCanvas";
import {
	allToolsType,
	shapeGeometryType,
	shapesType,
} from "../../zustandState/storeTypes";
import { nanoid } from "nanoid";
import { toggleTextArea } from "../logic/toggleTextArea";

//remove all the draw function calls after fixing everything
export function canvasContext(
	canvas: HTMLCanvasElement,
	startX: RefObject<number>,
	startY: RefObject<number>,
	roomId: string | null,
	socket: WebSocket | undefined,
	currentTool: allToolsType,
	changeTool: (tool: allToolsType) => void,
	setIsTextAreaActive: (toggle: boolean) => void,
	setTextAreaPosition: (worldX: number, worldY: number) => void,
	allShapes: RefObject<shapesType[]>,
	addShapes: (newShape: shapesType) => void,
	zoomRef: RefObject<number>,
	offsetXRef: RefObject<number>,
	offsetYRef: RefObject<number>,
	changeZoom: (newZoom: number) => void,
	changeOffset: (newOffsetX: number, newOffsetY: number) => void,
	currentShapeRef: RefObject<{
		position: {
			x: number;
			y: number;
		};
		geometry: shapeGeometryType;
	} | null>,
	currSelectedShapeRef: RefObject<currShapeBoundingBoxType | null>,
	isTextAreaActive: RefObject<{
		isActive: boolean;
		position: { x: number; y: number } | null;
	}>,
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
	// drawCanvas(ctx, allShapes);
	render(
		ctx,
		canvas,
		allShapes.current,
		currentShapeRef,
		currSelectedShapeRef,
		zoomRef.current,
		offsetXRef.current,
		offsetYRef.current,
	);
	console.log(
		`In canvas context => clicked = ${clicked} & currentTool = ${currentTool}`,
	);

	let allCoordinates: coordinatesType[] = [];
	let text: string = "";

	function projectPointOnLine(
		p: coordinatesType,
		a: coordinatesType,
		b: coordinatesType,
	) {
		// 1. Get vectors AP and AB
		const ap = { x: p.x - a.x, y: p.y - a.y };
		const ab = { x: b.x - a.x, y: b.y - a.y };

		// 2. Calculate the squared length of AB
		const ab2 = ab.x * ab.x + ab.y * ab.y;

		// Safety check for zero-length line
		if (ab2 === 0) return { x: a.x, y: a.y };

		// 3. Calculate dot product of AP and AB
		const ap_dot_ab = ap.x * ab.x + ap.y * ab.y;

		// 4. Calculate the projection ratio 't'
		// t is the distance along the line from A to the projection point
		const t = ap_dot_ab / ab2;

		// 5. Return the point on the line at distance t
		return {
			x: a.x + t * ab.x,
			y: a.y + t * ab.y,
		};
	}

	const findShapes = (e: MouseEvent) => {
		console.log(`x coordinate = ${e.clientX}, y coordinate = ${e.clientY}`);
		console.log("total shapes = ", allShapes.current.length);
		let i = allShapes.current.length - 1

		for ( ; i >= 0; i--) {
			const tempShape = allShapes.current[i];
			const rect = canvas.getBoundingClientRect();

			const screenX = e.clientX - rect.left;
			const screenY = e.clientY - rect.top;
			const worldX = (screenX - offsetXRef.current) / zoomRef.current;
			const worldY = (screenY - offsetYRef.current) / zoomRef.current;
			if (!tempShape) {
				continue;
			}
			if (tempShape.geometry.type === "rect") {
				const isInXAxis =
					worldX >= tempShape.position.x! &&
					worldX <= tempShape.geometry.width! + tempShape.position.x;
				const isInYAxis =
					worldY >= tempShape.position.y! &&
					worldY <= tempShape.geometry.height! + tempShape.position.y;
				console.log(
					`isInXAxis = ${isInXAxis}, isInYAxis = ${isInYAxis}\nx = ${tempShape.position.x}, y = ${tempShape.position.y} and  endX = ${tempShape.geometry.width! + tempShape.position.x}, endY = ${tempShape.geometry.height! + tempShape.position.y}`,
				);
				if (isInXAxis && isInYAxis) {
					console.log(tempShape.id);
					console.log(tempShape);
					currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: "rect",
							width: tempShape.geometry.width,
							height: tempShape.geometry.height,
						},
					};
					render(
						ctx,
						canvas,
						allShapes.current,
						currentShapeRef,
						currSelectedShapeRef,
						zoomRef.current,
						offsetXRef.current,
						offsetYRef.current,
					);
					return;
				}
			} else if (tempShape.geometry.type === "circle") {
				//after implementing the rotation feature, the points x and y will need to be rotated by the angle of rotation in the opposite direction and then use them for calulation
				const semiMajorAxis =
					tempShape.geometry.radX >= tempShape.geometry.radY
						? tempShape.geometry.radX
						: tempShape.geometry.radY;
				const semiMinorAxis =
					tempShape.geometry.radX <= tempShape.geometry.radY
						? tempShape.geometry.radX
						: tempShape.geometry.radY;

				const isInXAxis =
					((worldX - tempShape.position.x) *
						(worldX - tempShape.position.x)) /
					(semiMajorAxis * semiMajorAxis);
				const isInYAxis =
					((worldY - tempShape.position.y) *
						(worldY - tempShape.position.y)) /
					(semiMinorAxis * semiMinorAxis);
				if (isInXAxis + isInYAxis < 1) {
					console.log(tempShape.id);
					console.log(tempShape);
					currSelectedShapeRef.current = {
						id: tempShape.id,
						position: {
							x: tempShape.position.x - tempShape.geometry.radX,
							y: tempShape.position.y - tempShape.geometry.radY,
						},
						geometry: {
							type: "circle",
							width: semiMajorAxis * 2,
							height: semiMinorAxis * 2,
						},
					};
					render(
						ctx,
						canvas,
						allShapes.current,
						currentShapeRef,
						currSelectedShapeRef,
						zoomRef.current,
						offsetXRef.current,
						offsetYRef.current,
					);
					return;
				}
			} else if (tempShape.geometry.type === "line") {
				const x1 = tempShape.position.x;
				const y1 = tempShape.position.y;
				const x2 = tempShape.geometry.dX + tempShape.position.x;
				const y2 = tempShape.geometry.dY + tempShape.position.y;

				const closestPoint = projectPointOnLine(
					{ x: worldX, y: worldY },
					{ x: x1, y: y1 },
					{ x: x2, y: y2 },
				);

				const distanceToPoint = Math.sqrt(
					(worldY - closestPoint.y) * (worldY - closestPoint.y) +
						(worldX - closestPoint.x) * (worldX - closestPoint.x),
				);

				if (distanceToPoint < 7) {
					console.log(tempShape.id);
					console.log(tempShape);
					currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: 'line',
							width: tempShape.geometry.dX,
							height: tempShape.geometry.dY,
						},
					};
					render(
						ctx,
						canvas,
						allShapes.current,
						currentShapeRef,
						currSelectedShapeRef,
						zoomRef.current,
						offsetXRef.current,
						offsetYRef.current,
					);
					return;
				}
			} 
			// else if(tempShape.geometry.type === "draw") {
			// 	let x1 = tempShape.position.x;
			// 	let y1 = tempShape.position.y;
			// 	for (let j = 0; j < tempShape.geometry.allCoordinates.length; j++) {
			// 	if(!tempShape.geometry.allCoordinates[j]) return;
			// 	if(j !== 0) {
			// 		x1 = tempShape.geometry.allCoordinates[j-1]?.x!;
			// 		y1 = tempShape.geometry.allCoordinates[j-1]?.y!;
			// 	}
			// 	let x2 = tempShape.geometry.allCoordinates[j]?.x;
			// 	let y2 = tempShape.geometry.allCoordinates[j]?.y;

			// 	let closestPoint = projectPointOnLine(
			// 		{ x: worldX, y: worldY },
			// 		{ x: x1, y: y1 },
			// 		{ x: x2!, y: y2! },
			// 	);

			// 	let distanceToPoint = Math.sqrt(
			// 		(worldY - closestPoint.y) * (worldY - closestPoint.y) +
			// 			(worldX - closestPoint.x) * (worldX - closestPoint.x),
			// 	);

			// 	if (distanceToPoint < 7) {
			// 		console.log(tempShape.id);
			// 		console.log(tempShape);
			// 		currSelectedShapeRef.current = {
			// 			id: tempShape.id,
			// 			position: tempShape.position,
			// 			geometry: {
			// 				width: tempShape.geometry.maxCoordinates.x - tempShape.geometry.minCoordinates.x,
			// 				height: tempShape.geometry.maxCoordinates.y - tempShape.geometry.minCoordinates.y,
			// 			},
			// 		};
			// 		render(
			// 			ctx,
			// 			canvas,
			// 			allShapes.current,
			// 			currentShapeRef,
			// 			currSelectedShapeRef,
			// 			zoomRef.current,
			// 			offsetXRef.current,
			// 			offsetYRef.current,
			// 		);
			// 		return;
			// 	}
			// }
			// }
			else if(tempShape.geometry.type === "text") {
				const isInXAxis =
					worldX >= tempShape.position.x - 6 &&
					worldX <= (tempShape.geometry.width + 12) + (tempShape.position.x - 6);
				const isInYAxis =
					worldY >= tempShape.position.y - 4 &&
					worldY <= (tempShape.geometry.height) + (tempShape.position.y - 4);
					if (isInXAxis && isInYAxis) {
					console.log(tempShape.id);
					console.log(tempShape);
					currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: "text",
							width: tempShape.geometry.width,
							height: tempShape.geometry.height,
						},
					};
					render(
						ctx,
						canvas,
						allShapes.current,
						currentShapeRef,
						currSelectedShapeRef,
						zoomRef.current,
						offsetXRef.current,
						offsetYRef.current,
					);
					return;
				}
			}
			else {
				currSelectedShapeRef.current = null;
				render(
					ctx,
					canvas,
					allShapes.current,
					currentShapeRef,
					currSelectedShapeRef,
					zoomRef.current,
					offsetXRef.current,
					offsetYRef.current,
				);
			}
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (currentTool == "cursor") {
			findShapes(e);
			// return;
		} else {
			clicked = true;
			startX.current = (e.clientX - offsetXRef.current) / zoomRef.current;
			startY.current = (e.clientY - offsetYRef.current) / zoomRef.current;
			if (currentTool == "text" && !(isTextAreaActive.current.isActive)) {
				toggleTextArea(
					true,
					setIsTextAreaActive,
					setTextAreaPosition,
					startX.current,
					startY.current,
				);
				console.log(`clientX = ${e.clientX}, clienTY = ${e.clientY}`);
				// document.addEventListener("keydown", writeText);
			}
			else if(currentTool == "text" && isTextAreaActive.current.isActive){
				const textMetrics = ctx.measureText("hello");
				console.log("input box width = ", textMetrics.width);
			}
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
		const rect = canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX = (screenX - offsetXRef.current) / zoomRef.current;
		const worldY = (screenY - offsetYRef.current) / zoomRef.current;

		if (currentTool === "rect") {
			const x = Math.min(startX.current, worldX);
			const y = Math.min(startY.current, worldY);
			const width = Math.abs(worldX - startX.current);
			const height = Math.abs(worldY - startY.current);

			shapeSpecificProps = {
				position: {
					x,
					y,
				},
				geometry: {
					type: "rect",
					width,
					height,
				},
			};
		} else if (currentTool === "circle") {
			const centerX = (startX.current + worldX) / 2;
			const centerY = (startY.current + worldY) / 2;
			const radX = Math.abs(centerX - worldX);
			const radY = Math.abs(centerY - worldY);

			shapeSpecificProps = {
				position: {
					x: centerX,
					y: centerY,
				},
				geometry: {
					type: "circle",
					radX,
					radY,
				},
			};
		} else if (currentTool == "line") {
			const dX = worldX - startX.current;
			const dY = worldY - startY.current;

			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "line",
					dX,
					dY,
				},
			};
		} else if (currentTool == "draw") {
			if(currentShapeRef.current?.geometry.type !== "draw")  return;
			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "draw",
					allCoordinates: allCoordinates,
					minCoordinates: currentShapeRef.current.geometry.minCoordinates,
					maxCoordinates: currentShapeRef.current.geometry.maxCoordinates,
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
		currentShapeRef.current = null;

		if (roomId) {
			// console.log('sending');
			sendShapes(socket!, shape!, roomId, userName!);
		}

		render(
			ctx,
			canvas,
			allShapes.current,
			currentShapeRef,
			currSelectedShapeRef,
			zoomRef.current,
			offsetXRef.current,
			offsetYRef.current,
		);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!clicked || currentTool === "cursor") {
			return;
		}

		canvas.addEventListener("keydown", (e) => {
			// console.log("key pressed = ", e.key);
		});

		const rect = canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX = (screenX - offsetXRef.current) / zoomRef.current;
		const worldY = (screenY - offsetYRef.current) / zoomRef.current;

		if (currentTool === "rect") {
			const x = Math.min(startX.current, worldX);
			const y = Math.min(startY.current, worldY);
			const width = Math.abs(worldX - startX.current);
			const height = Math.abs(worldY - startY.current);

			currentShapeRef.current = {
				position: {
					x,
					y,
				},
				geometry: {
					type: "rect",
					width,
					height,
				},
			};
		} else if (currentTool === "circle") {
			const centerX = (startX.current + worldX) / 2;
			const centerY = (startY.current + worldY) / 2;
			const radX = Math.abs(centerX - worldX);
			const radY = Math.abs(centerY - worldY);

			currentShapeRef.current = {
				position: {
					x: centerX,
					y: centerY,
				},
				geometry: {
					type: "circle",
					radX: radX,
					radY: radY,
				},
			};
		} else if (currentTool == "line") {
			const dX = worldX - startX.current;
			const dY = worldY - startY.current;

			currentShapeRef.current = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "line",
					dX,
					dY,
				},
			};
		} else if (currentTool == "draw") {
			allCoordinates.push({ x: worldX, y: worldY });

			currentShapeRef.current = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "draw",
					allCoordinates,
					minCoordinates: {
						x: Math.min(startX.current, worldX),
						y: Math.min(startY.current, worldY),
					},
					maxCoordinates: {
						x: Math.max(startX.current, worldX),
						y: Math.max(startX.current, worldY),
					}
				},
				
			};
		}
		render(
			ctx,
			canvas,
			allShapes.current,
			currentShapeRef,
			currSelectedShapeRef,
			zoomRef.current,
			offsetXRef.current,
			offsetYRef.current,
		);
		if (currentTool === "drag") {
			const startMousePos = {
				x: startX.current,
				y: startY.current,
			};

			const currMousePos = {
				x: worldX,
				y: worldY,
			};

			startX.current = worldX;
			startY.current = worldY;

			const diff = diffPoints(startMousePos, currMousePos);

			requestAnimationFrame(() => {
				const newTempOffset = addPoints(
					{ x: offsetXRef.current, y: offsetYRef.current },
					diff,
				);
				changeOffset(newTempOffset.x, newTempOffset.y);
			});
		}
	};

	const diffPoints = (
		p1: { x: number; y: number },
		p2: { x: number; y: number },
	) => {
		return { x: p2.x - p1.x, y: p2.y - p1.y };
	};

	const addPoints = (
		prevOffset: { x: number; y: number },
		diff: { x: number; y: number },
	) => {
		return { x: prevOffset.x + diff.x, y: prevOffset.y + diff.y };
	};

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		const zoom = zoomRef.current;
		const offsetX = offsetXRef.current;
		const offsetY = offsetYRef.current;

		const zoomIntensity = 0.001;
		const zoomFactor = Math.exp(-e.deltaY * zoomIntensity);

		const rect = canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX = (screenX - offsetX) / zoom;
		const worldY = (screenY - offsetY) / zoom;

		const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.05), 20);
		const newOffsetX = screenX - worldX * newZoom;
		const newOffsetY = screenY - worldY * newZoom;

		requestAnimationFrame(() => {
			changeZoom(newZoom);
			changeOffset(newOffsetX, newOffsetY);
		});
	};

	canvas.addEventListener("mousedown", handleMouseDown);

	canvas.addEventListener("mouseup", handleMouseUp);

	canvas.addEventListener("mousemove", handleMouseMove);

	canvas.addEventListener("wheel", handleWheel, { passive: false });

	return () => {
		canvas.removeEventListener("mousedown", handleMouseDown);
		canvas.removeEventListener("mousemove", handleMouseMove);
		canvas.removeEventListener("mouseup", handleMouseUp);
		canvas.removeEventListener("wheel", handleWheel);
	};
}

// const writeText = (e: KeyboardEvent) => {
// 	toggleTextArea(
// 		true,
// 		setIsTextAreaActive,
// 		setTextAreaPosition,
// 		startX.current,
// 		startY.current,
// 	);
// 	if (e.key == "Escape") {
// 		document.removeEventListener("keydown", writeText);
// 	}
// 	// if (e.key == "Escape") {
// 	// 	document.removeEventListener("keydown", writeText);
// 	// 	const shape: {
// 	// 		position: { x: number; y: number };
// 	// 		geometry: shapeGeometryType;
// 	// 	} = {
// 	// 		position: {
// 	// 			x: startX.current,
// 	// 			y: startY.current,
// 	// 		},
// 	// 		geometry: {
// 	// 			type: "text",
// 	// 			text: text,
// 	// 			//mock value for now
// 	// 			width: 200,
// 	// 			height: 30,
// 	// 			fontSize: 15,
// 	// 		},
// 	// 	};
// 	// 	const newText = {
// 	// 		id: nanoid(),
// 	// 		position: shape.position,
// 	// 		geometry: shape.geometry,
// 	// 		style: {
// 	// 			fill: true,
// 	// 			color: "white",
// 	// 			strokeWidth: 2,
// 	// 			opacity: 1,
// 	// 		},
// 	// 		transform: {
// 	// 			rotation: 0,
// 	// 			scaleX: 1,
// 	// 			scaleY: 2,
// 	// 		},
// 	// 		metadata: {
// 	// 			createdAt: Date.now(),
// 	// 			updatedAt: Date.now(),
// 	// 			createdBy: "User1",
// 	// 		},
// 	// 	};
// 	// 	addShapes(newText);
// 	// 	text = "";
// 	// 	changeTool("select");
// 	// 	return;
// 	// }
// 	// if (currentTool === "cursor") {
// 	// 	return;
// 	// } else if (currentTool == "text") {
// 	// 	render(
// 	// 		ctx,
// 	// 		canvas,
// 	// 		allShapes.current,
// 	// 		currentShapeRef,
// 	// 		currSelectedShapeRef,
// 	// 		zoomRef.current,
// 	// 		offsetXRef.current,
// 	// 		offsetYRef.current,
// 	// 	);
// 	// 	ctx.fillStyle = "white";
// 	// 	text += e.key;
// 	// 	ctx.fillText(`${text}`, startX.current, startY.current);
// 	// }
// };