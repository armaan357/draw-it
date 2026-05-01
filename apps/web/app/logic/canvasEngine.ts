import { RefObject } from "react";
import {
	allToolsType,
	shapeGeometryType,
	shapesType,
} from "../../zustandState/storeTypes";
import { currShapeBoundingBoxType, render } from "../components/drawCanvas";
import { coordinatesType } from "../utils";
import { toggleTextArea } from "./toggleTextArea";
import { nanoid } from "nanoid";
import sendShapes from "../components/sendShapes";
import {
	EngineActionsArgumentType,
	EngineRefsArgumentType,
	EngineStateArgumentType,
} from "../../types";

export class CanvasEngine {
	private state: EngineStateArgumentType;
	private refs: EngineRefsArgumentType;
	private actions: EngineActionsArgumentType;

	private clicked: boolean;
	private ctx: CanvasRenderingContext2D;
	private screenCoordinates: coordinatesType | null;
	private userName: string | null;
	private allCoordinates: coordinatesType[];

	//use these to prevent rAF stacking per-event during panning
	private pendingPanDelta: coordinatesType;
	private isPanningFrameScheduled: boolean;

	constructor(
		engineState: EngineStateArgumentType,
		engineRefs: EngineRefsArgumentType,
		engineActions: EngineActionsArgumentType,
	) {
		this.state = engineState;
		this.refs = engineRefs;
		this.actions = engineActions;
		this.ctx = this.state.canvas.getContext("2d")!;

		this.initMouseHandlers();

		this.clicked = false;
		this.allCoordinates = [];
		this.userName = localStorage.getItem("userName");
		this.screenCoordinates = null;
		this.pendingPanDelta = { x: 0, y: 0 };
		this.isPanningFrameScheduled = false;
	}

	initMouseHandlers() {
		this.state.canvas.addEventListener("mousedown", this.handleMouseDown);

		this.state.canvas.addEventListener("mouseup", this.handleMouseUp);

		this.state.canvas.addEventListener("mousemove", this.handleMouseMove);

		this.state.canvas.addEventListener("wheel", this.handleWheel, {
			passive: false,
		});
	}

	handleMouseDown = (e: MouseEvent) => {
		if (this.state.currentTool == "cursor") {
			this.findShapes(e);
		} else if (this.state.currentTool === "drag") {
			this.clicked = true;
			this.screenCoordinates = {
				x: e.clientX,
				y: e.clientY,
			};
		} else {
			// currSelectedShapeRef.current = null;
			console.log("canvasContext() text mouse down called.");
			this.clicked = true;
			this.refs.startXRef.current =
				(e.clientX - this.refs.offsetXRef.current) /
				this.refs.zoomRef.current;
			this.refs.startYRef.current =
				(e.clientY - this.refs.offsetYRef.current) /
				this.refs.zoomRef.current;
			if (
				this.state.currentTool == "text" &&
				!this.refs.isTextAreaActiveRef.current.isActive
			) {
				toggleTextArea(
					true,
					this.actions.setIsTextAreaActive,
					this.actions.setTextAreaPosition,
					this.refs.startXRef.current,
					this.refs.startYRef.current,
				);
			}
		}
	};

