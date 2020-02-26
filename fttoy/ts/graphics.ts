

var ctx;

export function setup(c : HTMLCanvasElement, receiver : MouseInput)
{
    setupInput(c, receiver);
}

export default 342;
interface MouseInput {
    onMouseMove();
    onMouseDown();
    onMouseUp();
    onMouseWheel();
}

class Mouse 
{
    //num_buttons static
    bState : [ false, false, false ];
    dragState : [false, false, false];
    x : Number;
    y : Number;

    mouseMove(newX, newY)
    {
        this.x = newX;
        this.y = newY;
    
    
        for (var i = 0; i < 3; i++)
        {
            if (this.bState[i] == true)
            {
                if (this.dragState[i] == false)
                {
                    startDrag(i);
                }
            }
            
        }
    }

    startDrag()
    {  

        //mappedCallback()
    }

    endDrag()
    {

        //mappedCallback()
    }

    mouseDrag(x, y)
    {
        

    }

    mbDown(bIndex : string)
    {
        this.bState[bIndex] = true;

        //onDownCallback
    }

    mbUp(bIndex : number)
    {
        this.bState[bIndex] = false;
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

