import { createDrawingCanvas } from "./canvas.js";

const canvas = document.querySelector("#writing-canvas");
const undoButton = document.querySelector("#undo-button");
const clearButton = document.querySelector("#clear-button");
const status = document.querySelector("#canvas-status");

const drawingCanvas = createDrawingCanvas(canvas, {
  onChange: ({ canUndo }) => {
    undoButton.disabled = !canUndo;
    clearButton.disabled = !canUndo;
    status.textContent = canUndo ? "Writing in progress" : "Ready to write";
  }
});

undoButton.addEventListener("click", drawingCanvas.undo);
clearButton.addEventListener("click", drawingCanvas.clear);
