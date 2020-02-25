var c = document.getElementById("c");

c.addEventListener("wheel", onWheel);
c.addEventListener("mouseup", onMouseUp);
c.addEventListener("mousedown", onMouseDown);
c.addEventListener("mousemove", onMouseMove);

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

c.width= window.innerWidth-100;
c.height=window.innerHeight-100;



var w = c.width;
var h = c.height;
var lineWidth = 16.0;
var lineLength = 20.0;

var SX = Math.round(w / lineLength);
var SY = Math.round(h / lineLength);

var ctx = c.getContext("2d");

var mb1Down = false;
var mb2Down = false;


function getRandomColor()
{
   var letters = "0123456789ABCDEF"; 
  
    // html color code starts with # 
    var color = '#'; 
  
    // generating 6 times as HTML color code consist 
    // of 6 letter or digits 
    for (var i = 0; i < 6; i++) 
       color += letters[(Math.floor(Math.random() * 16))]; 
   
   return color;
}

function getRandomPolyline()
{
    var points = [];

    var numPoints = 80;
    var angle = (1.0 / numPoints) * 2.0 * Math.PI;
    var centerX = 300;
    var centerY = 300;
    for (var i = 0; i < numPoints; i++)
    {
        var s = Math.sin(i * angle);
        var c = Math.cos(i * angle);
        var radius = Math.random() * centerX / 2.0 + 100.0;
        points.push(new Point(c * radius + centerX, s * radius + centerY));

    }
    return polyLine = new Polyline(points, 8.0, getRandomColor());
}

class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
}

class Line 
{
    //point a,b
    constructor(a,b, width=1.0, color='#00000')
    {
        this.a = a;
        this.b = b;
        this.type = "Line";
        this.color = color;
    }

    draw()
    {
        drawLine(this.a, this.b, this.width, this.color);
    }
}

class Polyline
{
    constructor(points=[], width=1.0, color='#000000' )
    {
        this.points = points;
        this.width = width;
        this.color = color;
        this.type = "Polyline";
    }

    draw()
    {
        var prev = null;
        for (var point of this.points)
        {
            if (prev != null)
            {
                drawLine(prev, point, this.width, this.color);
            }
            prev = point;
        }
    }
}



class Test
{
    run() 
    {   
        var polyLine = getRandomPolyline();    
        polyLine.draw(); 
        var str=  JSON.stringify(polyLine);
        console.log(str);   
    }

}


var scale = new Point(1.0, 1.0);
var d = new Point(0,0);


function crop(f, sx, sy)
{
    while (f.x < 0)
    {
        f.x += sx;
    }
    while (f.y < 0)
    {
        f.y += sy;
    }

    while (f.x >= sx)
    {
        f.x -= sx;
    }
    while (f.y >= sy)
    {
        f.y -= sy;
    }
    return new Point(f.x, f.y);
}


class Frame
{
    constructor(drawObjects=[], clear, timestamp)
    {
        this.drawObjects = drawObjects;
        this.clear = clear;
        this.timestamp = timestamp;
        this.type = "Frame";
    }

    addObject(drawObject)
    {
        //check if is drawable type?
        this.drawObjects.push(drawObject);
    }
}

class DrawServer
{
    constructor()
    {
        //init websocket? 
       // this.webSocket = new WebSocket("ws://localhost:8765");
      
       /*
        this.webSocket.onmessage = function(event) {
            var msg = JSON.parse(event.data);

            if (msg.type == "Frame")
            {
                Object.setPrototypeOf(msg, Frame.prototype);
                drawServer.lastFrame = msg;
          
            }
        }
        */
    }

    draw(frame)
    {
     
     //   var jsonFrame = JSON.stringify(frame);


       // frame = this.frameFromJson(jsonFrame);
   //     console.log(jsonFrame);
        if (frame.clear)
        {
            ctx.clearRect(0,0,SX*lineLength, SY *lineLength);

        }
        frame.drawObjects.forEach(item=> {
            switch (item.type)
            {
                case "Polyline":
                    Object.setPrototypeOf(item , Polyline.prototype);
             
                break;
                case "Line":
                    Object.setPrototypeOf(item, Line.prototype);
                break;
                default:
                    break;
            }
            item.draw();
        });
    }

    frameFromJson(jsonFrame)
    {
        var frame = JSON.parse(jsonFrame);
        return frame;
    }
}

class Rect
{
    constructor(ulx, uly, drx, dry)
    {
        this.ul = new Point(ulx, uly);
        this.dr = new Point(drx, dry);
    }

