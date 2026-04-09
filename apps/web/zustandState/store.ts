import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { appStoreType, currentToolState } from "./storeTypes";

const createCurrentToolSlice: StateCreator<
	appStoreType,
	[],
	[],
	currentToolState
> = (set) => ({
	currentTool: "cursor",
	changeTool: (tool) => set((state) => ({ currentTool: tool })),
});

const useAppStore = create<appStoreType>()(
	persist(
		(...a) => ({
			...createCurrentToolSlice(...a),
		}),
		{
			name: "app-state",
		},
	),
);
