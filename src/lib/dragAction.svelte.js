export function dragAction(node, params) {
	// console.log(node);

	// Get optional parameters
	let startX = params?.startX === undefined ? 0 : params?.startX;
	let startY = params?.startY === undefined ? 0 : params?.startY;
	let minX = params?.minX === undefined ? -Infinity : params?.minX;
	let maxX = params?.maxX === undefined ? Infinity : params?.maxX;
	let minY = params?.minY === undefined ? -Infinity : params?.minY;
	let maxY = params?.maxY === undefined ? Infinity : params?.maxY;
	let onchange = params?.onchange || (() => {});
	let constraintFunction = params?.constraintFunction || false;

	let isSVGElement;

	let clickX, clickY;
	let clickScreenTransform, clickParentTransform, clickElementTransform;
	let offsetX, offsetY;
	let isDragging = false;

	// Remember the original position of the element as the translation of the node relative to its parent
	let originX, originY;

	// Helper function to create a point in the SVG coordinate system
	function createPoint(x, y) {
		let point = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGPoint();
		point.x = x;
		point.y = y;
		return point;
	}
	// Helper function to remove translation from a transform matrix
	function removeTranslation(transform) {
		transform.e = 0;
		transform.f = 0;
		return transform;
	}
	// Helper function to get the transform of a DOM element
	function getTransform(element) {
		let transformString = getComputedStyle(element).transform;
		let match = transformString.match(/(-?[0-9]+(?:\.[0-9]+)?)/gi);
		if (!match) {
			return new DOMMatrix();
		}
		return new DOMMatrix(match);
	}
	// Helper function to get the screen transform of a DOM element
	// This has to be done recursively
	function getScreenTransform(element, screenTransform) {
		if (!screenTransform) {
			screenTransform = new DOMMatrix();
		}
		const rgx = /(-?[0-9]+(?:\.[0-9]+)?)/gi;
		let transformString = getComputedStyle(element).transform;
		let match = transformString.match(rgx);
		if (!match) {
			return screenTransform;
		}
		const transform = new DOMMatrix(match);
		// Apply the transform to the screen transform
		screenTransform = screenTransform.multiply(transform);
		// If the element has a parent element, get its transform and apply it recursively
		if (element.parentElement) {
			return getScreenTransform(element.parentElement, screenTransform);
		} else {
			return transform;
		}
	}
	// Helper function to set the position
	function setPosition(newX, newY) {
		// Constrain the new position to the given bounds
		if (constraintFunction) {
			let res = constraintFunction(newX, newY);
			newX = res.x;
			newY = res.y;
		}
		newX = Math.max(minX, Math.min(maxX, newX));
		newY = Math.max(minY, Math.min(maxY, newY));

		if (isSVGElement) {
			// Set the position of the element using the transform matrix
			node.setAttribute(
				'transform',
				`matrix(${clickElementTransform.a} ${clickElementTransform.b} ${clickElementTransform.c} ${clickElementTransform.d} ${newX} ${newY})`
			);
		} else {
			// Set the position of the element using the transform matrix
			node.style.transform = `matrix(${clickElementTransform.a}, ${clickElementTransform.b}, ${clickElementTransform.c}, ${clickElementTransform.d}, ${newX}, ${newY})`;
		}
		return {
			x: newX,
			y: newY
		};
	}

	function handleMouseDown(event) {
		event.preventDefault();
		clickX = event.clientX;
		clickY = event.clientY;

		if (isSVGElement) {
			clickScreenTransform = node.getScreenCTM();
			clickParentTransform = node.parentElement.getScreenCTM();
			clickElementTransform = clickParentTransform.inverse().multiply(clickScreenTransform);
		} else {
			clickScreenTransform = getScreenTransform(node);
			clickParentTransform = getScreenTransform(node.parentElement);
			clickElementTransform = getTransform(node);
		}
		isDragging = true;

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(event) {
		// console.log('mousemove', event.clientX, event.clientY, clickX, clickY);

		let newX, newY;
		let inverseParentTransform = removeTranslation(clickParentTransform.inverse());
		// Calculate the vector from the click point to the current mouse position
		let deltaX = event.clientX - clickX;
		let deltaY = event.clientY - clickY;
		// Transform the delta vector to the coordinate system of the parent element
		// let transformedDelta = createPoint(deltaX, deltaY).matrixTransform(inverseParentTransform);
		let transformedDelta = new DOMPoint(deltaX, deltaY).matrixTransform(inverseParentTransform);
		// Add the transformed delta vector to the click position to get the new position
		newX = clickElementTransform.e + transformedDelta.x;
		newY = clickElementTransform.f + transformedDelta.y;

		let res = setPosition(newX, newY);
		newX = res.x;
		newY = res.y;

		onchange({
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
			clickScreenTransform = node.getScreenCTM();
			clickParentTransform = node.parentElement.getScreenCTM();
			clickElementTransform = clickParentTransform.inverse().multiply(clickScreenTransform);
		} else {
			clickScreenTransform = getScreenTransform(node);
			clickParentTransform = getScreenTransform(node.parentElement);
			clickElementTransform = getTransform(node);
		}
		originX = clickElementTransform.e;
		originY = clickElementTransform.f;

		// If a startX and startY are provided, set the starting position of the element
		startX = startX || originX;
		startY = startY || originY;
		let res = setPosition(startX, startY);

		// if a onchange function is provided, calculate the position of the element and call the onchange
		if (onchange) {
			onchange({
				x: res.x,
				y: res.y,
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