	handleMouseUp = (e: MouseEvent) => {
		if (!this.clicked || this.state.currentTool == "cursor") {
			return;
		}
		this.clicked = false;
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
		const rect = this.state.canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX =
			(screenX - this.refs.offsetXRef.current) /
			this.refs.zoomRef.current;
		const worldY =
			(screenY - this.refs.offsetYRef.current) /
			this.refs.zoomRef.current;

		if (this.state.currentTool === "rect") {
			const x = Math.min(this.refs.startXRef.current, worldX);
			const y = Math.min(this.refs.startYRef.current, worldY);
			const width = Math.abs(worldX - this.refs.startXRef.current);
			const height = Math.abs(worldY - this.refs.startYRef.current);

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
		} else if (this.state.currentTool === "circle") {
			const centerX = (this.refs.startXRef.current + worldX) / 2;
			const centerY = (this.refs.startYRef.current + worldY) / 2;
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
		} else if (this.state.currentTool == "line") {
			const dX = worldX - this.refs.startXRef.current;
			const dY = worldY - this.refs.startYRef.current;

			shapeSpecificProps = {
				position: {
					x: this.refs.startXRef.current,
					y: this.refs.startYRef.current,
				},
				geometry: {
					type: "line",
					dX,
					dY,
				},
			};
		} else if (this.state.currentTool == "draw") {
			if (
				this.refs.currentShapeBeingDrawnRef.current?.geometry.type !==
				"draw"
			)
				return;
			shapeSpecificProps = {
				position: {
					x: this.refs.startXRef.current,
					y: this.refs.startYRef.current,
				},
				geometry: {
					type: "draw",
					allCoordinates: this.allCoordinates,
					minCoordinates:
						this.refs.currentShapeBeingDrawnRef.current.geometry
							.minCoordinates,
					maxCoordinates:
						this.refs.currentShapeBeingDrawnRef.current.geometry
							.maxCoordinates,
				},
			};
			this.allCoordinates = [];
		} else if (this.state.currentTool === "drag") {
			this.screenCoordinates = null;
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
		this.actions.addShapes(genericShape);
		this.refs.currentShapeBeingDrawnRef.current = null;

		if (this.state.roomId) {
			// console.log('sending');
			sendShapes(
				this.state.socket!,
				shape!,
				this.state.roomId,
				this.userName!,
			);
		}

		render(
			this.ctx,
			this.state.canvas,
			this.refs.allShapesRef.current,
			this.refs.currentShapeBeingDrawnRef,
			this.refs.currSelectedShapeRef,
			this.refs.zoomRef.current,
			this.refs.offsetXRef.current,
			this.refs.offsetYRef.current,
		);
	};

	handleMouseMove = (e: MouseEvent) => {
		if (!this.clicked || this.state.currentTool === "cursor") {
			return;
		}

		this.state.canvas.addEventListener("keydown", (e) => {
			// console.log("key pressed = ", e.key);
		});

		const rect = this.state.canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX =
			(screenX - this.refs.offsetXRef.current) /
			this.refs.zoomRef.current;
		const worldY =
			(screenY - this.refs.offsetYRef.current) /
			this.refs.zoomRef.current;

		if (this.state.currentTool === "rect") {
			const x = Math.min(this.refs.startXRef.current, worldX);
			const y = Math.min(this.refs.startYRef.current, worldY);
			const width = Math.abs(worldX - this.refs.startXRef.current);
			const height = Math.abs(worldY - this.refs.startYRef.current);

			this.refs.currentShapeBeingDrawnRef.current = {
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
		} else if (this.state.currentTool === "circle") {
			const centerX = (this.refs.startXRef.current + worldX) / 2;
			const centerY = (this.refs.startYRef.current + worldY) / 2;
			const radX = Math.abs(centerX - worldX);
			const radY = Math.abs(centerY - worldY);

			this.refs.currentShapeBeingDrawnRef.current = {
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
		} else if (this.state.currentTool == "line") {
			const dX = worldX - this.refs.startXRef.current;
			const dY = worldY - this.refs.startYRef.current;

			this.refs.currentShapeBeingDrawnRef.current = {
				position: {
					x: this.refs.startXRef.current,
					y: this.refs.startYRef.current,
				},
				geometry: {
					type: "line",
					dX,
					dY,
				},
			};
		} else if (this.state.currentTool == "draw") {
			this.allCoordinates.push({ x: worldX, y: worldY });

			this.refs.currentShapeBeingDrawnRef.current = {
				position: {
					x: this.refs.startXRef.current,
					y: this.refs.startYRef.current,
				},
				geometry: {
					type: "draw",
					allCoordinates: this.allCoordinates,
					minCoordinates: {
						x: Math.min(this.refs.startXRef.current, worldX),
						y: Math.min(this.refs.startYRef.current, worldY),
					},
					maxCoordinates: {
						x: Math.max(this.refs.startXRef.current, worldX),
						y: Math.max(this.refs.startXRef.current, worldY),
					},
				},
			};
		}
		render(
			this.ctx,
			this.state.canvas,
			this.refs.allShapesRef.current,
			this.refs.currentShapeBeingDrawnRef,
			this.refs.currSelectedShapeRef,
			this.refs.zoomRef.current,
			this.refs.offsetXRef.current,
			this.refs.offsetYRef.current,
		);
		if (this.state.currentTool === "drag") {
			const rect = this.state.canvas.getBoundingClientRect();
			if (!this.screenCoordinates) {
				return;
			}
			const startMousePos = {
				x: this.screenCoordinates.x - rect.left,
				y: this.screenCoordinates.y - rect.top,
			};

			const currMousePos = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};

			this.screenCoordinates = currMousePos;

			const diff = this.diffPoints(startMousePos, currMousePos);

			// if (Math.abs(diff.x) < 0.1) {
			// 	return;
			// }

			requestAnimationFrame(() => {
				const newTempOffset = this.addPoints(
					{
						x: this.refs.offsetXRef.current,
						y: this.refs.offsetYRef.current,
					},
					diff,
				);
				this.actions.changeOffset(newTempOffset.x, newTempOffset.y);
			});
		}
	};

	handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		const zoom = this.refs.zoomRef.current;
		const offsetX = this.refs.offsetXRef.current;
		const offsetY = this.refs.offsetYRef.current;

		const zoomIntensity = 0.001;
		const zoomFactor = Math.exp(-e.deltaY * zoomIntensity);

		const rect = this.state.canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX = (screenX - offsetX) / zoom;
		const worldY = (screenY - offsetY) / zoom;

		const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.05), 20);
		const newOffsetX = screenX - worldX * newZoom;
		const newOffsetY = screenY - worldY * newZoom;