    draw(width = 1, color='#000000')
    {
        var points = [this.ul, new Point(this.dr.x, this.ul.y), this.dr, new Point(this.ul.x, this.dr.y)];
        
        for (var i = 0; i < 4; i++)
        {
            var next = i+1;
            if (next >= 4) next = 0;

            drawLine(points[i], points[next], width, color);
        }
    }

    inside(pos)
    {
        if (pos.x >= this.ul.x && pos.x <= this.dr.x && pos.y >= this.ul.y && pos.y <= this.dr.y)
        {
           
            return true;
        }
        return false;
    }
}

class Wave 
{
    constructor(resolution, posx, posy, width, height, top=1.0, floor=-1.0, left=0.0, right=Math.PI*2.0)
    {
        this.drawMode = 0;
        this.scaley = height / (top - floor);
        this.scalex = width / resolution
        this.xfactor = (right - left) / resolution;
        this.pos = new Point(posx, posy);
        this.resolution = resolution;
        this.values = new Array(resolution);
        this.transform = new Array(resolution);
        this.rect = new Rect(this.pos.x,       this.pos.y - height/2.0, 
                             this.pos.x+width, this.pos.y + height/2.0);
        this.selected = false;
    }

    setValues(arrayOfValues)
    {
        for (var i = 0; i < arrayOfValues.length; i++)
        {
            this.values[i] = arrayOfValues[i];
        }
        calculateTransform();
    }
    
    genRandom()
    {
       var randIter = Math.random()  * this.values.length/10.0;
       for (var i = 0; i < this.values.length; i++)
       {
           this.values[i] = 0;
       }
        for (var j = 0; j < randIter; j++)
        {
            var randFreq = this.values.length*Math.random();
            var randAmp = Math.random()/3.0;


            for (var i = 0; i < this.values.length; i++)
            {
             //   this.values[i] = Math.random()*Math.sin(i / this.values.length * 2.0 * Math.PI);
                this.values[i] +=  Math.sin(i * this.xfactor * randFreq) * randAmp; 
                
            }
        }
    }

    select(value)
    {
        this.selected = value;
    }

    draw()
    {
        var radius = (this.rect.dr.y - this.rect.ul.y)/2.0;
        var ringPos = new Point(this.pos.x - radius*1.2, this.pos.y);
        drawRing(ringPos, this.values, radius*.75, this.scaley/4.0, 1.0);
        

        if (this.selected == true)
        {
            this.rect.draw(4, '#ff0000');
        }
        else
        {
            this.rect.draw();
        }
        if (this.drawMode == 0)
        {         
            for (var i = 1; i < this.values.length; i++)
            {
                var a = new Point(this.pos.x + (i - 1) * this.scalex, this.pos.y - this.values[i - 1] * this.scaley);
                var b = new Point(this.pos.x + i * this.scalex, this.pos.y - this.values[i] * this.scaley);
                drawLine(a,b, 2);
            }
        }
        else if (this.drawMode == 1)
        {
            var lineWidth = (this.rect.dr.x - this.rect.ul.x) / this.resolution;
            for (var i = 0; i < this.values.length; i++)
            {
                var a = new Point(this.pos.x + i * this.scalex+lineWidth/2.0, this.pos.y);
                var b = new Point(this.pos.x + i * this.scalex+lineWidth/2.0, this.pos.y - this.values[i] * this.scaley);
                drawLine(a,b, lineWidth);           
            }
        }
    }


    setDrawMode(mode)
    {
        this.drawMode = mode;

    }


    scroll(dir)
    {
        var values = new Array(this.values.length);
        for (var i = 0; i < values.length; i++)
        {
            var from = i - dir;
            while (from < 0) from += values.length;
            while (from >= values.length) from -= values.length;
            
            values[i] = this.values[from];
        }
        this.values = values;
        this.changed = true;
    }

    getTransform(sinwaves, coswaves)
    {
        for (var freq = 0; freq < sinwaves.values.length; freq++)
        {
            sinwaves.values[freq] = 0;
            coswaves.values[freq] = 0;
         
            for (var x = 0; x < this.values.length; x++)
            {
                var phase=x*freq*this.xfactor;
                sinwaves.values[freq] += this.values[x] * Math.sin(phase);
                coswaves.values[freq] += this.values[x] * Math.cos(phase);
            }  
            sinwaves.values[freq] /= sinwaves.values.length;
            coswaves.values[freq] /= coswaves.values.length;    
        }
    }

