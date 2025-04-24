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
	let clickPoint,
		clickTransform,
		clickScreenTransform,
		clickInverseTransform,
		clickParentTransform,
		clickInverseTransformInverse;
	let offsetX, offsetY;
	let isDragging = false;

	function createPoint(x, y, matrix) {
		let point = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGPoint();
		point.x = x;
		point.y = y;
		return point;
	}

	function handleMouseDown(event) {
		event.preventDefault();
		clickX = event.clientX;
		clickY = event.clientY;

		if (isSVGElement) {
			clickScreenTransform = node.getScreenCTM();
			clickParentTransform = node.parentElement.getScreenCTM();
			// clickParentTransformInverse = clickParentTransform.inverse();
			clickTransform = node.getCTM();

			// console.log(clickScreenTransform);
			// clickScreenTransform.e = 0;
			// clickScreenTransform.f = 0;
			// clickInverseTransform = clickScreenTransform.inverse();
			// clickInverseTransform.e = 0;
			// clickInverseTransform.f = 0;
			// clickTransform = node.getCTM();
			//console.log(clickTransform, clickScreenTransform, clickInverseTransform);

			// offsetX = clickTransform.e - clickX;
			// offsetY = clickTransform.f - clickY;
			// console.log(clickTransform, offsetX, offsetY);
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
		// console.log('mousemove', event.clientX, event.clientY, clickX, clickY);

		let newX, newY;
		if (isSVGElement) {
			let inverseParentTransform = clickParentTransform.inverse();
			inverseParentTransform.e = 0;
			inverseParentTransform.f = 0;
			// Calculate the vector from the click point to the current mouse position
			let deltaX = event.clientX - clickX;
			let deltaY = event.clientY - clickY;
			// Transform the delta vector to the coordinate system of the parent element
			let transformedDelta = createPoint(deltaX, deltaY).matrixTransform(inverseParentTransform);
			// Get the current position of the element relative to the parent element and transform it to the coordinate system of the parent element
			let elementPosTransformed = createPoint(clickTransform.e, clickTransform.f).matrixTransform(
				inverseParentTransform
			);

			// Add the transformed delta vector to the current position to get the new position
			newX = elementPosTransformed.x + transformedDelta.x;
			newY = elementPosTransformed.y + transformedDelta.y;
			console.log(newX, newY);

			newX = Math.max(minX, Math.min(maxX, newX));
			newY = Math.max(minY, Math.min(maxY, newY));

			node.setAttribute('transform', `translate(${newX}, ${newY})`);
		} else {
			newX = event.clientX + offsetX;
			newY = event.clientY + offsetY;
			newX = Math.max(minX, Math.min(maxX, newX));
			newY = Math.max(minY, Math.min(maxY, newY));

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
			// console.log(node.getCTM(), node.getScreenCTM());
			// // Get actual transform of the SVG element
			// transform = node.getScreenCTM();
			// // Calculate the inverse transform matrix
			// inverseTransform = transform.inverse();
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
				let clickParentTransform = node.parentElement.getScreenCTM();
				let inverseParentTransform = clickParentTransform.inverse();
				inverseParentTransform.e = 0;
				inverseParentTransform.f = 0;
				let pos = createPoint(transform.e, transform.f).matrixTransform(inverseParentTransform);
				x = pos.x;
				y = pos.y;

				console.log('node.getCTM()', node.getCTM());
				console.log('node.getScreenCTM()', node.getScreenCTM());
				console.log('node.parentElement.getScreenCTM()', node.parentElement.getScreenCTM());
				console.log(node.getCTM().inverse().multiply(node.getScreenCTM()));
				console.log(node.getScreenCTM().multiply(node.getCTM().inverse()));
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
