var c = document.getElementById("c");
c.addEventListener("wheel", onWheel);
c.addEventListener("mouseup", onMouseUp);
c.addEventListener("mousedown", onMouseDown);

c.addEventListener("mousemove", onMouseMove);

c.width= window.innerWidth;
c.height=window.innerHeight;


var width = c.width;
var height = c.height;
var lineWidth =3.0;
var lineLength = 20.0;

var SX = Math.round(width / lineLength);
var SY = Math.round(height / lineLength);

var ctx = c.getContext("2d");

var mDown = false;


class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
}
var m = new Point(0,0);
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
class Magnet
{
    constructor(x,y,angle)
    {
        this.pos = new Point(x,y);
        this.angle = angle;
        this.aVel = 0.0;
        this.length = lineLength;
    }

    addForce(other)
    {
        var diff = other.angle - this.angle;
        this.aVel += diff / ( 2.0 * Math.PI);
        this.aVel *= 0.984;
    }

    applyForce()
    {
        this.angle +=Math.sin(this.aVel)/4.0;
        while (this.angle > 2.0*Math.PI)
        {
            this.angle -= 2.0* Math.PI;
        }
        while (this.angle < 0.0)
        {
            this.angle += 2.0*Math.PI;
        }
    }
    update()
    {
        for (var x = -1; x < 2; x++)
            for (var y = -1; y < 2; y++)
            {
                if (!x && !y) continue;
                var f = new Point(x+this.pos.x, y+this.pos.y);
                f = crop(f, SX, SY);              
                this.addForce(field[f.x][f.y]);
            }
    }

    draw()
    {
        var c = Math.cos(this.angle)/2;
        var s = Math.sin(this.angle)/2;
      
       drawLine(new Point((this.pos.x-c)*this.length, (this.pos.y-s) * this.length),
                new Point((this.pos.x + c) * this.length, 
                          (this.pos.y + s) * this.length),
                lineWidth
       );
    }
}


var field = [];
function init()
{
    for (i = 0; i < SX; i++)
    {
        field[i] = [];
        for (j = 0; j < SY; j++)
        { 
            field[i][j] = new Magnet(i,j, Math.random(0.0, 2.0*Math.PI));
        }
    }
}

function updateAndDraw()
{
    ctx.clearRect(0,0,SX*lineLength, SY *lineLength);
 
    for (i = 0; i < SX; i++)
    {
        for (j = 0; j < SY; j++)
        {
            field[i][j].applyForce();
        }
    }
    for (i = 0; i < SX; i++)
    {
        for (j = 0; j < SY; j++)
        {
            field[i][j].update();
            field[i][j].draw();   
        }
    }
    if (mDown)
    {
        onMouseDrag();
    }

}
function onMouseMove(event)
{   


    m = new Point(event.clientX, event.clientY);
    
//    applyForces(m);
}

function drawLine(from, to, width)
{
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle="#000000"
    ctx.stroke();

   
   // ctx.beginPath(); ctx.fillStyle ="#FF0000";
   // ctx.fillRect(to.x,to.y, 2,2);
  //  ctx.stroke();
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
    mDown = false;
 
    m = new Point(event.clientX, event.clientY);
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

function onMouseDrag()
{
     var i = new Point(Math.round(m.x / lineLength), 
                       Math.round(m.y / lineLength));
     for (x = -3; x < 4; x++)
        for (y = -3; y < 4; y++)
        {
            var f = new Point(i.x + x, i.y + y);
            f = crop(f, SX, SY);
            var d = new Point(m.x/lineLength - f.x,
                              m.y/lineLength - f.y);
            field[f.x][f.y].angle = Math.atan2(d.y, d.x) + Math.PI;
        }    
}

function onMouseDown(event)
{
    mDown = true;
    m = new Point(event.clientX, event.clientY);
    onMouseDrag();
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
    draw();
}

NUM_POINTS = width;

var pt = new Array();

var xpos = 0;
var ypos = 0;
var ydiff = 0;
for (i = 0; i < NUM_POINTS; i++)
{
    pt.push(new Point(xpos, ypos));
    xpos += Math.random() + 0.5;
    ydiff += (Math.random() - .5)/5.0;
    ydiff *= 0.59;
    ypos += ydiff*NUM_POINTS/20.0; 
}
//setInterval(drawCurve, )

//drawCurve();
init();

setInterval(updateAndDraw, 30);