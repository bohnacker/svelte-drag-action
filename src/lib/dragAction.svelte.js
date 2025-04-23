export function dragAction(node, params) {
	// console.log(node);

	// Get optional parameters
	let minX = params?.minX === undefined ? -Infinity : params?.minX;
	let maxX = params?.maxX === undefined ? Infinity : params?.maxX;
	let minY = params?.minY === undefined ? -Infinity : params?.minY;
	let maxY = params?.maxY === undefined ? Infinity : params?.maxY;
	let callback = params?.callback || (() => {});

	let isSVGElement;
	let transform, inverseTransform;

	let positionType;
	let clickX, clickY;
	let offsetX, offsetY;
	let isDragging = false;

	function handleMouseDown(event) {
		event.preventDefault();
		clickX = event.clientX;
		clickY = event.clientY;
		if (isSVGElement) {
			const transform = node.getCTM();
			offsetX = transform.e - clickX;
			offsetY = transform.f - clickY;
			console.log(transform, offsetX, offsetY);
		} else {
			offsetX =
				node.getBoundingClientRect().left -
				node.parentElement.getBoundingClientRect().left -
				clickX;
			offsetY =
				node.getBoundingClientRect().top - node.parentElement.getBoundingClientRect().top - clickY;
		}
		isDragging = true;

		// console.log('mousedown', clickX, clickY, offsetX, offsetY);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(event) {
		console.log('mousemove', event.clientX, event.clientY, offsetX, offsetY);
		let newX = event.clientX + offsetX;
		let newY = event.clientY + offsetY;
		newX = Math.max(minX, Math.min(maxX, newX));
		newY = Math.max(minY, Math.min(maxY, newY));

		if (isSVGElement) {
			// For SVG elements, we need to set the transform attribute
			node.setAttribute('transform', `translate(${newX}, ${newY})`);
		} else {
			node.style.left = `${newX}px`;
			node.style.top = `${newY}px`;
		}

		callback({
			x: newX,
			y: newY,
			element: node
		});
	}

	function handleMouseUp() {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	}

	$effect(() => {
		// This will be done when the component is mounted

		// Check if the element is an SVG element.
		isSVGElement = node instanceof SVGElement;
		if (isSVGElement) {
			// Get actual transform of the SVG element
			transform = node.getScreenCTM();
			// Calculate the inverse transform matrix
			inverseTransform = transform.inverse();
			// if (transform.a !== 1 || transform.b !== 0 || transform.c !== 0 || transform.d !== 1) {
			// 	console.warn(
			// 		`The SVG element has a scaling and/or rotation transform applied to it. This may cause unexpected behavior when dragging.`
			// 	);
			// }
		} else {
			// Check if the element has a transform applied to it
			const transform = window.getComputedStyle(node).transform;
			positionType = window.getComputedStyle(node).position;
			if (positionType !== 'absolute') {
				console.warn(
					`The position type of the element is ${positionType}. It should be absolute for dragAction to work properly.`
				);
			}
		}

		// if a callback is provided, calculate the position of the element and call the callback
		if (callback) {
			let x = node.getBoundingClientRect().left - node.parentElement.getBoundingClientRect().left;
			let y = node.getBoundingClientRect().top - node.parentElement.getBoundingClientRect().top;
			if (isSVGElement) {
				const transform = node.getCTM();
				x = transform.e;
				y = transform.f;
			}
			callback({
				x: x,
				y: y,
				element: node
			});
		}
		// Add event listeners
		node.addEventListener('mousedown', handleMouseDown);

		return () => {
			// This will be done when the component is unmounted
			node.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});
}
