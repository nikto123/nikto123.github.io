import { Vec2 } from "./graphics";
class Mouse {
    constructor() {
        //num_buttons static
        this.bState = [false, false, false];
        this.dragState = [false, false, false];
        this.num_buttons = 3;
        this.diff = new Vec2(0, 0);
        this.wheelPos = 0;
    }
    onMouseMove(event) {
        this.mouseMove(event.pageX, event.pageY);
        this.handleMouseCallback(event);
    }
    onMouseDown(event) {
        this.mouseDown(event.button);
        this.handleMouseCallback(event);
    }
    onMouseUp(event) {
        this.mouseUp(event.button);
        this.handleMouseCallback(event);
    }
    onMouseWheel(event) {
        this.mouseWheel(event.offsetX); //offsetY?
        this.handleMouseCallback(event);
    }
    setupInput(element) {
        element.addEventListener("mousemove", this.onMouseMove);
        element.addEventListener("mouseup", this.onMouseUp);
        element.addEventListener("mousedown", this.onMouseDown);
        element.addEventListener("mousewheel", this.onMouseWheel);
    }
    mouseDown(bIndex) {
        this.bState[bIndex] = true;
        //onDownCallback
    }
    mouseWheel(scrollAmount) {
        this.wheelDiff = scrollAmount;
        this.wheelPos += this.wheelDiff;
    }
    mouseUp(bIndex) {
        this.bState[bIndex] = false;
        if (this.dragState[bIndex] == true) {
            this.endDrag(bIndex);
        }
    }
    mouseDrag(x, y) {
    }
    startDrag(bIndex) {
        this.dragState[bIndex] = true;
        //mappedCallback()
    }
    endDrag(bIndex) {
        this.dragState[bIndex] = false;
        //mappedCallback()
    }
    mouseMove(newX, newY) {
        this.pos.x = newX;
        this.pos.y = newY;
        for (var i = 0; this.num_buttons < 3; i++) {
            if (this.bState[i] == true) {
                if (this.dragState[i] == false) {
                    this.startDrag(i);
                }
                this.mouseDrag(this.pos.x, this.pos.y);
            }
        }
    }
}
class Keyboard {
    setupInput(element) {
        element.addEventListener("keydown", this.onKeyDown);
        element.addEventListener("keyup", this.onKeyUp);
    }
    onKeyDown(event) {
        this.keys[event.keyCode] = true;
        this.handleKeyboardCallback(event);
    }
    onKeyUp(event) {
        this.keys[event.keyCode] = false;
        this.handleKeyboardCallback(event);
    }
    getKey(key) {
        return this.keys[key];
    }
}
class DrawClient {
    constructor(ctx) {
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
class WebSockClient {
    constructor(url, processMessageCallback = null) {
        this.websocket = new WebSocket(url);
        var shit = this;
        this.websocket.onmessage = processMessageCallback;
    }
    sendMessage(jsonData) {
        this.websocket.send(JSON.stringify(jsonData));
    }
    isConnected() {
        return this.websocket.readyState == WebSocket.OPEN;
    }
}
class Engine {
    connect(serverUrl = "ws://localhost:1234") {
        this.websockClient = new WebSockClient(serverUrl, this.handleMessage);
        if (this.websockClient.websocket.readyState == WebSocket.OPEN) {
            this.websockClient.websocket.onmessage = this.handleMessage;
        }
    }
    handleMessage() {
    }
    setupInput(element) {
        this.mouse.setupInput(element);
        this.mouse.handleMouseCallback = this.handleMouse;
        this.keyboard.setupInput(element);
        this.keyboard.handleKeyobardCallback = this.handleKeyboard;
    }
    handleKeyboard(event) {
        switch (event.type) {
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
        if (this.websockClient.isConnected()) {
            var msg = {};
            msg.type = event.type;
            msg.keyCode = event.keyCode;
            this.websockClient.sendMessage(JSON.stringify(msg));
        }
    }
    handleMouse(event) {
        var msg = {};
        switch (event.type) {
            case "mouseup":
                break;
            case "mousedown":
                break;
            case "mousemove":
                break;
            default:
                break;
        }
        if (this.websockClient.isConnected()) {
            var msg = {};
            msg.type = event.type;
            msg.pos = this.mouse.pos;
            msg.diff = this.mouse.diff;
            msg.wheelDiff = this.mouse.wheelDiff;
            msg.wheelPos = this.mouse.wheelPos;
            this.websockClient.sendMessage(JSON.stringify(msg));
        }
    }
    draw(frame) {
        //   var jsonFrame = JSON.stringify(frame);
        // frame = this.frameFromJson(jsonFrame);
        //     console.log(jsonFrame);
        if (frame.clearBeforeDraw) {
            ctx.clearRect(0, 0, SX * lineLength, SY * lineLength);
        }
        frame.drawObjects.forEach(function (item) {
            item.draw(this.ctx);
        });
    }
    ;
    frameFromJson(jsonFrame) {
        var frame = JSON.parse(jsonFrame);
        return frame;
    }
    ;
}
//# sourceMappingURL=engine.js.map