

var ctx;

export function setup(c : HTMLCanvasElement, receiver : MouseInput)
{
    setupInput(c, receiver);
}

class Vec2
{
    x : number;
    y : number;
}
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
                this.mouseDrag(x, y)
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