		requestAnimationFrame(() => {
			this.actions.changeZoom(newZoom);
			this.actions.changeOffset(newOffsetX, newOffsetY);
		});
	};

	diffPoints = (
		p1: { x: number; y: number },
		p2: { x: number; y: number },
	) => {
		return { x: p2.x - p1.x, y: p2.y - p1.y };
	};

	addPoints = (
		prevOffset: { x: number; y: number },
		diff: { x: number; y: number },
	) => {
		return {
			x: prevOffset.x + diff.x * 0.65,
			y: prevOffset.y + diff.y * 0.65,
		};
	};

	projectPointOnLine = (
		p: coordinatesType,
		a: coordinatesType,
		b: coordinatesType,
	) => {
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
	};

	findShapes = (e: MouseEvent) => {
		console.log(`x coordinate = ${e.clientX}, y coordinate = ${e.clientY}`);
		console.log("total shapes = ", this.refs.allShapesRef.current.length);
		let i = this.refs.allShapesRef.current.length - 1;

		for (; i >= 0; i--) {
			const tempShape = this.refs.allShapesRef.current[i];
			const rect = this.state.canvas.getBoundingClientRect();

			const screenX = e.clientX - rect.left;
			const screenY = e.clientY - rect.top;
			const worldX =
				(screenX - this.refs.offsetXRef.current) /
				this.refs.zoomRef.current;
			const worldY =
				(screenY - this.refs.offsetYRef.current) /
				this.refs.zoomRef.current;
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
					this.refs.currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: "rect",
							width: tempShape.geometry.width,
							height: tempShape.geometry.height,
						},
					};
					render(
						this.ctx,
						this.state.canvas,
						this.refs.allShapesRef.current,
						this.refs.currentShapeBeingDrawnRef,
						this.refs.currSelectedShapeRef,
						this.refs.zoomRef.current,
						this.refs.offsetXRef.current,
						this.refs.offsetYRef.current,
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
					this.refs.currSelectedShapeRef.current = {
						id: tempShape.id,
						position: {
							x: tempShape.position.x - tempShape.geometry.radX,
							y: tempShape.position.y - tempShape.geometry.radY,
						},
						geometry: {
							type: "circle",
							width: tempShape.geometry.radX * 2,
							height: tempShape.geometry.radY * 2,
						},
					};
					render(
						this.ctx,
						this.state.canvas,
						this.refs.allShapesRef.current,
						this.refs.currentShapeBeingDrawnRef,
						this.refs.currSelectedShapeRef,
						this.refs.zoomRef.current,
						this.refs.offsetXRef.current,
						this.refs.offsetYRef.current,
					);
					return;
				}
			} else if (tempShape.geometry.type === "line") {
				const x1 = tempShape.position.x;
				const y1 = tempShape.position.y;
				const x2 = tempShape.geometry.dX + tempShape.position.x;
				const y2 = tempShape.geometry.dY + tempShape.position.y;

				const closestPoint = this.projectPointOnLine(
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
					this.refs.currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: "line",
							width: tempShape.geometry.dX,
							height: tempShape.geometry.dY,
						},
					};
					render(
						this.ctx,
						this.state.canvas,
						this.refs.allShapesRef.current,
						this.refs.currentShapeBeingDrawnRef,
						this.refs.currSelectedShapeRef,
						this.refs.zoomRef.current,
						this.refs.offsetXRef.current,
						this.refs.offsetYRef.current,
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
			// 		this.currSelectedShapeRef.current = {
			// 			id: tempShape.id,
			// 			position: tempShape.position,
			// 			geometry: {
			// 				width: tempShape.geometry.maxCoordinates.x - tempShape.geometry.minCoordinates.x,
			// 				height: tempShape.geometry.maxCoordinates.y - tempShape.geometry.minCoordinates.y,
			// 			},
			// 		};
			// render(
			//     this.ctx,
			//     this.state.canvas,
			//     this.refs.allShapesRef.current,
			//     this.refs.currentShapeBeingDrawnRef,
			//     this.refs.currSelectedShapeRef,
			//     this.refs.zoomRef.current,
			//     this.refs.offsetXRef.current,
			//     this.refs.offsetYRef.current,
			// );
			// 		return;
			// 	}
			// }
			// }
			else if (tempShape.geometry.type === "text") {
				const isInXAxis =
					worldX >= tempShape.position.x - 6 &&
					worldX <=
						tempShape.geometry.width +
							12 +
							(tempShape.position.x - 6);
				const isInYAxis =
					worldY >= tempShape.position.y - 4 &&
					worldY <=
						tempShape.geometry.height + (tempShape.position.y - 4);
				if (isInXAxis && isInYAxis) {
					console.log(tempShape.id);
					console.log(tempShape);
					this.refs.currSelectedShapeRef.current = {
						id: tempShape.id,
						position: {
							x: tempShape.position.x - 6,
							y: tempShape.position.y - 4,
						},
						geometry: {
							type: "text",
							width: tempShape.geometry.width + 12,
							height: tempShape.geometry.height,
						},
					};
					render(
						this.ctx,
						this.state.canvas,
						this.refs.allShapesRef.current,
						this.refs.currentShapeBeingDrawnRef,
						this.refs.currSelectedShapeRef,
						this.refs.zoomRef.current,
						this.refs.offsetXRef.current,
						this.refs.offsetYRef.current,
					);
					this.actions.setTextAreaValue(tempShape.geometry.text);
					toggleTextArea(
						true,
						this.actions.setIsTextAreaActive,
						this.actions.setTextAreaPosition,
						tempShape.position.x,
						tempShape.position.y,
					);
					return;
				}
			} else {
				this.refs.currSelectedShapeRef.current = null;
				render(
					this.ctx,
					this.state.canvas,
					this.refs.allShapesRef.current,
					this.refs.currentShapeBeingDrawnRef,
					this.refs.currSelectedShapeRef,
					this.refs.zoomRef.current,
					this.refs.offsetXRef.current,
					this.refs.offsetYRef.current,
				);
			}
		}
	};

	destroy() {
		this.state.canvas.removeEventListener(
			"mousedown",
			this.handleMouseDown,
		);
		this.state.canvas.removeEventListener(
			"mousemove",
			this.handleMouseMove,
		);
		this.state.canvas.removeEventListener("mouseup", this.handleMouseUp);
		this.state.canvas.removeEventListener("wheel", this.handleWheel);
	}
}
