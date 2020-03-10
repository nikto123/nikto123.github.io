
import { drawRing, Vec2, Rect, Frame, Polyline } from './graphics';
import { AppObject, Keyboard, Mouse } from './engine';

enum WaveDrawMode {
    Lines, 
    Columns
} 
class Wave implements AppObject
{
    type: string;
    rect: Rect;

    min:number;
    max:number;

    scale:Vec2;
    dataRes:number;

    values:Array<number>;
    selected:boolean = false;

    drawMode:WaveDrawMode = WaveDrawMode.Lines;

    constructor(rect:Rect, dataRes:number, min:number, max:number)
    {
        this.dataRes = dataRes;
        this.values = new Array(this.dataRes);

        this.min = min;
        this.max = max;
       
        var range = Math.abs(max - min);

        this.scale= new Vec2(Math.abs(rect.dr.x - rect.ul.x) / this.dataRes, range != 0 ? 1.0 / range : 0.0000000001);
        this.rect = rect;
    }

    getFrame():Frame {
        var polyLine = new Polyline();
        var frame = new Frame([polyLine], true, "" );
        return frame;
    }

    draw(drawContext: CanvasRenderingContext2D) 
    {
        var radius = (this.rect.dr.y - this.rect.ul.y) / 3.0;
        
        var range = this.max - this.min;
        
        var origin = new Vec2(this.rect.ul.x, this.rect.dr.y - this.min * this.scale.y);

        var leftCenter= new Vec2(this.rect.ul.x, (this.rect.dr.y - this.rect.ul.y) / 2.0 + this.rect.ul.y);

        var ringPos = new Vec2(leftCenter.x - radius * 1.2, leftCenter.y);
        drawRing(drawContext, ringPos, this.values, radius, this.scale.y / 4.0, 1.0);
        if (this.selected == true) {
            this.rect.lineWidth = 4.0; 
            this.rect.draw(drawContext);
        }
        else {
            this.rect.lineWidth = 1.0; 
            this.rect.draw(drawContext);
        }
        if (this.drawMode == 0) {
            for (var i = 1; i < this.values.length; i++) {
                var a = new Vec2(origin.x + (i - 1) * this.scale.x, origin.y - this.values[i - 1] * this.scale.y);
                var b = new Vec2(origin.x + i * this.scale.x, origin.y - this.values[i] * this.scale.y);
                drawLine(drawContext, a, b, 2);
            }
        }
        else if (this.drawMode == 1) {
            var lineWidth = (this.rect.dr.x - this.rect.ul.x) / this.dataRes;
            for (var i = 0; i < this.values.length; i++) {
                var a = new Vec2(origin.x + i * this.scale.x + lineWidth / 2.0, origin.y);
                var b = new Vec2(origin.x + i * this.scale.x + lineWidth / 2.0, origin.y - this.values[i] * this.scale.y);
                drawLine(a, b, lineWidth);
            }
        }
    }


    age: number;    doUpdate(time: number) {
        throw new Error("Method not implemented.");
    }
    update(timeDiff: number): void {
        throw new Error("Method not implemented.");
    }
    handleMouse(mouse: Mouse, ev: MouseEvent) {
        throw new Error("Method not implemented.");
    }
    handleKeyboard(keyboard: Keyboard, ev: KeyboardEvent) {
        throw new Error("Method not implemented.");
    }
    setupInput(element: HTMLElement) {
        throw new Error("Method not implemented.");
    }
    handleMessage(msg: any) {
        throw new Error("Method not implemented.");
    }


}


