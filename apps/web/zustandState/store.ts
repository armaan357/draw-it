import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
	appStoreType,
	currentShapesStateType,
	currentUIStateType,
	shapesType,
	textAreaStateType,
} from "./storeTypes";

const createCurrentUISlice: StateCreator<
	appStoreType,
	[],
	[],
	currentUIStateType
> = (set) => ({
	currentTool: "cursor",
	zoom: 1,
	offsetX: 0,
	offSetY: 0,
	changeTool: (tool) => set((state) => ({ currentTool: tool })),
	changeZoom: (newZoom) => set((state) => ({ zoom: newZoom })),
	changeOffset: (newOffsetX, newOffsetY) =>
		set((state) => ({ offsetX: newOffsetX, offSetY: newOffsetY })),
});

const textAreaStateSlice: StateCreator<
	appStoreType,
	[],
	[],
	textAreaStateType
> = (set) => ({
	isTextAreaActive: false,
	textAreaScreenX: 0,
	textAreaScreenY: 0,
	textAreaValue: "",
	textAreaEditingShapeId: "",
	setIsTextAreaActive: (toggle) =>
		set((state) => ({ isTextAreaActive: toggle })),
	setTextAreaPosition: (worldX, worldY) =>
		set((state) => ({
			textAreaScreenX: worldX * state.zoom + state.offsetX - 6,
			textAreaScreenY: worldY * state.zoom + state.offSetY - 6,
		})),
	setTextAreaValue: (val) => set((state) => ({ textAreaValue: val })),
	setTextAreaEditingShapeId: (id) =>
		set((state) => ({ textAreaEditingShapeId: id })),
});

const currentShapesSlice: StateCreator<
	appStoreType,
	[],
	[],
	currentShapesStateType
> = (set) => ({
	allShapes: [],
	past: [],
	future: [],
	addShapes: (shape) =>
		set((state) => {
			state.past.push(state.allShapes);
			return { allShapes: [...state.allShapes, shape], future: [] };
		}),
	removeShape: (id) =>
		set((state) => ({
			allShapes: state.allShapes.filter((s) => s.id !== id),
		})),
	repositionShape: (id, position) =>
		set((state) => {
			const index = state.allShapes.findIndex((s) => s.id === id);
			if (index == -1) return state;
			const tempShapes = [...state.allShapes];
			if (!tempShapes[index]) {
				return state;
			}
			const oldShape = tempShapes[index];
			tempShapes[index] = { ...oldShape, position: position };
			return { allShapes: tempShapes };
		}),
	resizeShape: (id, geometry) =>
		set((state) => {
			const index = state.allShapes.findIndex((s) => s.id === id);
			if (index == -1) return state;
			const tempShapes = [...state.allShapes];
			if (!tempShapes[index]) {
				return state;
			}
			const oldShape = tempShapes[index];
			tempShapes[index] = { ...oldShape, geometry: geometry };
			return { allShapes: tempShapes };
		}),
	undo: () =>
		set((state) => {
			if (state.allShapes.length === 0) {
				return state;
			}
			const futureStack = [...state.future];
			futureStack.push([...state.allShapes]);
			const pastStack = [...state.past];
			const lastAction = pastStack.pop();
			let present: shapesType[];
			if (!lastAction) {
				present = [];
			} else {
				present = lastAction;
			}
			return {
				past: pastStack,
				allShapes: present,
				future: futureStack,
			};
		}),
	redo: () =>
		set((state) => {
			if (state.future.length === 0) {
				return state;
			}
			const pastStack = [...state.past];
			pastStack.push([...state.allShapes]);
			const futureStack = [...state.future];
			const lastAction = futureStack.pop();
			let present: shapesType[];
			if (!lastAction) {
				present = [];
			} else {
				present = lastAction;
			}
			return {
				past: pastStack,
				allShapes: present,
				future: futureStack,
			};
		}),
	commitHistory: (snapShot) =>
		set((state) => {
			const pastStack = [...state.past];
			pastStack.push([...snapShot]);
			return {
				past: pastStack,
			};
		}),
});

export const useAppStore = create<appStoreType>()(
	persist(
		(...a) => ({
			...createCurrentUISlice(...a),
			...textAreaStateSlice(...a),
			...currentShapesSlice(...a),
		}),
		{
			name: "app-state",
		},
	),
);
