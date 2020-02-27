
import { Vec2, drawLine, Frame } from "./graphics";
import * as foo from "./graphics";




interface MouseInput {
    onMouseMove(event : MouseEvent);
    onMouseDown(event : MouseEvent);
    onMouseUp(event : MouseEvent);
    onMouseWheel(event : MouseEvent);
}

class Mouse implements MouseInput
{
    onMouseMove(event : MouseEvent) {
        this.mouseMove(event.pageX, event.pageY); 
        throw new Error("Method not implemented.");
    }
    onMouseDown(event : MouseEvent) {
        this.mouseDown(event.button); 
        throw new Error("Method not implemented.");
    }
    onMouseUp(event : MouseEvent) {
        this.mouseUp(event.button); 
        throw new Error("Method not implemented.");
    }
    onMouseWheel(event : MouseEvent) {
        
        this.mouseWheel(event.offsetX); //offsetY?
        throw new Error("Method not implemented.");
    }

    //num_buttons static
    bState : boolean[] = [false, false, false];
    dragState : boolean[] = [false, false, false];
    num_buttons : Number = 3;

    pos : Vec2;
    diff : Vec2 = new Vec2(0, 0);

    mouseDown(bIndex : number)
    {
        this.bState[bIndex] = true;

        //onDownCallback
    }

    mouseWheel(scrollAmount : number)
    {
        
    }

    mouseUp(bIndex : number)
    {
        this.bState[bIndex] = false;
        if (this.dragState[bIndex] == true)
        {
            this.endDrag(bIndex);
        }
    }

    mouseDrag(x, y)
    {
        
    }

    startDrag(bIndex : number)
    {  
        this.dragState[bIndex] = true;
        //mappedCallback()
    }

    endDrag(bIndex : number)
    {

        this.dragState[bIndex] = false;
        //mappedCallback()
    }


    mouseMove(newX, newY)
    {
        
        this.pos.x = newX;
        this.pos.y = newY;
    
    
        for (var i = 0; this.num_buttons < 3; i++)
        {
            if (this.bState[i] == true)
            {
                if (this.dragState[i] == false)
                {
                    this.startDrag(i);
                }
                this.mouseDrag(this.pos.x, this.pos.y);
            }
            
        }
    }
    
        
    setupInput(element : HTMLElement, inputReceiver : MouseInput)
    {
        element.addEventListener("wheel", inputReceiver.onMouseWheel);
        element.addEventListener("mouseup", inputReceiver.onMouseUp);
        element.addEventListener("mousedown", inputReceiver.onMouseDown);
        element.addEventListener("mousemove", inputReceiver.onMouseMove);
    }

}
class WebsockServer 
{

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


class WebSockClient
{
    websocket: WebSocket;

    constructor(url : string)
    {
        this.websocket = new WebSocket(url);
        var shit = this;
        this.websocket.onmessage = function(ev : MessageEvent)
        {
            shit.processMessage(JSON.parse(ev.data));
      //      this.processMessage(JSON.parse(ev.data))
        } 
    }

    processMessage(jsonData: any)
    { 
        switch (jsonData.)
    }

    draw(frame: Frame)
    {

    }

}

class Engine
{
    mouse: Mouse;

    drawClient: WebSockClient;

    connect(clientUrl: string)
    {
        this.drawClient = new WebSockClient("ws://localhost:8765"); 
        

    }
    update()
    {

    }

    render()
    {


    }
}