    inverseTransform(sinwaves, coswaves)
    {
        for (var freq = 0; freq < this.values.length; freq++)
        {
            this.values[freq] = 0;
            for (var x = 0; x < sinwaves.values.length; x++)
            {
                var phase=-freq*x*this.xfactor;
                var c = Math.cos(phase) * coswaves.values[x];
                var s = Math.sin(phase) * sinwaves.values[x];

                
                                
                this.values[freq] += c - s;
                
                //this.values[freq] += (Math.cos(phase) * coswaves.values[x] - Math.sin(phase) * sinwaves.values[x]);
             
            }
        }

    }

    posToIndex(pos)
    {

        var d = Math.round((pos.x - this.rect.ul.x) / (this.rect.dr.x - this.rect.ul.x) * this.resolution);
        
        if (d >= 0 && d < this.values.length) return d;
        else return -1;
    }

    posToValue(pos)
    {
        return (pos.y - this.pos.y) / this.scaley ;

    }


    handleMouse(mouse)
    {


    }

    scale(factor)
    {
        for (var i = 0; i < this.values.length; i++)
        {
            this.values[i] *= factor;
        }
        this.values.forEach(val => {
            val *= factor;
        });
        this.changed = true;
    }
}


class WaveSim
{
    constructor()
    {
        var width = w/3.0 * 2.0;
        var height = h / 4.0;
        var top = 1.0;
        var floor = -1.0;
        var resolution = 350;
        this.wave = new Wave(resolution,w/6.0, height * 2.0 / 3.0, width, height, top, floor);
        this.wave.genRandom();

        var wave = this.wave;
    
        var transscale =0.250;
        this.sinwaves = new Wave(wave.resolution/2, wave.pos.x, wave.pos.y+height*1.25, width, height, top*transscale, floor*transscale, wave.left, wave.right);
        this.coswaves = new Wave(wave.resolution/2, wave.pos.x, wave.pos.y+height*2.5, width, height, top*transscale, floor*transscale, wave.left, wave.right);

        this.sinwaves.setDrawMode(1);
        this.coswaves.setDrawMode(1);

      //  this.inverse= new Wave(wave.resolution, wave.pos.x, wave.pos.y+height * 3.25, width, height, top, floor, wave.left, wave.right);
    
        this.waves = [this.sinwaves, this.coswaves, this.wave/*, this.inverse*/];

        this.transform(this.sinwaves, this.coswaves);

        this.keys = new Array();
        this.keys[37] = false;
        this.keys[38] = false;
        this.keys[39] = false;
        this.keys[40] = false;


        this.ctrlClicks = false;
    }

    onKeyDown(key)
    {
        this.keys[key] = true;

    }

    onKeyUp(key)
    {
        this.keys[key] = false;
    }

    transform()
    {
        this.wave.getTransform(this.sinwaves, this.coswaves);
        var index = Math.random()* this.sinwaves.values.length;

        this.wave.inverseTransform(this.sinwaves, this.coswaves);

    }



    update()
    {
   
      //  this.wave.scroll(1);
        
       // this.transform();
      if (this.keys[17])
        {
            this.ctrlClicks = true;
        }
        else 
        {
            this.ctrlClicks = false;
        }
        this.waves.forEach (wave => {

            if (wave.selected == true)
            {
  
                if (this.keys[37]) 
                {
                    wave.scroll(-1);
                }
                if (this.keys[39])
                {
                    wave.scroll(1);
                }

                if (this.keys[40])
                {
                    wave.scale(0.97);
                }

                if (this.keys[38])
                {
                    wave.scale(1.0/0.97);
                }
            }

        });

        if (this.wave.changed)
        {
            this.wave.changed = false;
            this.wave.getTransform(this.sinwaves, this.coswaves);

        }
        else if (this.sinwaves.changed || this.coswaves.changed)
        {
            this.sinwaves.changed = this.coswaves.changed = false;
            this.wave.inverseTransform(this.sinwaves, this.coswaves);
        }
        
    }
    draw()
    {

        this.waves.forEach(wave => { wave.draw();});
        
    //    this.inverse.draw();
     //  getWavePolyline(original);
     //   getWavePolyline(transfrom);

 
    }

    mouseMove(pos,button)
    {
       
        if (mb1Down == true)
        {
            this.waves.forEach(w => 
            {
                var changed = false;
                if (w.rect.inside(pos) && w.selected == true)
                {
                    var index = w.posToIndex(pos);
                    if (index != -1)
                    {
                        var val = w.posToValue(pos);
                        w.values[index] = -val;
                        w.changed = true;
                    }
                }
            }); 
        }
    }

    mouseDown(pos,button)
    {
        this.waves.forEach(w => 
        {
            if (w.rect.inside(pos) && w.selected == true)
            {
                var index = w.posToIndex(pos);
                if (index != -1)
                {
                    var val = w.posToValue(pos);
                    w.values[index] = -val;
                    w.changed = true;
                }
            }
        });
    }

