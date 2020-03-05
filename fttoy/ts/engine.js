"use strict";
exports.__esModule = true;
var graphics_1 = require("./graphics");
var Mouse = /** @class */ (function () {
    function Mouse() {
        //num_buttons static
        this.bState = [false, false, false];
        this.dragState = [false, false, false];
        this.num_buttons = 3;
        this.diff = new graphics_1.Vec2(0, 0);
        this.wheelPos = 0;
    }
    Mouse.prototype.onMouseMove = function (event) {
        this.mouseMove(event.pageX, event.pageY);
        this.handleMouseCallback(event);
    };
    Mouse.prototype.onMouseDown = function (event) {
        this.mouseDown(event.button);
        this.handleMouseCallback(event);
    };
    Mouse.prototype.onMouseUp = function (event) {
        this.mouseUp(event.button);
        this.handleMouseCallback(event);
    };
    Mouse.prototype.onMouseWheel = function (event) {
        this.mouseWheel(event.offsetX); //offsetY?
        this.handleMouseCallback(event);
    };
    Mouse.prototype.setupInput = function (element) {
        element.addEventListener("mousemove", this.onMouseMove);
        element.addEventListener("mouseup", this.onMouseUp);
        element.addEventListener("mousedown", this.onMouseDown);
        element.addEventListener("mousewheel", this.onMouseWheel);
    };
    Mouse.prototype.mouseDown = function (bIndex) {
        this.bState[bIndex] = true;
        //onDownCallback
    };
    Mouse.prototype.mouseWheel = function (scrollAmount) {
        this.wheelDiff = scrollAmount;
        this.wheelPos += this.wheelDiff;
    };
    Mouse.prototype.mouseUp = function (bIndex) {
        this.bState[bIndex] = false;
        if (this.dragState[bIndex] == true) {
            this.endDrag(bIndex);
        }
    };
    Mouse.prototype.mouseDrag = function (x, y) {
    };
    Mouse.prototype.startDrag = function (bIndex) {
        this.dragState[bIndex] = true;
        //mappedCallback()
    };
    Mouse.prototype.endDrag = function (bIndex) {
        this.dragState[bIndex] = false;
        //mappedCallback()
    };
    Mouse.prototype.mouseMove = function (newX, newY) {
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
    };
    return Mouse;
}());
var Keyboard = /** @class */ (function () {
    function Keyboard() {
    }
    Keyboard.prototype.setupInput = function (element) {
        element.addEventListener("keydown", this.onKeyDown);
        element.addEventListener("keyup", this.onKeyUp);
    };
    Keyboard.prototype.onKeyDown = function (event) {
        this.keys[event.keyCode] = true;
        this.handleKbCallback(event);
    };
    Keyboard.prototype.onKeyUp = function (event) {
        this.keys[event.keyCode] = false;
        this.handleKbCallback(event);
    };
    Keyboard.prototype.getKey = function (key) {
        return this.keys[key];
    };
    return Keyboard;
}());
var DrawClient = /** @class */ (function () {
    function DrawClient(ctx) {
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
    return DrawClient;
}());
var WebSockClient = /** @class */ (function () {
    function WebSockClient(url, processMessageCallback) {
        if (processMessageCallback === void 0) { processMessageCallback = null; }
        this.websocket = new WebSocket(url);
        var shit = this;
        this.websocket.onmessage = processMessageCallback;
    }
    WebSockClient.prototype.sendMessage = function (jsonData) {
        this.websocket.send(JSON.stringify(jsonData));
    };
    WebSockClient.prototype.isConnected = function () {
        return this.websocket.readyState == WebSocket.OPEN;
    };
    return WebSockClient;
}());
var Node = /** @class */ (function () {
    function Node(data) {
        this.data = data;
    }
    Node.prototype.addChild = function (childData) {
        this.children.push(new Node(childData));
    };
    Node.prototype.addChild = function (a, b) {
    };
    return Node;
}());
exports.Node = Node;
var Engine = /** @class */ (function () {
    function Engine() {
    }
    Engine.prototype.connect = function (serverUrl) {
        if (serverUrl === void 0) { serverUrl = "ws://localhost:1234"; }
        this.websockClient = new WebSockClient(serverUrl, this.handleMessage);
        if (this.websockClient.websocket.readyState == WebSocket.OPEN) {
            this.websockClient.websocket.onmessage = this.handleMessage;
        }
    };
    Engine.prototype.handleMessage = function () {
    };
    Engine.prototype.setupInput = function (element) {
        this.mouse.setupInput(element);
        this.mouse.handleMouseCallback = this.handleMouse;
        this.keyboard.setupInput(element);
        this.keyboard.handleKbCallback = this.handleKeyboard;
    };
    Engine.prototype.handleKeyboard = function (event) {
        this.keyboard.onKeyDown(event);
        kbTree.handle();
        if (this.websockClient.isConnected()) {
            var msg = {};
            msg.type = event.type;
            msg.keyCode = event.keyCode;
            this.websockClient.sendMessage(JSON.stringify(msg));
        }
    };
    Engine.prototype.handleMouse = function (event) {
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
    };
    Engine.prototype.draw = function (frame) {
        //   var jsonFrame = JSON.stringify(frame);
        // frame = this.frameFromJson(jsonFrame);
        //     console.log(jsonFrame);
        if (frame.clearBeforeDraw) {
            ctx.clearRect(0, 0, SX * lineLength, SY * lineLength);
        }
        frame.drawObjects.forEach(function (item) {
            item.draw(this.ctx);
        });
    };
    Engine.prototype.frameFromJson = function (jsonFrame) {
        var frame = JSON.parse(jsonFrame);
        return frame;
    };
    return Engine;
}());
