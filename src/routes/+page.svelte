<script>
	import { dragAction } from '$lib/dragAction.svelte.js';

	let x1 = $state(0);
	let y1 = $state(0);
	let x2 = $state(0);
	let y2 = $state(0);

	function positionHandler1(position) {
		// Handle the drag event here
		x1 = position.x.toFixed(2);
		y1 = position.y.toFixed(2);
	}
	function positionHandler2(position) {
		// Handle the drag event here
		x2 = position.x.toFixed(2);
		y2 = position.y.toFixed(2);
	}
</script>

<h1>Drag and drop action</h1>
<p>(not to confuse with the standard draggable stuff)</p>

<div style="display: flex; gap: 20px;">
	<div>
		<div>DIV Test</div>
		<div class="container">
			<div
				class="square"
				style="transform: translate(0px, 0px);"
				use:dragAction={{ minX: 0, maxX: 300, minY: 0, maxY: 300, callback: positionHandler1 }}
			>
				Drag me
			</div>
		</div>
		<p>x:{x1}, y:{y1}</p>
	</div>

	<div>
		<div>SVG Test</div>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 400 400"
			width="500"
			height="500"
			style="border: 1px solid black;"
		>
			<rect x="0" y="0" width="400" height="400" style="fill: #f0f0f0;" />
			<g
				use:dragAction={{
					minX: -150,
					maxX: 150,
					minY: -150,
					maxY: 150,
					callback: positionHandler2
				}}
			>
				<rect x="150" y="150" width="100" height="100" rx="10" ry="10" style="fill:dodgerblue" />
			</g>
		</svg>
		<p>x:{x2}, y:{y2}</p>
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
