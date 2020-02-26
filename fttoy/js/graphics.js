"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ctx;
function setup(c, receiver) {
    setupInput(c, receiver);
}
exports.setup = setup;
exports.default = 342;
var Mouse = /** @class */ (function () {
    function Mouse() {
    }
    Mouse.prototype.mouseMove = function (newX, newY) {
        this.x = newX;
        this.y = newY;
        for (var i = 0; i < 3; i++) {
            if (this.bState[i] == true) {
                if (this.dragState[i] == false) {
                    startDrag(i);
                }
            }
        }
    };
    Mouse.prototype.startDrag = function () {
        //mappedCallback()
    };
    Mouse.prototype.endDrag = function () {
        //mappedCallback()
    };
    Mouse.prototype.mouseDrag = function (x, y) {
    };
    Mouse.prototype.mbDown = function (bIndex) {
        this.bState[bIndex] = true;
        //onDownCallback
    };
    Mouse.prototype.mbUp = function (bIndex) {
        this.bState[bIndex] = false;
    };
    return Mouse;
}());
function setupInput(c, inputReceiver) {
    c.addEventListener("wheel", inputReceiver.onMouseWheel);
    c.addEventListener("mouseup", inputReceiver.onMouseUp);
    c.addEventListener("mousedown", inputReceiver.onMouseDown);
    c.addEventListener("mousemove", inputReceiver.onMouseMove);
}
function drawLine(from, to, width, color) {
    if (width === void 0) { width = 1; }
    if (width === void 0) {
        width = 1;
    }
    if (color === void 0) {
        color = '#000000';
    }
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
}
//# sourceMappingURL=graphics.js.map