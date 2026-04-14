import { shapesType } from "../../zustandState/storeTypes";

export function drawCanvas(
	ctx: CanvasRenderingContext2D,
	allShapes: shapesType[],
	canvas: HTMLCanvasElement,
) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!allShapes) {
		// console.log('All shapes does not exist');
		return;
	}

	if (allShapes.length === 0) {
		return;
	}
	// console.log('allshapes now while rendering = ', allShapes);
	allShapes.map((s) => {
		switch (s.geometry.type) {
			case "rect":
				ctx.beginPath();
				ctx.roundRect(
					s.position.x,
					s.position.y,
					s.geometry.width,
					s.geometry.height,
					Math.abs((s.geometry.width + s.geometry.height) / 50),
				);
				ctx.stroke();
				break;
			case "circle":
				ctx.beginPath();
				ctx.ellipse(
					s.position.x,
					s.position.y,
					s.geometry.radX,
					s.geometry.radY,
					0,
					0,
					2 * Math.PI,
					false,
				);
				ctx.stroke();
				break;
			case "line":
				ctx.beginPath();
				ctx.moveTo(s.position.x, s.position.y);
				ctx.lineTo(s.geometry.dX, s.geometry.dY);
				ctx.stroke();
				break;
			case "draw":
				ctx.lineJoin = "round";
				ctx.beginPath();
				ctx.moveTo(s.position.x, s.position.y);
				s.geometry.allCoordinates.map((a) => ctx.lineTo(a.x, a.y));
				ctx.stroke();
				break;
			case "text":
				ctx.fillStyle = "white";
				ctx.fillText(s.geometry.text, s.position.x, s.position.y);
				break;
		}
		// if (s.type === "rect") {
		// 	ctx.beginPath();
		// 	ctx.roundRect(
		// 		s.position.x,
		// 		s.position.y,
		// 		s.geometry.width,
		// 		s.geometry.height,
		// 		Math.abs((s.geometry.width + s.geometry.height) / 50),
		// 	);
		// 	ctx.stroke();
		// } else if (s.type === "circle") {
		// 	ctx.beginPath();
		// 	ctx.ellipse(
		// 		s.position.x,
		// 		s.position.y,
		// 		s.geometry.radX,
		// 		s.geometry.radY,
		// 		0,
		// 		0,
		// 		2 * Math.PI,
		// 		false,
		// 	);
		// 	ctx.stroke();
		// } else if (s.type == "line") {
		// 	ctx.beginPath();
		// 	ctx.moveTo(s.position.x, s.position.y);
		// 	ctx.lineTo(s.geometry.dX, s.geometry.dY);
		// 	ctx.stroke();
		// } else if (s.type == "draw") {
		// 	ctx.lineJoin = "round";
		// 	ctx.beginPath();
		// 	ctx.moveTo(s.position.x, s.position.y);
		// 	s.geometry.allCoordinates.map((a) => ctx.lineTo(a.x, a.y));
		// 	ctx.stroke();
		// 	// ctx.beginPath();
		// 	// ctx.moveTo(s.x, s.y);
		// 	// ctx.lineTo(s.toX, s.toY);
		// 	// ctx.stroke();
		// } else if (s.type == "text") {
		// 	ctx.fillStyle = "white";
		// 	ctx.fillText(s.geometry.text, s.position.x, s.position.y);
		// }
	});
}
