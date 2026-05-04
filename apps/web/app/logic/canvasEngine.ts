import { render } from "../components/drawCanvas";
import { toggleTextArea } from "./toggleTextArea";
import { nanoid } from "nanoid";
import sendShapes from "../components/sendShapes";
import {
	CoordinatesType,
	DetectBoundingBoxFnType,
	EditingShapeInfoType,
	EngineActionsArgumentType,
	EngineRefsArgumentType,
	EngineStateArgumentType,
	ShapeSpecificType,
} from "../../types";
import { shapeGeometryType } from "../../zustandState/storeTypes";

export class CanvasEngine {
	private state: EngineStateArgumentType;
	private refs: EngineRefsArgumentType;
	private actions: EngineActionsArgumentType;

	private userAction: "edit" | "create" | "drag" | null;
	private ctx: CanvasRenderingContext2D;
	private screenCoordinates: CoordinatesType | null;
	private userName: string | null;
	private allCoordinates: CoordinatesType[];
	private editingShapeInfo: EditingShapeInfoType;

	//use these to prevent rAF from stacking per-event during panning
	private pendingPanDelta: CoordinatesType;
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

		this.userAction = null;
		this.allCoordinates = [];
		this.userName = localStorage.getItem("userName");
		this.screenCoordinates = null;
		this.pendingPanDelta = { x: 0, y: 0 };
		this.isPanningFrameScheduled = false;
		this.editingShapeInfo = {
			id: "",
			shapeType: null,
			isMouseDown: false,
			cursorPosition: { position: "none" },
		};
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
		if (this.state.currentTool === "drag") {
			this.userAction = "drag";
			this.screenCoordinates = {
				x: e.clientX,
				y: e.clientY,
			};
		}

		this.refs.startXRef.current =
			(e.clientX - this.refs.offsetXRef.current) /
			this.refs.zoomRef.current;
		this.refs.startYRef.current =
			(e.clientY - this.refs.offsetYRef.current) /
			this.refs.zoomRef.current;

		if (this.state.currentTool == "cursor") {
			this.findShapes(e);
		} else {
			// currSelectedShapeRef.current = null;
			// console.log("canvasContext() text mouse down called.");
			this.userAction = "create";
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
		if (this.userAction === null) {
			return;
		} else if (
			this.userAction === "edit" ||
			this.state.currentTool == "cursor"
		) {
			console.log(
				"editing shape info in mouse up = ",
				this.editingShapeInfo,
			);
			if (this.editingShapeInfo.isMouseDown) {
				this.editingShapeInfo.isMouseDown = false;
			}
			return;
		} else if (
			this.userAction === "drag" &&
			this.state.currentTool === "drag"
		) {
			this.userAction = null;
			this.screenCoordinates = null;
			return;
		}
		this.userAction = null;
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
					allCoordinates: CoordinatesType[];
			  }
			| {
					type: "text";
					x: number;
					y: number;
					text: string;
			  }
			| null = null;

		let shapeSpecificProps: ShapeSpecificType | null = null;
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
		if (this.userAction === null) {
			return;
		}

		if (this.userAction === "drag" && this.state.currentTool === "drag") {
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

		const rect = this.state.canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX =
			(screenX - this.refs.offsetXRef.current) /
			this.refs.zoomRef.current;
		const worldY =
			(screenY - this.refs.offsetYRef.current) /
			this.refs.zoomRef.current;

		if (this.userAction === "edit" || this.state.currentTool === "cursor") {
			// console.log(
			// 	"editing shape info in mouse move = ",
			// 	this.editingShapeInfo,
			// );
			if (
				this.refs.currSelectedShapeRef.current &&
				!this.editingShapeInfo.isMouseDown
			) {
				//design a new fn which works like tldraw hover
				this.detectBoundingBox(e);
			} else if (
				this.refs.currSelectedShapeRef.current &&
				this.editingShapeInfo.isMouseDown
			) {
				this.handleShapeEdits(worldX, worldY);
			}
		}

		if (this.userAction !== "create") {
			return;
		}

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
	};

