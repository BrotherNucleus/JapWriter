const DEFAULT_LINE_WIDTH = 5;
const DEFAULT_LINE_COLOR = "#111827";

function getCanvasPoint(canvas, event) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  };
}

function drawStroke(context, stroke) {
  if (stroke.length === 0) {
    return;
  }

  context.beginPath();
  context.moveTo(stroke[0].x, stroke[0].y);
  for (const point of stroke.slice(1)) {
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

export function createDrawingCanvas(canvas, { onChange } = {}) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The browser does not support a 2D canvas context.");
  }

  const strokes = [];
  let activeStroke = null;
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

  function handlePointerDown(event) {
    if (!enabled) {
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
    if (!activeStroke || !canvas.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.preventDefault();
    const nextPoint = getCanvasPoint(canvas, event);
    activeStroke.push(nextPoint);
    drawStroke(context, activeStroke.slice(-2));
  }

  function finishStroke(event) {
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
    if (activeStroke && canvas.hasPointerCapture(event.pointerId)) {
      strokes.push(activeStroke);
    }
    finishStroke(event);
    notifyChange();
  }

  function handlePointerCancel(event) {
    activeStroke = null;
    finishStroke(event);
    redraw();
    notifyChange();
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("resize", redraw);
  redraw();

  return {
    undo,
    clear,
    hasStrokes,
    setEnabled(value) {
      enabled = value;
      canvas.classList.toggle("disabled-canvas", !value);
    },
    destroy() {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("resize", redraw);
    }
  };
}
