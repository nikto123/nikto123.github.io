
import { Vec2, drawLine, Frame } from "./graphics";
import * as foo from "./graphics";

interface Input 
{
    setupInput(element : HTMLElement);
}


interface MouseInput extends Input{
    onMouseMove(event : MouseEvent);
    onMouseDown(event : MouseEvent);
    onMouseUp(event : MouseEvent);
    onMouseWheel(event : MouseEvent);
}

class Mouse implements MouseInput
{
 
    handleMouseCallback: (ev : MouseEvent) => void;

    //num_buttons static
    bState : boolean[] = [false, false, false];
    dragState : boolean[] = [false, false, false];
    num_buttons : number = 3;

    pos : Vec2;
    diff : Vec2 = new Vec2(0, 0);
    wheelDiff: number;
    wheelPos: number = 0;

    onMouseMove(event : MouseEvent) {
        this.mouseMove(event.pageX, event.pageY);
        this.handleMouseCallback(event);
    }
    onMouseDown(event : MouseEvent) {
        this.mouseDown(event.button);
        this.handleMouseCallback(event);
    }
    onMouseUp(event : MouseEvent) {
        this.mouseUp(event.button); 
        this.handleMouseCallback(event);
    }
    onMouseWheel(event : MouseEvent) {
        this.mouseWheel(event.offsetX); //offsetY?
        this.handleMouseCallback(event);
    }

    setupInput(element: HTMLElement) 
    {
        element.addEventListener("mousemove", this.onMouseMove);
        element.addEventListener("mouseup", this.onMouseUp);
        element.addEventListener("mousedown", this.onMouseDown);
        element.addEventListener("mousewheel", this.onMouseWheel);
    }

    mouseDown(bIndex : number)
    {
        this.bState[bIndex] = true;

        //onDownCallback
    }

    mouseWheel(scrollAmount : number)
    {
        this.wheelDiff = scrollAmount;
        this.wheelPos += this.wheelDiff;
    }

    mouseUp(bIndex : number)
    {
        this.bState[bIndex] = false;
        if (this.dragState[bIndex] == true)
        {
            this.endDrag(bIndex);
        }
    }

    mouseDrag(x: number, y:number)
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


    mouseMove(newX: number, newY: number)
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
}


class Keyboard implements Input
{
    setupInput(element: HTMLElement) 
    {
        element.addEventListener("keydown", this.onKeyDown);
        element.addEventListener("keyup", this.onKeyUp);    
    }
    keys: Array<boolean>;
    onKeyDown(event: KeyboardEvent)
    {
        this.keys[event.keyCode] = true;
    }

    onKeyUp(event:KeyboardEvent)
    {
        this.keys[event.keyCode] = false;
    }

    getKey(key: number)
    {
        return this.keys[key];
    }

}


class DrawClient 
{
    ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D)
    {
        this.ctx = ctx;
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


 
}


class WebSockClient
{
    websocket: WebSocket;

    constructor(url : string, processMessageCallback: any = null)
    {
        this.websocket = new WebSocket(url);
        var shit = this;
        this.websocket.onmessage = processMessageCallback;
    }

    sendMessage(jsonData: Object)
    {
        this.websocket.send(JSON.stringify(jsonData));
    }

    isConnected()
    {
        return this.websocket.readyState == WebSocket.OPEN;
    }
}

class Engine implements Input
{
    mouse: Mouse;
    keyboard: Keyboard;
    websockClient: WebSockClient;

    connect(serverUrl: string = "ws://localhost:1234")
    {
        this.websockClient = new WebSockClient(serverUrl, this.handleMessage);
        if (this.websockClient.websocket.readyState == WebSocket.OPEN)
        {
            this.websockClient.websocket.onmessage = this.handleMessage;
        }
    }

    handleMessage()
    {
        
    }
        
    setupInput(element : HTMLElement)
    {
        this.mouse.setupInput(element);
        this.mouse.handleMouseCallback = this.handleMouse;

        this.keyboard.setupInput(element);
        this.keyboard.handleKeyobardCallback = this.handleKeyboard;

        

    }

    handleKeyboard(event:KeyboardEvent)
    {       

        switch(event.type )
        {
            case "keydown":
                //forEach keyboardable
                break;
            case "keyup":
                //foreach keyboardable
                break;
            default:
                break;
        }
        this.keyboard.onKeyDown(event);

        if (this.websockClient.isConnected())
        {     
            var msg: any= {};

            msg.type = event.type;
            msg.keyCode = event.keyCode;
            this.websockClient.sendMessage(JSON.stringify(msg));
        }
    }

    handleMouse(event: MouseEvent)
    {
        var msg: any= {};
        
        switch (event.type)
        {
            case "mouseup":
                break;
            case "mousedown":
                break;
            case "mousemove":
                break;
            
            default:
                break;

        }       
        if (this.websockClient.isConnected())
        {   
            var msg: any= {};

            msg.type = event.type;
            msg.pos = this.mouse.pos;
            msg.diff = this.mouse.diff;
            msg.wheelDiff = this.mouse.wheelDiff;
            msg.wheelPos = this.mouse.wheelPos;
            this.websockClient.sendMessage(JSON.stringify(msg));

        }
    }
        
 
     draw(frame: Frame) 
    {
        //   var jsonFrame = JSON.stringify(frame);
        // frame = this.frameFromJson(jsonFrame);
        //     console.log(jsonFrame);
        if (frame.clearBeforeDraw) 
        {
            ctx.clearRect(0, 0, SX * lineLength, SY * lineLength);
        }

        frame.drawObjects.forEach(function (item) 
        {
            item.draw(this.ctx);
        });
    };

    frameFromJson(jsonFrame: string) {
        var frame = JSON.parse(jsonFrame);
        return frame;
    };
}