	handleShapeEdits = (worldX: number, worldY: number) => {
		console.log("handleShapeEdits called");
		if (
			this.editingShapeInfo.cursorPosition.position === "inside" &&
			this.refs.currSelectedShapeRef.current
		) {
			console.log("inside the shape");
			const diff = this.diffPoints(
				{
					x: this.refs.startXRef.current,
					y: this.refs.startYRef.current,
				},
				{ x: worldX, y: worldY },
			);
			const newStartPosition = {
				x: this.refs.currSelectedShapeRef.current.position.x + diff.x,
				y: this.refs.currSelectedShapeRef.current.position.y + diff.y,
			};
			requestAnimationFrame(() => {
				if (!this.refs.currSelectedShapeRef.current) {
					return;
				}
				console.log("repositioning shape");
				this.actions.repositionShape(
					this.refs.currSelectedShapeRef.current.id,
					newStartPosition,
				);
			});
		} else if (
			this.editingShapeInfo.cursorPosition.position === "corner" &&
			this.refs.currSelectedShapeRef.current
		) {
			if (this.editingShapeInfo.cursorPosition.cornerNumber === 0) {
				console.log("inside the corner 0 if block");

				const fixedX =
					this.refs.currSelectedShapeRef.current.geometry.width +
					this.refs.currSelectedShapeRef.current.position.x;
				const fixedY =
					this.refs.currSelectedShapeRef.current.geometry.height +
					this.refs.currSelectedShapeRef.current.position.y;
				if (this.editingShapeInfo.shapeType == null) {
					return;
				}

				this.handleShapeResize(
					this.editingShapeInfo.shapeType,
					fixedX - worldX,
					fixedY - worldY,
					{ x: worldX, y: worldY },
				);
			} else if (
				this.editingShapeInfo.cursorPosition.cornerNumber === 1
			) {
				console.log("inside the corner 1 if block");
				if (this.editingShapeInfo.shapeType === "line") {
					const fixedX =
						this.refs.currSelectedShapeRef.current.position.x;
					const fixedY =
						this.refs.currSelectedShapeRef.current.position.y;
					if (this.editingShapeInfo.shapeType == null) {
						return;
					}

					this.handleShapeResize(
						this.editingShapeInfo.shapeType,
						worldX - fixedX,
						worldY - fixedY,
						{ x: fixedX, y: fixedY },
					);
				} else {
					const fixedX =
						this.refs.currSelectedShapeRef.current.position.x;
					const fixedY =
						this.refs.currSelectedShapeRef.current.geometry.height +
						this.refs.currSelectedShapeRef.current.position.y;

					if (this.editingShapeInfo.shapeType == null) {
						return;
					}

					this.handleShapeResize(
						this.editingShapeInfo.shapeType,
						worldX - fixedX,
						fixedY - worldY,
						{
							x: this.refs.currSelectedShapeRef.current.position
								.x,
							y: worldY,
						},
					);
				}
			} else if (
				this.editingShapeInfo.cursorPosition.cornerNumber === 2
			) {
				console.log("inside the corner 2 if block");

				const fixedX =
					this.refs.currSelectedShapeRef.current.geometry.width +
					this.refs.currSelectedShapeRef.current.position.x;
				const fixedY =
					this.refs.currSelectedShapeRef.current.position.y;
				if (this.editingShapeInfo.shapeType == null) {
					return;
				}

				this.handleShapeResize(
					this.editingShapeInfo.shapeType,
					fixedX - worldX,
					worldY - fixedY,
					{
						x: worldX,
						y: this.refs.currSelectedShapeRef.current.position.y,
					},
				);
			} else {
				console.log("inside the corner 3 if block");
				const endXPos =
					this.refs.currSelectedShapeRef.current.position.x +
					this.refs.currSelectedShapeRef.current.geometry.width;
				const endYPos =
					this.refs.currSelectedShapeRef.current.position.y +
					this.refs.currSelectedShapeRef.current.geometry.height;

				const diff = this.diffPoints(
					{ x: endXPos, y: endYPos },
					{ x: worldX, y: worldY },
				);
				if (this.editingShapeInfo.shapeType == null) {
					return;
				}

				this.handleShapeResize(
					this.editingShapeInfo.shapeType,
					this.refs.currSelectedShapeRef.current.geometry.width +
						diff.x,
					this.refs.currSelectedShapeRef.current.geometry.height +
						diff.y,
					this.refs.currSelectedShapeRef.current.position,
				);
			}
		}
	};

