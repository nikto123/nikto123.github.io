import { drawRing, Vec2, Rect, Frame, Polyline, drawLine, drawText } from './graphics';
import { AppObject, Keyboard, Mouse } from './engine';
import { Key } from '../node_modules/ts-keycode-enum/dist/declarations/Key.enum';


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

    age: number;
    changed: boolean;
    
    xfactor:number;

    constructor(rect:Rect, dataRes:number, min:number, max:number)
    {
        this.dataRes = dataRes;
        this.values = new Array(this.dataRes);

        this.min = min;
        this.max = max;
       
        var range = Math.abs(max - min);

        this.scale= new Vec2(Math.abs(rect.dr.x - rect.ul.x) / this.dataRes, range != 0 ? 1.0 / range : 0.0000000001);
        this.rect = rect;

        this.xfactor = (this.rect.dr.x - this.rect.dr.y) / dataRes;
    }

    setValues(arrayOfValues:number[]) 
    {
        //asi kktina, mozno assign pola? kopy teraz napicu nemusia sediet pocty LOWPRIO 
        for (var i = 0; i < arrayOfValues.length; i++) 
        {
            this.values[i] = arrayOfValues[i];
        }
    };

    scaleBy(factor: number)
    {
        this.values.forEach(value => () =>{ value *= factor; });
    }
    select(value:boolean) 
    {
        this.selected = value;
    }

    setDrawMode(mode:WaveDrawMode) 
    {
        this.drawMode = mode;
    }



    getPolyline(): Polyline
    {
        var line: Polyline;
    
        var x =  this.rect.ul.x;
        var xInc =  this.rect.getWidth() / this.values.length;
        var yZero = this.rect.dr.y - this.min * this.scale.y;

        for (var i = 0; i < this.values.length; i++)
        { 
            line.addPoint(new Vec2(x,  yZero - this.values[i] * this.scale.y));
            x += xInc;
        }

        return line;
    }

    getFrame(): Frame {
        return new Frame([ this.getPolyline()], true, "");
    }

    draw(drawContext: CanvasRenderingContext2D) 
    {
        var radius = (this.rect.dr.y - this.rect.ul.y) / 3.0;
                
        var origin = this.getOrigin();

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
                drawLine(drawContext, a, b, lineWidth);
            }
        }
    }

    
    scroll(dir:number) 
    {
        var shifted = new Array(this.values.length);
        for (var i = 0; i < shifted.length; i++) {
            var from = i - dir;
            while (from < 0)
                from += shifted.length;
            while (from >= shifted.length)
                from -= shifted.length;
                shifted[i] = this.values[from];
        }
        this.values = shifted;
        this.changed = true;
    };


    genRandom() 
    {
        var randIter = Math.random() * this.values.length / 10.0;
        for (var i = 0; i < this.values.length; i++) {
            this.values[i] = 0;
        }
        for (var j = 0; j < randIter; j++) {
            var randFreq = this.values.length * Math.random();
            var randAmp = Math.random() / 3.0;
            for (var i = 0; i < this.values.length; i++) {
                //   this.values[i] = Math.random()*Math.sin(i / this.values.length * 2.0 * Math.PI);
                this.values[i] += Math.sin(i * this.scale.x * randFreq) * randAmp;
            }
        }
    };

    getTransform = function (sinwaves:Wave, coswaves:Wave) 
    {
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

    inverseTransform = function (sinwaves:Wave, coswaves:Wave) 
    {
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


    posToIndex(pos:Vec2) 
    {
        var d = Math.round((pos.x - this.rect.ul.x) / (this.rect.dr.x - this.rect.ul.x) * this.dataRes);
        if (d >= 0 && d < this.values.length)
            return d;
        else
            return -1;
    };
    
    getOrigin():Vec2
    {   
        return new Vec2(this.rect.ul.x, this.rect.dr.y - this.min * this.scale.y);
    }

    posToValue(pos:Vec2) 
    {
        return (pos.y - this.getOrigin().y) / this.scale.y;
    };
    
    scaleWave(factor:number) {
        for (var i = 0; i < this.values.length; i++) {
            this.values[i] *= factor;
        }
        this.values.forEach(function (val) {
            val *= factor;
        });
        this.changed = true;
    };


    doUpdate(time: number) {

    }

    update(timeDiff: number): void {

    }

    handleMouse(mouse: Mouse, ev: MouseEvent) {

    }

    handleKeyboard(keyboard: Keyboard, ev: KeyboardEvent) {

    }
    setupInput(element: HTMLElement) {

    }
    handleMessage(msg: any) {

    }
}


class WaveSim implements AppObject
{
    waves: Array<Wave>;
    mainWave: Wave;
    sinWaves: Wave;
    cosWaves: Wave;
    age: number;
    type: string;

    mouse: Mouse;
    kb: Keyboard;

    constructor(winWidth:number, winHeight:number, mouse:Mouse, keyboard:Keyboard)
    {
        this.mouse = mouse;
        this.kb = keyboard;

        var numWaves = 4.0;

        var origin = new Vec2(winWidth / 3.0, winHeight / numWaves);

        var wavesWidth = (winWidth - origin.x*2.0);
        var wavesHeight = (winHeight - origin.y*2.0)/numWaves;
    
        var y = 0;
        var fillY = 0.9;

        this.waves.push(new Wave(new Rect(origin.x, y, origin.x + wavesWidth, y + wavesHeight * fillY), 100, -1.0, 1.0));
        y += wavesHeight;
        this.waves.push(new Wave(new Rect(origin.x, y, origin.x + wavesWidth, y + wavesHeight * fillY), 100, -1.0, 1.0));
        y += wavesHeight;
        this.waves.push(new Wave(new Rect(origin.x, y, origin.x + wavesWidth, y + wavesHeight * fillY), 100, -1.0, 1.0));


        this.mainWave = this.waves[0];
        this.sinWaves = this.waves[1];
        this.cosWaves = this.waves[2];

        this.sinWaves.setDrawMode(1);
        this.cosWaves.setDrawMode(1);
        //  this.inverse= new Wave(wave.resolution, wave.pos.x, wave.pos.y+height * 3.25, width, height, top, floor, wave.left, wave.right);
    }

    getFrame(): Frame 
    {
        throw new Error("Method not implemented.");
    }    

    transform() 
    {
        this.mainWave.getTransform(this.sinWaves, this.cosWaves);
        var index = Math.random() * this.sinWaves.values.length;
        this.mainWave.inverseTransform(this.sinWaves, this.cosWaves);
    };

    draw(drawContext: CanvasRenderingContext2D) {
        this.waves.forEach(function (wave) { wave.draw(drawContext); });
        //    this.inverse.draw();
        //  getWavePolyline(original);
        //   getWavePolyline(transfrom);
    }

    doUpdate(time: number) 
    {
        throw new Error("Method not implemented.");
    }

    update(timeDiff: number): void 
    {
        
        //  this.wave.scroll(1);
    
        // this.transform();


        this.waves.forEach(function (wave) 
        {
            if (wave.selected == true) {
                if (this.keys[37]) {
                    wave.scroll(-1);
                }
                if (this.keys[39]) {
                    wave.scroll(1);
                }
                if (this.keys[40]) {
                    wave.scaleBy(0.97);
                }
                if (this.keys[38]) {
                    wave.scaleBy(1.0 / 0.97);
                }
            }
        });
        if (this.mainWave.changed) 
        {
            this.mainWave.changed = false;
            this.mainWave.getTransform(this.sinWaves, this.cosWaves);
        }
        else if (this.sinWaves.changed || this.cosWaves.changed) 
        {
            this.sinWaves.changed = this.cosWaves.changed = false;
                  this.mainWave.inverseTransform(this.sinWaves, this.cosWaves);
        }
      
    }

    handleMouse(mouse: Mouse, ev: MouseEvent) 
    {
        
    }

    handleKeyboard(keyboard: Keyboard, ev: KeyboardEvent) 
    {
        
    }

    setupInput(element: HTMLElement) 
    {
        let obj = this;

        this.mouse.onDown = function(button: number, mouse:Mouse) {
            obj.waves.forEach(function (w) {
                if (w.rect.inside(mouse.pos)) 
                {
                    
                    if (w.selected == false)
                    {
                        //
                    }
                }
            });
        }

        this.mouse.onUp = function (button: number, mouse:Mouse) {
         
            this.waves.forEach(function (w) {
                if (w.rect.inside(mouse.pos)) {
                    if (obj.kb.getKey(Key.Ctrl)) {
                        if (w.selected == false) {
                            obj.select(w);
                        }
                        else {
                            obj.deselect(w);
                        }
                    }
                    else if (w.selected == false) {
                        obj.select(w);
                    }
                    else {
                        var index = w.posToIndex(mouse.pos);
                        if (index != -1) {
                            w.values[index] = -w.posToValue(mouse.pos);
                            w.changed = true;
                        }
                    }
                }
                else {
                    if (w.selected == true && obj.kb.getKey(Key.Ctrl) == false) {
                        obj.deselect(w);
                    }
                }
            });
        }

        this.mouse.onStartDrag = function (button: number, mouse: Mouse) {

        }

        this.mouse.onEndDrag = function (button: number, mouse: Mouse) {

        }

        this.mouse.onDrag = function (button: number, mouse:Mouse) { 
            if (obj.mouse.bState[0] == true) {
                obj.waves.forEach(function (w) {
                    if (w.rect.inside(mouse.pos) && w.selected == true) {

                        //get lastpos x, lastpos y, range, flip, fill between
                        var index = w.posToIndex(mouse.pos);
                        var lastIndex = w.posToIndex(mouse.lastPos);

                        if (lastIndex >= 0 && lastIndex < obj.waves.length)
                        {
                            if (lastIndex > index)
                            {
                                var tmp = lastIndex;
                                index = lastIndex;
                                lastIndex = tmp;
                            }
                            var lastVal = w.posToValue(mouse.lastPos);
                            let val = w.posToValue(mouse.pos);


                            let xd = index - lastIndex;
                            let diff = (val - lastVal);

                            if (xd > 0) diff /= xd;
                            
                            for (var i = lastIndex; i <= index; i++)
                            {
                                w.values[i] = lastVal;
                                lastVal += diff;
                            }
                            w.changed = true;
                        }
                    }
                });
            }
        }
    }
    deselect(wave:Wave) {
        wave.select(false);
    };
    select(wave:Wave) {
        wave.select(true);
    };
    handleMessage(msg: any) 
    {

    }

 

}

var WaveSinn = /** @class */ (function () {
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