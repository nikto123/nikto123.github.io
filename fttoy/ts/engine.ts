
import { Vec2, drawLine, Frame, Drawable } from "./graphics";
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

interface KeyboardInput extends Input{
    onKeyDown(event: KeyboardEvent);
    onKeyUp(event:KeyboardEvent);
    getKey(key: number): boolean;
}

export class Mouse implements MouseInput
{
    handleMouseCallback: (mouse: Mouse, ev : MouseEvent) => void;

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
        this.handleMouseCallback(this, event);
    }
    onMouseDown(event : MouseEvent) {
        this.mouseDown(event.button);
        this.handleMouseCallback(this, event);
    }
    onMouseUp(event : MouseEvent) {
        this.mouseUp(event.button); 
        this.handleMouseCallback(this, event);
    }
    onMouseWheel(event : MouseEvent) {
        this.mouseWheel(event.offsetX); //offsetY?
        this.handleMouseCallback(this, event);
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


export class Keyboard implements KeyboardInput
{   
    handleKbCallback: (keyboard: Keyboard, ev : KeyboardEvent) => void; // sem asi event type a send device (pre nested objekty nech sa vedia pohrabat a ohandlovat si sracky)

    setupInput(element: HTMLElement) 
    {
        element.addEventListener("keydown", this.onKeyDown);
        element.addEventListener("keyup", this.onKeyUp);    
    }
    keys: Array<boolean>;
    onKeyDown(event: KeyboardEvent)
    {
        this.keys[event.keyCode] = true;
        this.handleKbCallback(this, event);
    }

    onKeyUp(event:KeyboardEvent)
    {
        this.keys[event.keyCode] = false;
        this.handleKbCallback(this, event);
    }

    getKey(key: number) : boolean
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

    constructor(url : string, processMessageCallback: (event:Event) => void)
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

export class Node<DataType>
{
    children: Array<Node<DataType>>;
    public data: DataType;

    constructor(data: DataType)
    {
        this.data = data;
    }

    public createChild(childData: DataType)
    {
        this.children.push(new Node<DataType>(childData));
    }

    public addChild(node:Node<DataType>)
    {
        this.children.push(node);
    }

    public findFirstInorder(searchValue: DataType): Node<DataType> 
    {
        return this.data === searchValue ? this : this.findFirstInorder(searchValue);
    }
}


interface MessageHandler 
{
    handleMessage(msg: any);
}

export interface InputHandler extends Input
{
    handleMouse(mouse: Mouse, ev: MouseEvent);
    handleKeyboard(keyboard: Keyboard, ev: KeyboardEvent);
}


export abstract class Temporal
{
    age: number;

    abstract doUpdate(time:number);

    constructor(doUpdate = (time:number)=>{})
    {
        this.age = 0.0;
        this.doUpdate = doUpdate;
    }

    update(timeDiff: number)
    {
        this.age += timeDiff;
        this.doUpdate(timeDiff);
    }
}

export interface AppObject extends Temporal, InputHandler, MessageHandler, Drawable
{
    getFrame():Frame;
}


export class Engine implements AppObject
{

    type: string;

    age: number;

    mouse: Mouse;
    keyboard: Keyboard;
    websockClient: WebSockClient;
    app: AppObject;
     
    drawFrame : Frame;


    constructor(app: AppObject)
    {
        
        this.update()
        this.app = app;
    }

    connect(serverUrl: string = "ws://localhost:1234")
    {
        
        this.websockClient = new WebSockClient(serverUrl, this.handleMessage);
        if (this.websockClient.websocket.readyState == WebSocket.OPEN)
        {
            this.websockClient.websocket.onmessage = this.handleMessage;
        }
    }

    setupInput(element : HTMLElement)
    {
        this.mouse.setupInput(element);
        this.mouse.handleMouseCallback = this.handleMouse;

        //maybe fix keyboard, input to window
        this.keyboard.setupInput(element);
        this.keyboard.handleKbCallback = this.handleKeyboard;
    }   
    setupDrawing(canvas: HTMLElement)
    {
        

    }
    
    handleKeyboard(keyboard: Keyboard, event:KeyboardEvent)
    {
        this.app.handleKeyboard(keyboard, event);
        if (this.websockClient.isConnected())
        {     
            var msg: any = {};

            msg.type = event.type;
            msg.keyCode = event.keyCode;
            this.websockClient.sendMessage(JSON.stringify(msg));
        }
    }

    handleMouse(mouse: Mouse, event: MouseEvent)
    { 
        this.app.handleMouse(mouse, event);
        if (this.websockClient.isConnected())
        {   
            var msg: any = {};
            msg.type = event.type;
            msg.pos = this.mouse.pos;
            msg.diff = this.mouse.diff;
            msg.wheelDiff = this.mouse.wheelDiff;
            msg.wheelPos = this.mouse.wheelPos;
            this.websockClient.sendMessage(JSON.stringify(msg));
        }
    }
        
    update(timeSinceLast:number=1)
    {
        this.app.update(1);
    }

    doUpdate(time: number) 
    {

    }

    handleMessage(event: any)
    {
        var json = JSON.parse(event.data.toString());
        switch (json.data.type)
        {
            case "Frame":
                this.draw = json.innerMessage;
                break;
            default:
                this.app.handleMessage(event);
                break;
        }
    }
         
    draw(drawContext: CanvasRenderingContext2D) 
    {
        //   var jsonFrame = JSON.stringify(frame);
        // frame = this.frameFromJson(jsonFrame);
        //     console.log(jsonFrame);
        
        var frame = this.getFrame();
        if (frame.clearBeforeDraw) 
        {
            drawContext.clearRect(0, 0, drawContext.canvas.width, drawContext.canvas.height);
        }

        frame.drawObjects.forEach(function (item) 
        {
            item.draw(drawContext);
        });
    }

    frameFromJson(jsonFrame: string) 
    {
        var frame = JSON.parse(jsonFrame);
        return frame;
    }
    getFrame(): Frame 
    {
        return this.app.getFrame();
    }
}