var Wavezzz = /** @class */ (function () {
    function Wave(resolution, posx, posy, width, height, top, floor, left, right) {
        if (top === void 0) { top = 1.0; }
        if (floor === void 0) { floor = -1.0; }
        if (left === void 0) { left = 0.0; }
        if (right === void 0) { right = Math.PI * 2.0; }
        this.drawMode = 0;
        this.scaley = height / (top - floor);
        this.scalex = width / resolution;
        this.xfactor = (right - left) / resolution;
        this.pos = new Vec2(posx, posy);
        this.resolution = resolution;
        this.values = new Array(resolution);
        this.transform = new Array(resolution);
        this.rect = new Rect(this.pos.x, this.pos.y - height / 2.0, this.pos.x + width, this.pos.y + height / 2.0);
        this.selected = false;
    }
    Wave.prototype.setValues = function (arrayOfValues) {
        for (var i = 0; i < arrayOfValues.length; i++) {
            this.values[i] = arrayOfValues[i];
        }
    };
    Wave.prototype.genRandom = function () {
        var randIter = Math.random() * this.values.length / 10.0;
        for (var i = 0; i < this.values.length; i++) {
            this.values[i] = 0;
        }
        for (var j = 0; j < randIter; j++) {
            var randFreq = this.values.length * Math.random();
            var randAmp = Math.random() / 3.0;
            for (var i = 0; i < this.values.length; i++) {
                //   this.values[i] = Math.random()*Math.sin(i / this.values.length * 2.0 * Math.PI);
                this.values[i] += Math.sin(i * this.xfactor * randFreq) * randAmp;
            }
        }
    };
    Wave.prototype.select = function (value) {
        this.selected = value;
    };
    Wave.prototype.draw = function () {
        var radius = (this.rect.dr.y - this.rect.ul.y) / 2.0;
        var ringPos = new Point(this.pos.x - radius * 1.2, this.pos.y);
        drawRing(ringPos, this.values, radius * .75, this.scaley / 4.0, 1.0);
        if (this.selected == true) {
            this.rect.draw(4, '#ff0000');
        }
        else {
            this.rect.draw();
        }
        if (this.drawMode == 0) {
            for (var i = 1; i < this.values.length; i++) {
                var a = new Point(this.pos.x + (i - 1) * this.scalex, this.pos.y - this.values[i - 1] * this.scaley);
                var b = new Point(this.pos.x + i * this.scalex, this.pos.y - this.values[i] * this.scaley);
                drawLine(a, b, 2);
            }
        }
        else if (this.drawMode == 1) {
            var lineWidth = (this.rect.dr.x - this.rect.ul.x) / this.resolution;
            for (var i = 0; i < this.values.length; i++) {
                var a = new Point(this.pos.x + i * this.scalex + lineWidth / 2.0, this.pos.y);
                var b = new Point(this.pos.x + i * this.scalex + lineWidth / 2.0, this.pos.y - this.values[i] * this.scaley);
                drawLine(a, b, lineWidth);
            }
        }
    };
    Wave.prototype.setDrawMode = function (mode) {
        this.drawMode = mode;
    };
    Wave.prototype.scroll = function (dir) {
        var values = new Array(this.values.length);
        for (var i = 0; i < values.length; i++) {
            var from = i - dir;
            while (from < 0)
                from += values.length;
            while (from >= values.length)
                from -= values.length;
            values[i] = this.values[from];
        }
        this.values = values;
        this.changed = true;
    };
    Wave.prototype.getTransform = function (sinwaves, coswaves) {
        for (var freq = 0; freq < sinwaves.values.length; freq++) {
            sinwaves.values[freq] = 0;
            coswaves.values[freq] = 0;
            for (var x = 0; x < this.values.length; x++) {
                var phase = x * freq * this.xfactor;
                sinwaves.values[freq] += this.values[x] * Math.sin(phase);
                coswaves.values[freq] += this.values[x] * Math.cos(phase);
            }
            sinwaves.values[freq] /= sinwaves.values.length;
            coswaves.values[freq] /= coswaves.values.length;
        }
    };
    Wave.prototype.inverseTransform = function (sinwaves, coswaves) {
        for (var freq = 0; freq < this.values.length; freq++) {
            this.values[freq] = 0;
            for (var x = 0; x < sinwaves.values.length; x++) {
                var phase = -freq * x * this.xfactor;
                var c = Math.cos(phase) * coswaves.values[x];
                var s = Math.sin(phase) * sinwaves.values[x];
                this.values[freq] += c - s;
                //this.values[freq] += (Math.cos(phase) * coswaves.values[x] - Math.sin(phase) * sinwaves.values[x]);
            }
        }
    };
    Wave.prototype.posToIndex = function (pos) {
        var d = Math.round((pos.x - this.rect.ul.x) / (this.rect.dr.x - this.rect.ul.x) * this.resolution);
        if (d >= 0 && d < this.values.length)
            return d;
        else
            return -1;
    };
    Wave.prototype.posToValue = function (pos) {
        return (pos.y - this.pos.y) / this.scaley;
    };
    Wave.prototype.handleMouse = function (mouse) {
    };
    Wave.prototype.scale = function (factor) {
        for (var i = 0; i < this.values.length; i++) {
            this.values[i] *= factor;
        }
        this.values.forEach(function (val) {
            val *= factor;
        });
        this.changed = true;
    };
    return Wave;
}());



