import React, {useState, useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import "./DrawingPage.css";

function Draw() {

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const navigate = useNavigate();
    const [time, setTime] = useState(60);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [lineColour, setLineColour] = useState("#000000");
    const [lineOpacity, setLineOpacity] = useState(1);
    const [tool, setTool] = useState('pen');
    const [word, setWord] = useState('');
    const [stack, setStack] = useState([]);
    const [stackIndex, setStackIndex] = useState(-1);
    const [isStackAction, setStackAction] = useState(false);
    const [startPos, setStartPos] = useState({x:0, y:0});
    const [snapshot, setSnapshot] = useState(null);
    const [isFillMode, setIsFillMode] = useState(false);

    const words = ["Apple", "Brain", "Cat", "Dog", "Elephant", "Flower", "Giraffe", 
        "House", "Igloo", "Jam", "Kangaroo", "Lamp", "Monkey", "Narwhal", "Octopus", "Piano", 
        "Queen", "Race car", "Snake", "Train", "Umbrella", "Van", "Water", "Xylophone", "Yo yo", "Zebra"]

    const saveToStack = () => {
        if (isStackAction) {
            setStackAction(false);
            return;
        }

        const canvas = canvasRef.current;
        const currentState = canvas.toDataURL();

        if (stack[stackIndex] === currentState) return; // prevent duplicate

        const newStack = stack.slice(0, stackIndex + 1);
        newStack.push(currentState);

        setStack(newStack);
        setStackIndex(newStack.length - 1);
    };
        
    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Set white background
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set initial drawing properties
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = lineColour;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = lineOpacity;
        ctx.globalCompositeOperation = 'source-over';
        
        ctxRef.current = ctx;
        const currentState = canvas.toDataURL();
        setStack([currentState]);
        setStackIndex(0);
    }, []);

    useEffect(() => {
        if (time > 0) {
            const timer = setTimeout(() => setTime(time - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            handleSubmit();
        }
    }, [time]);
    
    useEffect(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        
        if (tool === 'rubber') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.globalAlpha = 1;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = lineOpacity;
            ctx.strokeStyle = lineColour;
        }
        
        ctx.lineWidth = lineWidth;
        
    }, [tool, lineColour, lineOpacity, lineWidth]);

    useEffect(() => {
        generateRandomWord();
    },[]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        const normalX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const normalY = (e.clientY - rect.top) * (canvas.height / rect.height);

        return {
            x: canvas.width - normalX,
            y: canvas.height - normalY
        };
    };

    const startDrawing = (e) => {
        const {x, y} = getMousePos(e);
        setIsDrawing(true);
        if (tool === "square" || tool === "circle") {
            setStartPos({x, y});

            const canvas = canvasRef.current;
            setSnapshot(
                ctxRef.current.getImageData(0, 0, canvas.width, canvas.height)
            );
        } else {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(x, y);
    }
    };

    const endDrawing = () => {
        ctxRef.current.closePath();
        setIsDrawing(false);
        if (tool !== "square" && tool !== "circle") {
            ctxRef.current.closePath();
        }
        setTimeout(() => {
            saveToStack();
        }, 10);
    };

    const draw = (e) => {
        if (!isDrawing) {
            return;
        }
        const {x, y} = getMousePos(e);
        const ctx = ctxRef.current;
        if (tool === "square") {
            ctx.putImageData(snapshot, 0, 0);

            const width = x - startPos.x;
            const height = y - startPos.y;

            ctx.strokeRect(startPos.x, startPos.y, width, height);
        }
        else if (tool === "circle") {
            ctx.putImageData(snapshot, 0, 0);

            const radius = Math.sqrt(
                Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
            );

            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        // Save current tool
        const currentTool = tool;
        
        // Set to normal composite operation for clearing
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        
        // Clear with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Restore proper settings
        if (currentTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = lineColour;
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = lineOpacity;
        } else if (currentTool === 'rubber') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = 1;
        }
        
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctxRef.current = ctx;
        saveToStack();
    }

    const undo = () => {
        if (stackIndex > 0) {
            setStackAction(true);
            const newIndex = stackIndex - 1;
            setStackIndex(newIndex);
            loadState(stack[newIndex]);
            setTimeout(() => setStackAction(false), 100);
        }
    }

    const redo = () => {
        if (stackIndex < stack.length -1) {
            setStackAction(true);
            const newIndex = stackIndex + 1;
            setStackIndex(newIndex);
            loadState(stack[newIndex]);
            setTimeout(() => setStackAction(false), 100);
        }
    }
    
    const floodFill = (startX, startY, fillColor) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get the color at the clicked point
        const startPos = (startY * canvas.width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];
        
        // Parse fill color
        let fillR, fillG, fillB, fillA;
        if (fillColor.startsWith('#')) {
            // Handle hex colors
            const hex = fillColor.slice(1);
            if (hex.length === 3) {
                fillR = parseInt(hex[0] + hex[0], 16);
                fillG = parseInt(hex[1] + hex[1], 16);
                fillB = parseInt(hex[2] + hex[2], 16);
            } else {
                fillR = parseInt(hex.slice(0, 2), 16);
                fillG = parseInt(hex.slice(2, 4), 16);
                fillB = parseInt(hex.slice(4, 6), 16);
            }
            fillA = 255;
        } else if (fillColor.startsWith('rgb')) {
            // Handle rgb/rgba colors
            const matches = fillColor.match(/\d+/g);
            fillR = parseInt(matches[0]);
            fillG = parseInt(matches[1]);
            fillB = parseInt(matches[2]);
            fillA = matches[3] ? parseInt(matches[3]) : 255;
        } else {
            // Handle color names (simplified)
            const tempCtx = document.createElement('canvas').getContext('2d');
            tempCtx.fillStyle = fillColor;
            const tempColor = tempCtx.fillStyle;
            const matches = tempColor.match(/\d+/g);
            if (matches) {
                fillR = parseInt(matches[0]);
                fillG = parseInt(matches[1]);
                fillB = parseInt(matches[2]);
                fillA = 255;
            } else {
                return; // Invalid color
            }
        }
        
        // Don't fill if the target color is the same as fill color
        if (startR === fillR && startG === fillG && startB === fillB && startA === fillA) {
            return;
        }
        
        // Queue for flood fill
        const queue = [{x: startX, y: startY}];
        const visited = new Set();
        const width = canvas.width;
        const height = canvas.height;
        
        while (queue.length > 0) {
            const {x, y} = queue.shift();
            const pos = (y * width + x) * 4;
            
            // Skip if out of bounds
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            // Skip if already visited
            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            
            // Check if this pixel matches the start color
            if (data[pos] !== startR || 
                data[pos + 1] !== startG || 
                data[pos + 2] !== startB || 
                data[pos + 3] !== startA) {
                continue;
            }
            
            // Mark as visited
            visited.add(key);
            
            // Fill this pixel
            data[pos] = fillR;
            data[pos + 1] = fillG;
            data[pos + 2] = fillB;
            data[pos + 3] = fillA;
            
            // Add neighbors to queue
            queue.push({x: x + 1, y});
            queue.push({x: x - 1, y});
            queue.push({x, y: y + 1});
            queue.push({x, y: y - 1});
        }
        
        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
        saveToStack();
    }

    const handleCanvasClick = (e) => {
        if (tool === 'fill') {
            const {x, y} = getMousePos(e);
            // Convert to integers
            const fillX = Math.floor(x);
            const fillY = Math.floor(y);
            floodFill(fillX, fillY, lineColour);
            setIsFillMode(false);
            setTool('pen'); // Switch back to pen after filling
        }
    }

    const loadState = (stateDataURL) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            if (tool === 'pen') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = lineColour;
                ctx.globalAlpha = lineOpacity;
            } else {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.globalAlpha = 1;
            }
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctxRef.current = ctx;
        }
        img.src = stateDataURL;
    }

    const generateRandomWord = () => {
        const randomNum = Math.floor(Math.random() * words.length);
        setWord(words[randomNum]);
    }
    
    const handleSubmit = () => {
        // Extract the image drawn
        const canvas = canvasRef.current; 
        const dataURL = canvas.toDataURL('image/png');

        // Pass both to the "Guess" pane
        navigate('/Guess', {state: {url : dataURL, word: word} });   
    };

    const download = () => {
        // Get canvas element 
        const canvas = canvasRef.current;
        
        // get url
        const dataURL = canvas.toDataURL("image/png");

        // create download link
        const link = document.createElement("a");

        // Set link properties
        link.href = dataURL;
        link.download = "CanvasImage.png"; // Custom filename

        // Trigger download
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Cleanup
    }
    
    return (
        <div className="container">
            <div className="header-row">
                {/*WORD TO DRAW*/}
                <section className="draw-this-word" id = "container">
                    <span>Draw: {word}</span>
                </section>

                {/* TIMER FOR THE RESPONSE */}
                <section className="countdown">
                    <span className={time < 10 ? 'low-time' : ''}>Timer: {time}s</span>
                </section>
            </div>
            
            <div className="main-area">
                {/*CANVAS*/}
                <section className="drawing-board">
                    <canvas 
                        onMouseDown={tool === 'fill' ? handleCanvasClick : startDrawing}
                        onMouseUp={tool === 'fill' ? null : endDrawing}
                        onMouseLeave={tool === 'fill' ? null : endDrawing}
                        onMouseMove={tool === 'fill' ? null : draw}
                        ref={canvasRef}
                        width={800}
                        height={500}
                        style={{ backgroundColor: '#ffffff', cursor: tool === 'fill' ? 'crosshair' : 'default' }}
                    />
                </section>
    
                {/*SIDEBAR*/}
                <section className="side-bar">
                    <span className="sidebar-title">Modify</span>
                    
                    {/*COLOURS*/}
                    <span className="sidebar-heading">Colours</span>
                    <section className="colours">
                        <ul className="options">
                            <li className={`option ${lineColour === '#000' ? 'selected' : ''}`} onClick={() => setLineColour('#000')}></li>
                            <li className={`option ${lineColour === '#fff' ? 'selected' : ''}`} onClick={() => setLineColour('#fff')}></li>
                            <li className={`option ${lineColour === '#09c652' ? 'selected' : ''}`} onClick={() => setLineColour('#09c652')}></li>
                            <li className={`option ${lineColour === '#5f18da' ? 'selected' : ''}`} onClick={() => setLineColour('#5f18da')}></li>
                            <li className={`option ${lineColour === '#7919b5' ? 'selected' : ''}`} onClick={() => setLineColour('#7919b5')}></li>
                            <li className={`option ${lineColour === '#ef4444' ? 'selected' : ''}`} onClick={() => setLineColour('#ef4444')}></li>
                            <li className={`option ${lineColour === '#0000ff' ? 'selected' : ''}`} onClick={() => setLineColour('#ff9500')}></li>
                            <li className={`option ${lineColour === '#f2ff3b' ? 'selected' : ''}`} onClick={() => setLineColour('#f2ff3b')}></li>
                        </ul>
                    </section>
                    
                    {/*LINE WIDTH*/}
                    <span className="sidebar-heading">Brush Size</span>
                    <section className="sizes">
                        <ul className="options">
                            <li className="option" onClick={() => setLineWidth(12)}><i className="fa-solid fa-circle fa-2xs"></i></li>
                            <li className="option" onClick={() => setLineWidth(4)}><i className="fa-solid fa-circle fa-xs"></i></li>
                            <li className="option" onClick={() => setLineWidth(18)}><i className="fa-solid fa-circle fa-sm"></i></li>
                            <li className="option" onClick={() => setLineWidth(2)}><i className="fa-solid fa-circle fa-lg"></i></li>
                            <li className="option" onClick={() => setLineWidth(8)}><i className="fa-solid fa-circle fa-xl"></i></li>
                        </ul>
                    </section>
                </section>
            </div>

            {/* TOOL BOARD */}
            <section className="tools-board">
                <span className="title">Tool Bar</span>
                <ul className="options">
                    <li 
                        className={`option ${tool === 'pen' ? 'active' : ''}`}
                        onClick={() => setTool('pen')}>
                        <i className="fa-solid fa-pen fa-xl"></i>
                    </li>
                    <li 
                        className={`option ${tool === 'rubber' ? 'active' : ''}`}
                        onClick={() => setTool('rubber')}>
                        <i className="fa-solid fa-eraser fa-xl"></i>
                    </li>
                    <li
                        className={`option ${tool === 'square' ? 'active' : ''}`}
                        onClick={() => setTool('square')}>
                        <i className="fa-solid fa-square fa-xl"></i>
                    </li>
                    <li
                        className={`option ${tool === 'circle' ? 'active' : ''}`}
                        onClick={() => setTool('circle')}>
                        <i className="fa-solid fa-circle fa-xl"></i>
                    </li>
                    <li className={`option ${stackIndex > 0 ? '' : 'disabled'}`}
                        onClick={redo}
                        style={{ 
                            opacity: stackIndex < stack.length - 1 ? 1 : 0.5, 
                            cursor: stackIndex < stack.length - 1 ? 'pointer' : 'not-allowed' 
                        }}>
                            <i className="fa-solid fa-arrow-rotate-left fa-xl"></i></li>
                    <li 
                        className={`option ${stackIndex < stack.length - 1 ? '' : 'disabled'}`}
                        onClick={undo}
                        style={{ opacity: stackIndex > 0 ? 1 : 0.5, cursor: stackIndex > 0 ? 'pointer' : 'not-allowed' }}>
                        <i className="fa-solid fa-arrow-rotate-right fa-xl"></i>
                    </li>
                    <li 
                        className={`option ${tool === 'fill' ? 'active' : ''}`} 
                        onClick={() => setTool('fill')}
                    >
                        <i className="fa-solid fa-fill fa-xl"></i>
                    </li>
                    <li className="option" onClick={download} ><i className="fa-solid fa-download fa-xl"></i></li>
                    <li       
                        className="option"
                        onClick={clearCanvas}>
                        <i className="fa-regular fa-trash-can fa-xl"></i>
                    </li>
                </ul>

                {/* SUBMIT BUTTON */}
                <button className="finalise-button" onClick={handleSubmit}>Submit</button> 
            </section>
        </div>
    )
}

export default Draw;