    mouseUp(pos,button)
    {
        this.waves.forEach(w =>
        {

            if (w.rect.inside(pos))
            {
                if (this.ctrlClicks)
                {
                    if (w.selected == false)
                    {
                        this.select(w);
                    }
                    else
                    {
                        this.deselect(w);
                    }
                }
                else if (w.selected == false)
                {
                    this.select(w);
                }
                else
                {
               
                    var index = w.posToIndex(pos);
                    if (index != -1)
                    {
                        w.values[index] = -w.posToValue(pos);
                        w.changed = true;
                    }
                }
            }
            else
            {
                if (w.selected == true && this.ctrlClicks == false)
                {
                    this.deselect(w);
                }
            }
        });
    }

    
    deselect(wave)
    {
        wave.select(false);
    }

    select(wave)
    {
        wave.select(true);
    }

}

var drawServer;
function init()
{
    drawServer = new DrawServer();
    drawServer.lastFrame = new Frame([getRandomPolyline(), getRandomPolyline()], 1);
}


function updateAndDraw()
{

    wavesim.update();
    drawServer.draw(new Frame([wavesim], 1));
    //new Test().run();
}

function onMouseMove(event)
{
    wavesim.mouseMove(new Point(event.clientX, event.clientY));
 //   var m = new Point(event.clientX, event.clientY);
    
//    applyForces(m);
}
function onMouseDown(event)
{
    audioCtx.resume();
    mb1Down = true;
    wavesim.mouseDown(new Point(event.clientX, event.clientY));
}

function onMouseUp(event)
{

    wavesim.mouseUp(new Point(event.clientX, event.clientY));
    mb1Down = false; 
    var m = new Point(event.clientX, event.clientY);
    var mp = new Point((event.clientX), (event.clientY));
    
    worldPt = getWorldPoint(mp.x, mp.y, scale.x, scale.y, d.x, d.y); 
    var sp = getScreenPoint(worldPt.x, worldPt.y, scale.x, scale.y, d.x, d.y);
    d.x-=scale.x*(m.x-w/2.0);
    d.y-=scale.y*(m.y-h/2.0);


    drawText("mouse:" + mp.x + " " + mp.y, m.x, m.y,0);
    drawText("world:" +worldPt.x + " " + worldPt.y, m.x, m.y,1);
    drawText("diff:"+d.x + " " + d.y, m.x, m.y,2);
    drawText("scale:"+scale.x + " " +scale.y, m.x, m.y,3);
    drawText("screen:"+sp.x+" "+sp.y, m.x,m.y,4);
}


function onWheel(event)
{   
    var mp = new Point(event.clientX - w / 2.0, event.clientY - h / 2.0);
   
    var MULT = 1.074;

    if (event.deltaY < 0)
    {
        scale.x *= MULT;
        scale.y *= MULT;
    }
    else 
    {
        scale.x /= MULT;
        scale.y /= MULT;
    }
   // draw();
}



function drawLine(from, to, width=1,color='#000000')
{
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
}



function drawRing(pos, values, radius, fscale = 1.0, lineWidth = 1.0, lineColor = '#000000')
{
    var aDiff = 1.0/ values.length * Math.PI * 2.0;
    var a = 0.0;
    var prevPt = null;
    var firstPt = null;
    for (var i = 0; i < values.length; i++)
    {

        var fval = values[i];

        var pt = new Point(pos.x + Math.cos(a) * (radius + fval*fscale), pos.y + Math.sin(a) * (radius + fval*fscale));
        if (prevPt != null)
        {
            drawLine(prevPt, pt, 3.0);
        }
        else 
        {
            firstPt = pt;
        }
        
        prevPt = pt;
        a += aDiff;
    }
    drawLine(prevPt, firstPt);

}

//where world is drawn as:
//  
function getWorldPoint(mx, my, sx, sy, dx, dy)
{
    return new Point(
        (mx+dx)*sx,
        (my+dy)*sy
    );
}

function getScreenPoint(wpx, wpy,sx,sy,dx,dy)
{
    return new Point(
        (wpx+dx) / sx+w/2.0,
        (wpy+dy) / sy+h/2.0
    );
}

var worldPt=null;

function drawText(text, x,y,lineNum)
{
    ctx.fillText(text, x,y+lineNum*20);
}


function onKeyDown(event)
{
    
    wavesim.onKeyDown(event.keyCode);

}

function onKeyUp(event)
{
    wavesim.onKeyUp(event.keyCode);

}


var wavesim = new WaveSim();

















//setInterval(drawCurve, )

//drawCurve();
init();

setInterval(updateAndDraw, 10);










