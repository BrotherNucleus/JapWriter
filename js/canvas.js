const DEFAULT_LINE_WIDTH = 10;
const DEFAULT_LINE_COLOR = "#111827";
const ERASER_RADIUS = 14;

function getCanvasPoint(canvas, event) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
    p: event.pressure ? event.pressure : 0.5
  };
}

function drawStroke(context, stroke) {
  if (stroke.length === 0) {
    return;
  }

  context.beginPath();
  context.moveTo(stroke[0].x, stroke[0].y);
  for (const point of stroke.slice(1)) {
    context.lineWidth = point.p * DEFAULT_LINE_WIDTH;
    context.lineTo(point.x, point.y);
  }
  context.stroke();
}

function configureContext(context) {
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = DEFAULT_LINE_WIDTH;
  context.strokeStyle = DEFAULT_LINE_COLOR;
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const projection = (
    (point.x - start.x) * dx +
    (point.y - start.y) * dy
  ) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, projection));
  return Math.hypot(
    point.x - (start.x + clamped * dx),
    point.y - (start.y + clamped * dy)
  );
}

function cross(start, first, second) {
  return (
    (first.x - start.x) * (second.y - start.y) -
    (first.y - start.y) * (second.x - start.x)
  );
}

function onSegment(point, start, end) {
  return (
    Math.abs(cross(start, end, point)) < 0.001 &&
    point.x >= Math.min(start.x, end.x) &&
    point.x <= Math.max(start.x, end.x) &&
    point.y >= Math.min(start.y, end.y) &&
    point.y <= Math.max(start.y, end.y)
  );
}

function segmentsIntersect(startA, endA, startB, endB) {
  const crossA = cross(startA, endA, startB);
  const crossB = cross(startA, endA, endB);
  const crossC = cross(startB, endB, startA);
  const crossD = cross(startB, endB, endA);

  if (
    ((crossA > 0 && crossB < 0) || (crossA < 0 && crossB > 0)) &&
    ((crossC > 0 && crossD < 0) || (crossC < 0 && crossD > 0))
  ) {
    return true;
  }
  return (
    (crossA === 0 && onSegment(startB, startA, endA)) ||
    (crossB === 0 && onSegment(endB, startA, endA)) ||
    (crossC === 0 && onSegment(startA, startB, endB)) ||
    (crossD === 0 && onSegment(endA, startB, endB))
  );
}

function strokeHitsSegment(stroke, start, end) {
  if (stroke.length === 1) {
    return distanceToSegment(stroke[0], start, end) <= ERASER_RADIUS;
  }
  for (let index = 1; index < stroke.length; index += 1) {
    const strokeStart = stroke[index - 1];
    const strokeEnd = stroke[index];
    if (
      distanceToSegment(strokeStart, start, end) <= ERASER_RADIUS ||
      distanceToSegment(strokeEnd, start, end) <= ERASER_RADIUS ||
      segmentsIntersect(strokeStart, strokeEnd, start, end)
    ) {
      return true;
    }
  }
  return false;
}

export function createDrawingCanvas(canvas, { onChange } = {}) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The browser does not support a 2D canvas context.");
  }

  const strokes = [];
  let activeStroke = null;
  let eraserStart = null;
  let erasing = false;
  let enabled = true;
  let pixelRatio = window.devicePixelRatio || 1;

  function redraw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    configureContext(context);
    context.clearRect(0, 0, width, height);
    for (const stroke of strokes) {
      drawStroke(context, stroke);
    }
  }

  function notifyChange() {
    onChange?.({ canUndo: strokes.length > 0 });
  }

  function eraseAt(point) {
    const segmentStart = eraserStart ?? point;
    const remainingStrokes = strokes.filter(
      (stroke) => !strokeHitsSegment(stroke, segmentStart, point)
    );
    if (remainingStrokes.length === strokes.length) {
      return;
    }
    strokes.splice(
      0,
      strokes.length,
      ...remainingStrokes
    );
    redraw();
    notifyChange();
  }

  function handlePointerDown(event) {
    if (!enabled) {
      return;
    }
    if (event.pointerType === "mouse" && event.button === 2) {
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      erasing = true;
      const point = getCanvasPoint(canvas, event);
      eraserStart = point;
      eraseAt(point);
      return;
    }
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    activeStroke = [getCanvasPoint(canvas, event)];
    drawStroke(context, activeStroke);
    notifyChange();
  }

  function handlePointerMove(event) {
    if (erasing && canvas.hasPointerCapture(event.pointerId)) {
      event.preventDefault();
      const point = getCanvasPoint(canvas, event);
      eraseAt(point);
      eraserStart = point;
      return;
    }
    if (!activeStroke || !canvas.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.preventDefault();
    const nextPoint = getCanvasPoint(canvas, event);
    activeStroke.push(nextPoint);
    drawStroke(context, activeStroke.slice(-2));
  }

  function finishStroke(event) {
    if (erasing && canvas.hasPointerCapture(event.pointerId)) {
      event.preventDefault();
      canvas.releasePointerCapture(event.pointerId);
      erasing = false;
      eraserStart = null;
      notifyChange();
      return;
    }
    if (!activeStroke || !canvas.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.preventDefault();
    canvas.releasePointerCapture(event.pointerId);
    activeStroke = null;
  }

  function undo() {
    if (strokes.length === 0) {
      return;
    }

    strokes.pop();
    redraw();
    notifyChange();
  }

  function clear() {
    if (strokes.length === 0) {
      return;
    }

    strokes.length = 0;
    redraw();
    notifyChange();
  }

  function hasStrokes() {
    return strokes.length > 0;
  }

  function handlePointerUp(event) {
    if (erasing) {
      finishStroke(event);
      return;
    }
    if (activeStroke && canvas.hasPointerCapture(event.pointerId)) {
      strokes.push(activeStroke);
    }
    finishStroke(event);
    notifyChange();
  }

  function handlePointerCancel(event) {
    if (erasing) {
      erasing = false;
      eraserStart = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      notifyChange();
      return;
    }
    activeStroke = null;
    finishStroke(event);
    redraw();
    notifyChange();
  }

  function preventContextMenu(event) {
    event.preventDefault();
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("contextmenu", preventContextMenu);
  window.addEventListener("resize", redraw);
  const resizeObserver = new ResizeObserver(redraw);
  resizeObserver.observe(canvas);
  redraw();

  return {
    undo,
    clear,
    hasStrokes,
    resize() {
      redraw();
    },
    setEnabled(value) {
      enabled = value;
      canvas.classList.toggle("disabled-canvas", !value);
    },
    destroy() {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      canvas.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("resize", redraw);
      resizeObserver.disconnect();
    }
  };
}
