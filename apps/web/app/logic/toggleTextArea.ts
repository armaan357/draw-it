export const toggleTextArea = (
	toggle: boolean,
	setIsTextAreaActive: (toggle: boolean) => void,
	setTextAreaPosition: (worldX: number, worldY: number) => void,
	worldX?: number,
	worldY?: number,
) => {
	// const { setIsTextAreaActive, setTextAreaPosition } = useAppStore(
	// 	useShallow((state) => ({
	// 		setIsTextAreaActive: state.setIsTextAreaActive,
	// 		setTextAreaPosition: state.setTextAreaPosition,
	// 	})),
	// );
	console.log(
		`toggle = ${toggle}, worldX = ${worldX}, worldY = ${worldY} in toggleTextArea.ts`,
	);
	if (toggle && worldX && worldY) {
		setIsTextAreaActive(toggle);
		setTextAreaPosition(worldX, worldY);
	} else if (!toggle) {
		setIsTextAreaActive(toggle);
	}
};
