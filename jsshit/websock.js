var c = document.getElementById("c");

c.addEventListener("wheel", onWheel);
c.addEventListener("mouseup", onMouseUp);
c.addEventListener("mouse", onMouseMove);

c.width= window.innerWidth;
c.height=window.innerHeight;



var w = c.width;
var h = c.height;
var lineWidth = 16.0;
var lineLength = 20.0;

var SX = Math.round(w / lineLength);
var SY = Math.round(h / lineLength);

var ctx = c.getContext("2d");


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

    draw()
    {
        var points = [this.ul, new Point(this.dr.x, this.ul.y), this.dr, new Point(this.ul.x, this.dr.y)];
        
        for (var i = 0; i < 4; i++)
        {
            var next = i+1;
            if (next >= 4) next = 0;

            drawLine(points[i], points[next]);
        }
    }

    inside(pos)
    {
        if (pos.x > this.ul.x && pos.x < this.dr.x)
        {
        //    if (pos.x < this.dr.x && pos.y )
        }
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
        this.transform = new Array(resolution * 2);
        this.rect = new Rect(this.pos.x,       this.pos.y - height/2.0, 
                             this.pos.x+width, this.pos.y + height/2.0);
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


    draw()
    {
        this.rect.draw();

        if (this.drawMode == 0)
        {         
            for (var i = 1; i < this.values.length; i++)
            {
                var a = new Point(this.pos.x + (i - 1) * this.scalex, this.pos.y - this.values[i - 1] * this.scaley);
                var b = new Point(this.pos.x + i * this.scalex, this.pos.y - this.values[i] * this.scaley);
                drawLine(a,b, 2);
            }
        }
        else
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
            while (from > values.length) from -= values.length;
            
            values[i] = this.values[from];
        }
        this.values = values;
    }

    getTransform(sinwaves, coswaves)
    {
      
        for (var freq = 0; freq < this.values.length; freq++)
        {
            sinwaves.values[freq] = 0;
            coswaves.values[freq] = 0;
         
            for (var x = 0; x < this.values.length; x++)
            {
                sinwaves.values[freq] += this.values[x] * Math.sin(freq*x*this.xfactor);
                coswaves.values[freq] += this.values[x] * Math.cos(freq*x*this.xfactor);
            }  
            sinwaves.values[freq] /= this.values.length;
            coswaves.values[freq] /= this.values.length;    
        }
    }

    inverseTransform(sinwaves, coswaves)
    {
        for (var freq = 0; freq < this.values.length; freq++)
        {
            this.values[freq] = 0;
            for (var x = 0; x < this.values.length; x++)
            {
                var phase=-freq*x*this.xfactor;
                this.values[freq] += (Math.cos(phase) * coswaves.values[x] - Math.sin(phase) * sinwaves.values[x]);
             
            }
        }

    }

    handleMouse(mouse)
    {


    }
}


class WaveSim
{
    constructor()
    {
        var width = w/2.0;
        var height = 200;
        var top = 1.0;
        var floor = -1.0;
        this.wave = new Wave(130.0,w/8.0, 200, width, height, top, floor);
        this.wave.genRandom();

        var wave = this.wave;
    
        var transscale = 1.0;
        this.sinwaves = new Wave(wave.resolution, wave.pos.x, wave.pos.y+height*1.25, width, height, top*transscale, floor*transscale, wave.left, wave.right);
        this.coswaves = new Wave(wave.resolution, wave.pos.x, wave.pos.y+height*2.5, width, height, top*transscale, floor*transscale, wave.left, wave.right);

        this.sinwaves.setDrawMode(1);
        this.coswaves.setDrawMode(1);

        this.inverse= new Wave(wave.resolution, wave.pos.x, wave.pos.y+height * 3.25, width, height, top, floor, wave.left, wave.right);
    
        this.waves = [this.sinwaves, this.coswaves, this.wave, this.inverse];
    }

    transform()
    {
        this.wave.getTransform(this.sinwaves, this.coswaves);
       
        this.inverse.inverseTransform(this.sinwaves, this.coswaves);
    }



    update()
    {
   
        this.wave.scroll(1);
        this.transform();
    }

    draw()
    {

        this.wave.draw();
        this.sinwaves.draw();
        this.coswaves.draw();
        this.inverse.draw();
     //  getWavePolyline(original);
     //   getWavePolyline(transfrom);

 
    }

    handleMouse(pos, lbdown)
    {
        for (var w in waves)
        {
            w.handleMouse(pos, lbdown);
        }        
    }

    

}

var drawServer;
function init()
{
    drawServer = new DrawServer();
    drawServer.lastFrame = new Frame([getRandomPolyline(), getRandomPolyline()], 1);
}

var wavesim = new WaveSim();
function updateAndDraw()
{

    wavesim.update();
    drawServer.draw(new Frame([wavesim], 1));
    //new Test().run();
}


















function onMouseMove(event)
{
 //   var m = new Point(event.clientX, event.clientY);
    
//    applyForces(m);
}

function drawLine(from, to, width=1,color=0)
{
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
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
        (wpx+dx) / sx+width/2.0,
        (wpy+dy) / sy+height/2.0
    );
}

var worldPt=null;


function drawText(text, x,y,lineNum)
{
    ctx.fillText(text, x,y+lineNum*20);
}
function onMouseUp(event)
{
 
    var m = new Point(event.clientX, event.clientY);
    var mp = new Point((event.clientX), (event.clientY));
    
    worldPt = getWorldPoint(mp.x, mp.y, scale.x, scale.y, d.x, d.y); 
    var sp = getScreenPoint(worldPt.x, worldPt.y, scale.x, scale.y, d.x, d.y);
    d.x-=scale.x*(m.x-width/2.0);
    d.y-=scale.y*(m.y-height/2.0);


    drawText("mouse:" + mp.x + " " + mp.y, m.x, m.y,0);
    drawText("world:" +worldPt.x + " " + worldPt.y, m.x, m.y,1);
    drawText("diff:"+d.x + " " + d.y, m.x, m.y,2);
    drawText("scale:"+scale.x + " " +scale.y, m.x, m.y,3);
    drawText("screen:"+sp.x+" "+sp.y, m.x,m.y,4);
}

function onWheel(event)
{   
    var mp = new Point(event.clientX - width / 2.0, event.clientY - height / 2.0);
   
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


//setInterval(drawCurve, )

//drawCurve();
init();

setInterval(updateAndDraw, 10);