	handleShapeResize = (
		shapeType: "rect" | "circle" | "line" | "draw" | "text",
		width: number,
		height: number,
		position: CoordinatesType,
	) => {
		let newGeometry: shapeGeometryType;
		let newPosition: CoordinatesType = position;
		if (shapeType === "rect") {
			// if (width < 0) {
			// 	position.x += width;
			// 	width = Math.abs(width);
			// }
			// if (height < 0) {
			// 	position.y += height;
			// 	height = Math.abs(height);
			// }
			newGeometry = {
				type: "rect",
				width: width,
				height: height,
			};
			// newPosition = position;
		} else if (shapeType === "circle") {
			console.log("corner three of circle");
			newGeometry = {
				type: "circle",
				radX: width / 2,
				radY: height / 2,
			};
			newPosition = {
				x: (position.x * 2 + width) / 2,
				y: (position.y * 2 + height) / 2,
			};
		} else if (shapeType === "line") {
			console.log("corner three of circle");
			newGeometry = {
				type: "line",
				dX: width,
				dY: height,
			};
			// newPosition = position;
		}
		requestAnimationFrame(() => {
			if (!this.refs.currSelectedShapeRef.current) {
				return;
			}
			console.log("resizing shape");
			this.actions.resizeShape(
				this.refs.currSelectedShapeRef.current.id,
				newGeometry,
				newPosition,
			);
		});
	};

