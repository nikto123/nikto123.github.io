"use strict";
exports.__esModule = true;
var ctx;
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vec2;
}());
exports.Vec2 = Vec2;
function drawLine(from, to, width, color) {
    if (width === void 0) { width = 1; }
    if (color === void 0) { color = "#000000"; }
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
exports.drawLine = drawLine;
function drawRing(pos, values, radius, fscale, lineWidth, lineColor) {
    if (fscale === void 0) { fscale = 1.0; }
    if (lineWidth === void 0) { lineWidth = 1; }
    if (lineColor === void 0) { lineColor = "#000000"; }
    var aDiff = 1.0 / values.length * Math.PI * 2.0;
    var a = 0.0;
    var prevPt = null;
    var firstPt = null;
    for (var i = 0; i < values.length; i++) {
        var fval = values[i];
        var pt = new Point(pos.x + Math.cos(a) * (radius + fval * fscale), pos.y + Math.sin(a) * (radius + fval * fscale));
        if (prevPt != null) {
            drawLine(prevPt, pt, 3.0);
        }
        else {
            firstPt = pt;
        }
        prevPt = pt;
        a += aDiff;
    }
    drawLine(prevPt, firstPt);
}
exports.drawRing = drawRing;
var Frame = /** @class */ (function () {
    function Frame(drawObjects, clearBeforeDraw, timestamp) {
        this.drawObjects = drawObjects;
        this.clearBeforeDraw = clearBeforeDraw;
        this.timestamp = timestamp;
    }
    Frame.prototype.addObject = function (drawObject) {
        this.drawObjects.push(drawObject);
    };
    Frame.prototype.draw = function (drawContext) {
        if (this.clearBeforeDraw) {
            // drawRect     
        }
    };
    return Frame;
}());
exports.Frame = Frame;
