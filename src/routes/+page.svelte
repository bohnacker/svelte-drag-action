<script>
	import { dragAction } from '$lib/dragAction.svelte.js';

	let x1 = $state(0);
	let y1 = $state(0);
	let x2 = $state(0);
	let y2 = $state(0);
	let x3 = $state(0);
	let y3 = $state(0);
	let sliderValue1 = $state(0);

	function onchangeHandler1(event) {
		// Handle the drag event here
		x1 = event.x.toFixed(2);
		y1 = event.y.toFixed(2);
	}
	function onchangeHandler2(event) {
		// Handle the drag event here
		x2 = event.x.toFixed(2);
		y2 = event.y.toFixed(2);
	}
	function onchangeHandler3(event) {
		// Handle the drag event here
		x3 = event.x.toFixed(2);
		y3 = event.y.toFixed(2);
	}
</script>

<h1>Drag and drop action</h1>
<p>(not to confuse with the standard draggable attribute for a DOM element)</p>

<div style="display: flex; gap: 20px; flex-wrap: wrap;">
	<div>
		<div>DIV Test</div>
		<div style="widht: 400px; height: 400px;">
			<!-- <div class="container" style="transform: matrix(1.2, 0.2, -1, 0.9, 0, 20);"> -->
			<div class="container" style="transform: scale(75%) rotate(10deg);">
				<div
					class="square"
					style="transform: translate(0px, 0px) rotate(0deg);"
					use:dragAction={{
						minX: -150,
						maxX: 150,
						minY: -150,
						maxY: 150,
						onchange: onchangeHandler1
					}}
				>
					Drag me
				</div>
			</div>
		</div>
		<p>x:{x1}, y:{y1}</p>
	</div>

	<div>
		<div>SVG Test</div>
		<div style="widht: 400px; height: 400px;">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 400 400"
				width="300"
				height="300"
				style="border: 1px solid black;"
				transform="translate(30 30) rotate(10) skewX(0) translate(0 20)"
			>
				<rect x="0" y="0" width="400" height="400" style="fill: #f0f0f0;" />
				<g
					use:dragAction={{
						minX: -150,
						maxX: 150,
						minY: -150,
						maxY: 150,
						onchange: onchangeHandler2
					}}
					transform="translate(0, 0) scale(1)"
					style="cursor: grab;"
				>
					<rect x="150" y="150" width="100" height="100" rx="10" ry="10" style="fill:dodgerblue" />
					<text
						x="200"
						y="205"
						text-anchor="middle"
						fill="#fff9"
						font-size="20px"
						font-family="Arial, Helvetica, sans-serif"
						style="user-select: none;"
					>
						Drag me
					</text>
				</g>
			</svg>
		</div>
		<p>x:{x2}, y:{y2}</p>
	</div>

	<div>
		<div>SVG Test with custom constraint</div>
		<div style="">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 400 400"
				width="300"
				height="300"
				style="border: 1px solid black;"
			>
				<rect x="0" y="0" width="400" height="400" style="fill: #f0f0f0;" />
				<circle cx="200" cy="200" r="160" style="fill: #fff" />
				<g
					use:dragAction={{
						startX: 200,
						startY: 200,
						onchange: onchangeHandler3,
						constraintFunction: (x, y) => {
							// Custom constraint logic
							const distance = Math.sqrt(x * x + y * y);
							if (distance > 130) {
								const angle = Math.atan2(y, x);
								x = Math.cos(angle) * 130;
								y = Math.sin(angle) * 130;
							}
							return { x, y };
						}
					}}
					transform="translate(0, 0) scale(1)"
					style="cursor: grab;"
				>
					<circle cx="200" cy="200" r="30" style="fill:LimeGreen" />
				</g>
			</svg>
		</div>
		<p>x:{x3}, y:{y3}</p>
	</div>

	<div style="line-height: 1;">
		<div>SPAN Test</div>
		<!-- <div class="container" style="transform: matrix(1.2, 0.2, -1, 0.9, 0, 20);"> -->
		<div style="width: 330px">Set the value by dragging the Number below. The constraintFunction is used to snap the values to full 10th.</div>
		<div
			style="position:relative; display: inline-block; user-select: none; cursor: grab; background-color: gold; border-radius: 3px; padding:5px; width: 60px; text-align:center; margin-top: 10px;"
			use:dragAction={{
				minX: 0,
				maxX: 250,
				minY: 0,
				maxY: 0,
				onchange: (event) => {
					sliderValue1 = event.x.toFixed(0);
				},
                constraintFunction: (x, y) => {
                    // Custom constraint logic
                    return { x: Math.round(x / 10) * 10, y: 0 };
                }
			}}
		>
			{sliderValue1}
		</div>
	</div>
</div>

<style>
	.container {
		width: 400px;
		height: 400px;
		border: 1px solid #000;
		position: relative;
		background-color: #f0f0f0;
		overflow: hidden;
	}
	.square {
		width: 100px;
		height: 100px;
		background-color: tomato;
		position: absolute;
		top: calc(50% - 50px);
		left: calc(50% - 50px);
		border-radius: 10%;
		text-align: center;
		text-wrap: wrap;
		line-height: 100px;
		color: #fff9;
		font-size: 20px;
		font-family: Arial, Helvetica, sans-serif;
		overflow: hidden;
		user-select: none;
		cursor: grab;
	}
</style>
