

var ctx;

export function setup(c : HTMLCanvasElement, receiver : MouseInput)
{
    setupInput(c, receiver);
}

export default 342;
interface MouseInput {
    onMouseMove(event : MouseEvent);
    onMouseDown(event : MouseEvent);
    onMouseUp(event : MouseEvent);
    onMouseWheel(event : MouseEvent);
}

class Vec2
{
    x : number;
    y : number;
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
        this.mouseMove(event.offsetX); 
        throw new Error("Method not implemented.");
    }

    //num_buttons static
    bState : boolean[] = [false, false, false];
    dragState : boolean[] = [false, false, false];
    num_buttons : Number = 3;

    pos : Vec2;





    mouseDown(bIndex : number)
    {
        this.bState[bIndex] = true;

        //onDownCallback
    }

    mouseUp(bIndex : number)
    {
        this.bState[bIndex] = false;
    }

    mouseDrag(x, y)
    {
        
    }
    startDrag(bIndex : number)
    {  
        this.dragState[bIndex] = true;
        //mappedCallback()
    }

    endDrag()
    {

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
                this.mouseDrag(x, y)
            }
            
        }
    }
}



function setupInput(c : HTMLCanvasElement, inputReceiver : MouseInput)
{
    c.addEventListener("wheel", inputReceiver.onMouseWheel);
    c.addEventListener("mouseup", inputReceiver.onMouseUp);
    c.addEventListener("mousedown", inputReceiver.onMouseDown);
    c.addEventListener("mousemove", inputReceiver.onMouseMove);

}

function drawLine(from, to, width=1, color) {
    if (width === void 0) { width = 1; }
    if (color === void 0) { color = '#000000'; }
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
}

