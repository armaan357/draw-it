export const toggleTextArea = (
	toggle: boolean,
	setIsTextAreaActive: (toggle: boolean) => void,
	setTextAreaPosition: (worldX: number, worldY: number) => void,
	worldX?: number,
	worldY?: number,
) => {
	if (toggle && worldX && worldY) {
		setIsTextAreaActive(toggle);
		setTextAreaPosition(worldX, worldY);
	} else if (!toggle) {
		setIsTextAreaActive(toggle);
	}
};
