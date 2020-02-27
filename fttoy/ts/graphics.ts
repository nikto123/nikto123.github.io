

var ctx;



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


export function drawLine(from : Vec2, to : Vec2, width : number = 1, color: string = "#000000") {
    if (width === void 0) { width = 1; }
    if (color === void 0) { color = '#000000'; }
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawRing(pos: Vec2, values : Array<number>, radius: number, fscale: number = 1.0, lineWidth: number = 1, lineColor: string ="#000000") 
{
 
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

interface Drawable {

    draw(drawContext: CanvasRenderingContext2D);
    
}

export class Frame implements Drawable {


    drawObjects : Array<Drawable>;
    clearBeforeDraw : boolean;
    timestamp : string;

    constructor(drawObjects : Array<Drawable>, clearBeforeDraw : boolean, timestamp : string)
    {
        this.drawObjects = drawObjects;
        this.clearBeforeDraw = clearBeforeDraw;
        this.timestamp = timestamp;
    }


    addObject(drawObject : Drawable)
    {

        this.drawObjects.push(drawObject);
    }
    
    draw(drawContext: CanvasRenderingContext2D) 
    {
        if (this.clearBeforeDraw)
        {
            drawRect()     
        }
    }



}
var DrawServer = /** @class */ (function () {
    function DrawServer() {
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
    DrawServer.prototype.draw = function (frame) {
        //   var jsonFrame = JSON.stringify(frame);
        // frame = this.frameFromJson(jsonFrame);
        //     console.log(jsonFrame);
        if (frame.clear) {
            ctx.clearRect(0, 0, SX * lineLength, SY * lineLength);
        }
        frame.drawObjects.forEach(function (item) {
            switch (item.type) {
                case "Polyline":
                    Object.setPrototypeOf(item, Polyline.prototype);
                    break;
                case "Line":
                    Object.setPrototypeOf(item, Line.prototype);
                    break;
                default:
                    break;
            }
            item.draw();
        });
    };
    DrawServer.prototype.frameFromJson = function (jsonFrame) {
        var frame = JSON.parse(jsonFrame);
        return frame;
    };
    return DrawServer;
}());