var WaveSim = /** @class */ (function () {
    function WaveSim() {
        var width = w / 3.0 * 2.0;
        var height = h / 4.0;
        var top = 1.0;
        var floor = -1.0;
        var resolution = 350;
        this.wave = new Wave(resolution, w / 6.0, height * 2.0 / 3.0, width, height, top, floor);
        this.wave.genRandom();
        var wave = this.wave;
        var transscale = 0.250;
        this.sinwaves = new Wave(wave.resolution / 2, wave.pos.x, wave.pos.y + height * 1.25, width, height, top * transscale, floor * transscale, wave.left, wave.right);
        this.coswaves = new Wave(wave.resolution / 2, wave.pos.x, wave.pos.y + height * 2.5, width, height, top * transscale, floor * transscale, wave.left, wave.right);
        this.sinwaves.setDrawMode(1);
        this.coswaves.setDrawMode(1);
        //  this.inverse= new Wave(wave.resolution, wave.pos.x, wave.pos.y+height * 3.25, width, height, top, floor, wave.left, wave.right);
        this.waves = [this.sinwaves, this.coswaves, this.wave /*, this.inverse*/];
        this.transform(this.sinwaves, this.coswaves);
        this.keys = new Array();
        this.keys[37] = false;
        this.keys[38] = false;
        this.keys[39] = false;
        this.keys[40] = false;
        this.ctrlClicks = false;
    }
    WaveSim.prototype.onKeyDown = function (key) {
        this.keys[key] = true;
    };
    WaveSim.prototype.onKeyUp = function (key) {
        this.keys[key] = false;
    };
    WaveSim.prototype.transform = function () {
        this.wave.getTransform(this.sinwaves, this.coswaves);
        var index = Math.random() * this.sinwaves.values.length;
        this.wave.inverseTransform(this.sinwaves, this.coswaves);
    };
    WaveSim.prototype.update = function () {
        //  this.wave.scroll(1);
        var _this = this;
        // this.transform();
        if (this.keys[17]) {
            this.ctrlClicks = true;
        }
        else {
            this.ctrlClicks = false;
        }
        this.waves.forEach(function (wave) {
            if (wave.selected == true) {
                if (_this.keys[37]) {
                    wave.scroll(-1);
                }
                if (_this.keys[39]) {
                    wave.scroll(1);
                }
                if (_this.keys[40]) {
                    wave.scale(0.97);
                }
                if (_this.keys[38]) {
                    wave.scale(1.0 / 0.97);
                }
            }
        });
        if (this.wave.changed) {
            this.wave.changed = false;
            this.wave.getTransform(this.sinwaves, this.coswaves);
        }
        else if (this.sinwaves.changed || this.coswaves.changed) {
            this.sinwaves.changed = this.coswaves.changed = false;
            this.wave.inverseTransform(this.sinwaves, this.coswaves);
        }
    };
    WaveSim.prototype.draw = function () {
        this.waves.forEach(function (wave) { wave.draw(); });
        //    this.inverse.draw();
        //  getWavePolyline(original);
        //   getWavePolyline(transfrom);
    };
    WaveSim.prototype.mouseMove = function (pos, button) {
        if (mb1Down == true) {
            this.waves.forEach(function (w) {
                var changed = false;
                if (w.rect.inside(pos) && w.selected == true) {
                    var index = w.posToIndex(pos);
                    if (index != -1) {
                        var val = w.posToValue(pos);
                        w.values[index] = -val;
                        w.changed = true;
                    }
                }
            });
        }
    };
    WaveSim.prototype.mouseDown = function (pos, button) {
        this.waves.forEach(function (w) {
            if (w.rect.inside(pos) && w.selected == true) {
                var index = w.posToIndex(pos);
                if (index != -1) {
                    var val = w.posToValue(pos);
                    w.values[index] = -val;
                    w.changed = true;
                }
            }
        });
    };
    WaveSim.prototype.mouseUp = function (pos, button) {
        var _this = this;
        this.waves.forEach(function (w) {
            if (w.rect.inside(pos)) {
                if (_this.ctrlClicks) {
                    if (w.selected == false) {
                        _this.select(w);
                    }
                    else {
                        _this.deselect(w);
                    }
                }
                else if (w.selected == false) {
                    _this.select(w);
                }
                else {
                    var index = w.posToIndex(pos);
                    if (index != -1) {
                        w.values[index] = -w.posToValue(pos);
                        w.changed = true;
                    }
                }
            }
            else {
                if (w.selected == true && _this.ctrlClicks == false) {
                    _this.deselect(w);
                }
            }
        });
    };
    WaveSim.prototype.deselect = function (wave) {
        wave.select(false);
    };
    WaveSim.prototype.select = function (wave) {
        wave.select(true);
    };
    return WaveSim;
}());
var drawServer;
function init() {
    drawServer = new DrawServer();
    drawServer.lastFrame = new Frame([getRandomPolyline(), getRandomPolyline()], 1);
}
var wavesim = new WaveSim();
function updateAndDraw() {
    wavesim.update();
    drawServer.draw(new Frame([wavesim], 1));
    //new Test().run();
}
function onMouseMove(event) {
    wavesim.mouseMove(new Point(event.clientX, event.clientY));
    //   var m = new Point(event.clientX, event.clientY);
    //    applyForces(m);
}
function onMouseDown(event) {
    mb1Down = true;
    wavesim.mouseDown(new Point(event.clientX, event.clientY));
}
function onMouseUp(event) {
    wavesim.mouseUp(new Point(event.clientX, event.clientY));
    mb1Down = false;
    var m = new Point(event.clientX, event.clientY);
    var mp = new Point((event.clientX), (event.clientY));
    worldPt = getWorldPoint(mp.x, mp.y, scale.x, scale.y, d.x, d.y);
    var sp = getScreenPoint(worldPt.x, worldPt.y, scale.x, scale.y, d.x, d.y);
    d.x -= scale.x * (m.x - w / 2.0);
    d.y -= scale.y * (m.y - h / 2.0);
    drawText("mouse:" + mp.x + " " + mp.y, m.x, m.y, 0);
    drawText("world:" + worldPt.x + " " + worldPt.y, m.x, m.y, 1);
    drawText("diff:" + d.x + " " + d.y, m.x, m.y, 2);
    drawText("scale:" + scale.x + " " + scale.y, m.x, m.y, 3);
    drawText("screen:" + sp.x + " " + sp.y, m.x, m.y, 4);
}
function onWheel(event) {
    var mp = new Point(event.clientX - w / 2.0, event.clientY - h / 2.0);
    var MULT = 1.074;
    if (event.deltaY < 0) {
        scale.x *= MULT;
        scale.y *= MULT;
    }
    else {
        scale.x /= MULT;
        scale.y /= MULT;
    }
    // draw();
}


//where world is drawn as:
//  
function getWorldPoint(mx, my, sx, sy, dx, dy) {
    return new Point((mx + dx) * sx, (my + dy) * sy);
}
function getScreenPoint(wpx, wpy, sx, sy, dx, dy) {
    return new Point((wpx + dx) / sx + w / 2.0, (wpy + dy) / sy + h / 2.0);
}