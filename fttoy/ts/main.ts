"use strict"

import { Engine } from "./engine";

//import * as drawing from "./graphics";

//drawing.setup(c,h); 


var e: Engine;
e.setupInput(<HTMLCanvasElement> document.getElementById("c"));
e.app = new WaveSim()
//e.init();