	handleZoom = (e: WheelEvent) => {
		const zoom = this.refs.zoomRef.current;
		const offsetX = this.refs.offsetXRef.current;
		const offsetY = this.refs.offsetYRef.current;

		const zoomIntensity = 0.0065;
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

	handleOffset = (e: WheelEvent) => {
		const rect = this.state.canvas.getBoundingClientRect();
		if (!this.screenCoordinates) {
			return;
		}
		const startMousePos = {
			x: this.screenCoordinates.x - rect.left,
			y: this.screenCoordinates.y - rect.top,
		};

		const currMousePos = {
			x: e.clientX - rect.left - e.deltaX,
			y: e.clientY - rect.top - e.deltaY,
		};

		this.screenCoordinates = currMousePos;

		const diff = this.diffPoints(startMousePos, currMousePos);

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
	};

	handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		if (e.deltaX === -0 && !Number.isInteger(e.deltaY)) {
			this.handleZoom(e);
		} else {
			this.screenCoordinates = {
				x: e.clientX,
				y: e.clientY,
			};
			this.handleOffset(e);
		}
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
		p: CoordinatesType,
		a: CoordinatesType,
		b: CoordinatesType,
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

	detectBoundingBox = (e: MouseEvent): DetectBoundingBoxFnType => {
		if (!this.refs.currSelectedShapeRef.current) {
			return { position: "none" };
		}
		const rect = this.state.canvas.getBoundingClientRect();

		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const worldX =
			(screenX - this.refs.offsetXRef.current) /
			this.refs.zoomRef.current;
		const worldY =
			(screenY - this.refs.offsetYRef.current) /
			this.refs.zoomRef.current;

		const startXPos = this.refs.currSelectedShapeRef.current.position.x;
		const endXPos =
			this.refs.currSelectedShapeRef.current.geometry.width! +
			this.refs.currSelectedShapeRef.current.position.x;

		const startYPos = this.refs.currSelectedShapeRef.current.position.y;
		const endYPos =
			this.refs.currSelectedShapeRef.current.geometry.height! +
			this.refs.currSelectedShapeRef.current.position.y;

		const { isInsideCorner, cornerIndex } = this.detectBoundingBoxCorners(
			worldX,
			worldY,
			this.refs.currSelectedShapeRef.current.allCorners,
		);

		if (isInsideCorner) {
			console.log("cursor is inside corner");
			console.log("corner index = ", cornerIndex);
			this.state.canvas.style.cursor =
				cornerIndex === 0 || cornerIndex === 3
					? "nwse-resize"
					: "nesw-resize";
			return { position: "corner", cornerNumber: cornerIndex };
		} else {
			const isCursorInside = this.detectRectangles(
				worldX,
				worldY,
				startXPos,
				endXPos,
				startYPos,
				endYPos,
			);

			if (isCursorInside) {
				console.log("Inside the bounding box");
				this.state.canvas.style.cursor = "move";
				return { position: "inside" };
			} else {
				this.state.canvas.style.cursor = "default";
			}
		}
		return { position: "none" };
	};

	detectRectangles = (
		worldX: number,
		worldY: number,
		startXPos: number,
		endXPos: number,
		startYPos: number,
		endYPos: number,
	) => {
		const isInXAxis = worldX >= startXPos && worldX <= endXPos;
		const isInYAxis = worldY >= startYPos && worldY <= endYPos;
		return isInXAxis && isInYAxis;
	};

	calcBoundingBoxCorners = (
		startXPos: number,
		endXPos: number,
		startYPos: number,
		endYPos: number,
	) => {
		return [
			{
				startXPos: startXPos - 8,
				endXPos: startXPos + 8,
				startYPos: startYPos - 8,
				endYPos: startYPos + 8,
			},
			{
				startXPos: endXPos - 8,
				endXPos: endXPos + 8,
				startYPos: startYPos - 8,
				endYPos: startYPos + 8,
			},
			{
				startXPos: startXPos - 8,
				endXPos: startXPos + 8,
				startYPos: endYPos - 8,
				endYPos: endYPos + 8,
			},
			{
				startXPos: endXPos - 8,
				endXPos: endXPos + 8,
				startYPos: endYPos - 8,
				endYPos: endYPos + 8,
			},
		];
	};

	detectBoundingBoxCorners = (
		worldX: number,
		worldY: number,
		allCorners: {
			startXPos: number;
			endXPos: number;
			startYPos: number;
			endYPos: number;
		}[],
	) => {
		let isInsideCorner: boolean = false;
		let i = 0;
		for (; i < allCorners.length; i++) {
			const isInsideCorner = this.detectRectangles(
				worldX,
				worldY,
				allCorners[i]?.startXPos!,
				allCorners[i]?.endXPos!,
				allCorners[i]?.startYPos!,
				allCorners[i]?.endYPos!,
			);
			if (isInsideCorner) {
				return { isInsideCorner, cornerIndex: i };
			}
		}
		return { isInsideCorner, cornerIndex: i };
	};

	findShapes = (e: MouseEvent) => {
		if (this.refs.currSelectedShapeRef.current) {
			const cursorPosition = this.detectBoundingBox(e);
			if (cursorPosition.position !== "none") {
				this.userAction = "edit";
				this.editingShapeInfo.isMouseDown = true;
				this.editingShapeInfo.cursorPosition = cursorPosition;
				return;
			}
		}
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
				const startXPos = tempShape.position.x;
				const endXPos =
					tempShape.geometry.width! + tempShape.position.x;

				const startYPos = tempShape.position.y;
				const endYPos =
					tempShape.geometry.height! + tempShape.position.y;

				const isCursorInside = this.detectRectangles(
					worldX,
					worldY,
					startXPos,
					endXPos,
					startYPos,
					endYPos,
				);

				if (isCursorInside) {
					console.log("inside rect = ", tempShape.id);
					const allCorners = this.calcBoundingBoxCorners(
						startXPos,
						endXPos,
						startYPos,
						endYPos,
					);
					this.refs.currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: "rect",
							width: tempShape.geometry.width,
							height: tempShape.geometry.height,
						},
						allCorners: allCorners,
					};
					break;
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
					console.log("inside circle = ", tempShape.id);
					const allCorners = this.calcBoundingBoxCorners(
						tempShape.position.x - tempShape.geometry.radX,
						tempShape.position.x -
							tempShape.geometry.radX +
							tempShape.geometry.radX * 2,
						tempShape.position.y - tempShape.geometry.radY,
						tempShape.position.y -
							tempShape.geometry.radY +
							tempShape.geometry.radY * 2,
					);
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
						allCorners,
					};
					break;
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
					console.log("inside line = ", tempShape.id);
					console.log(tempShape.id);
					console.log(tempShape);
					const allCorners = [
						{
							startXPos: tempShape.position.x - 8,
							endXPos: tempShape.position.x + 8,
							startYPos: tempShape.position.y - 8,
							endYPos: tempShape.position.y + 8,
						},
						{
							startXPos:
								tempShape.position.x +
								tempShape.geometry.dX -
								8,
							endXPos:
								tempShape.position.x +
								tempShape.geometry.dX +
								8,
							startYPos:
								tempShape.position.y +
								tempShape.geometry.dY -
								8,
							endYPos:
								tempShape.position.y +
								tempShape.geometry.dY +
								8,
						},
					];
					this.refs.currSelectedShapeRef.current = {
						id: tempShape.id,
						position: tempShape.position,
						geometry: {
							type: "line",
							width: tempShape.geometry.dX,
							height: tempShape.geometry.dY,
						},
						allCorners,
					};
					break;
				}
			}
			// else if(tempShape.geometry.type === "draw") {
			// 	let x1 = tempShape.position.x;
			// 	let y1 = tempShape.position.y;
			// 	for (let j = 0; j < tempShape.geometry.allCoordinates.length; j++) {
			// 	if(!tempShape.geometry.allCoordinates[j]) break;
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
			// 		break;
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
					const allCorners = this.calcBoundingBoxCorners(
						tempShape.position.x - 6,
						tempShape.position.x + tempShape.geometry.width + 6,
						tempShape.position.y - 4,
						tempShape.position.y + tempShape.geometry.height - 4,
					);
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
						allCorners,
					};
					this.actions.setTextAreaValue(tempShape.geometry.text);
					toggleTextArea(
						true,
						this.actions.setIsTextAreaActive,
						this.actions.setTextAreaPosition,
						tempShape.position.x,
						tempShape.position.y,
					);
					break;
				}
			}
			this.refs.currSelectedShapeRef.current = null;
			this.userAction = null;
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

		if (this.refs.currSelectedShapeRef.current) {
			const cursorPosition = this.detectBoundingBox(e);
			let position: DetectBoundingBoxFnType = { position: "none" };

			if (cursorPosition.position === "corner") {
				position = {
					position: cursorPosition.position,
					cornerNumber: cursorPosition.cornerNumber,
				};
			} else if (cursorPosition.position === "edge") {
				position = {
					position: cursorPosition.position,
					edgeNumber: cursorPosition.edgeNumber,
				};
			} else {
				position = {
					position: cursorPosition.position,
				};
			}
			this.userAction = "edit";
			this.editingShapeInfo = {
				id: this.refs.currSelectedShapeRef.current.id,
				shapeType: this.refs.currSelectedShapeRef.current.geometry.type,
				cursorPosition: position,
				isMouseDown: true,
			};
			console.log(
				"editing shape info after findShapes = ",
				this.editingShapeInfo,
			);
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
