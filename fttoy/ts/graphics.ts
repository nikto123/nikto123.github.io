

export var ctx: CanvasRenderingContext2D;


export function initGraphics(context: CanvasRenderingContext2D)
{
    ctx = context;
}


export class Vec2
{
    x : number;
    y : number;

    constructor(x : number, y : number)
    {
        this.x = x;
        this.y = y;
    }
}

export function drawLine(ctx:CanvasRenderingContext2D, from : Vec2, to : Vec2, width : number = 1, color: string = "#000000") 
{
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawRing(ctx:CanvasRenderingContext2D, pos: Vec2, values : Array<number>, radius: number, fscale: number = 1.0, lineWidth: number = 1, lineColor: string ="#000000") 
{
    var aDiff = 1.0 / values.length * Math.PI * 2.0;
    var a = 0.0;
    var prevPt = null;
    var firstPt = null;
    for (var i = 0; i < values.length; i++) {
        var fval = values[i];
        var pt = new Vec2(pos.x + Math.cos(a) * (radius + fval * fscale), pos.y + Math.sin(a) * (radius + fval * fscale));
        if (prevPt != null) {
            drawLine(ctx, prevPt, pt, lineWidth);
        }
        else {
            firstPt = pt;
        }
        prevPt = pt;
        a += aDiff;
    }
    drawLine(ctx, prevPt, firstPt);
}

export abstract class Drawable 
{
    type: string;
    abstract draw(drawContext: CanvasRenderingContext2D);
    constructor(typeName:string)
    {
        this.type = typeName;
    }
}


export class Frame extends Drawable 
{

    drawObjects : Array<Drawable>;
    clearBeforeDraw : boolean;
    timestamp : string;

    constructor(drawObjects : Array<Drawable>, clearBeforeDraw : boolean, timestamp : string)
    {
        super(KnownType.FRAME);
        this.drawObjects = drawObjects;
        this.clearBeforeDraw = clearBeforeDraw;
        this.timestamp = timestamp;
        this.type = "Frame";
    }


    addObject(drawObject : Drawable)
    {
        this.drawObjects.push(drawObject);
    }
    
    draw(drawContext: CanvasRenderingContext2D) 
    {
        if (this.clearBeforeDraw)
        {
            drawContext.fillRect(0, 0, drawContext.canvas.width, drawContext.canvas.height);
            // drawRect     
        }

        this.drawObjects.forEach(item => {
            item.draw(drawContext);
        });
    }
}

export function drawText(text, x, y, lineNum) 
{
    ctx.fillText(text, x, y + lineNum * 20);
}


export function getRandomColor() 
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

export function getRandomPolyline() 
{
    var points = Array<Vec2>();
    var numPoints = 80;
    var angle = (1.0 / numPoints) * 2.0 * Math.PI;
    var centerX = 300;
    var centerY = 300;
    for (var i = 0; i < numPoints; i++) {
        var s = Math.sin(i * angle);
        var c = Math.cos(i * angle);
        var radius = Math.random() * centerX / 2.0 + 100.0;
        points.push(new Vec2(c * radius + centerX, s * radius + centerY));
    }
    return new Polyline(points, 8.0, getRandomColor());
}
export enum KnownType {
    LINE = "Line",
    POLYLINE = "Polyline",
    FRAME = "Frame"
}


class Line extends Drawable
{
    //point a,b
    a: Vec2;
    b: Vec2;
    color: string;
    width: number;
    
    constructor(a:Vec2, b:Vec2, width:number, color:string = '#000000') 
    {
        super(KnownType.LINE);
        this.a = a;
        this.b = b;
        this.color = color;
        this.type = typeof this;
    }
    
    draw(ctx: CanvasRenderingContext2D) 
    {
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.strokeStyle = this.color;
        ctx.stroke();
    };

}


export class Polyline extends Drawable
{   
    points: Array<Vec2>;
    width: number = 1;
    color: string = "#000000";

    constructor(points:Array<Vec2>, width:number, color:string)
    {
        super(KnownType.POLYLINE);
        this.points = points;
        this.width = width;
        this.color = color;
    }
    
    addPoint(point: Vec2)
    {
        this.points.push(point);
    }

    draw(drawContext: CanvasRenderingContext2D) 
    {
        var prev = null;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            if (prev != null) {
                drawLine(drawContext, prev, point, this.width, this.color);
            }
            prev = point;
        }
    }
}
export class Rect
{
     ul: Vec2;
     dr: Vec2;
     lineWidth: number = 1;
     color: string = "#000000";

    constructor(ulx, uly, drx, dry) 
    {
        this.ul = new Vec2(ulx, uly);
        this.dr = new Vec2(drx, dry);
    }
    
    draw(context:CanvasRenderingContext2D)
    {
        var points = [this.ul, new Vec2(this.dr.x, this.ul.y), this.dr, new Vec2(this.ul.x, this.dr.y)];
        for (var i = 0; i < 4; i++) 
        {
            var next = i + 1;
            if (next >= 4)
                next = 0;
            drawLine(context, points[i], points[next], this.lineWidth, this.color);
        }
    };
    inside(pos:Vec2) 
    {
        if (pos.x >= this.ul.x && pos.x <= this.dr.x && pos.y >= this.ul.y && pos.y <= this.dr.y) 
        {
            return true;
        }
        return false;
    };

    getWidth(): number
    {
        return Math.abs(this.dr.x - this.ul.x);
    }    
    
    getHeight(): number
    {
        return Math.abs(this.dr.y - this.ul.y);
    }


}