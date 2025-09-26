// Variables globales
let shapes = []; // Array para almacenar las formas dibujadas
let isDrawing = false;
let currentShape = null;

// Variables de configuración
let brushColor = '#ff6b6b';
let brushSize = 20;
let shapeType = 'circle';
let synthType = 'sine';
let scaleType = 'pentatonic';
let masterVolume = 0.5;

// Audio variables
let synth;
let audioContext;
let isPlaying = false;
let playbackInterval;

// Escalas musicales
const scales = {
    pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'],
    major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
    chromatic: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']
};

// Configuración de p5.js
function setup() {
    // Crear canvas de 800x600 píxeles
    let canvas = createCanvas(800, 600);
    
    // Mover el canvas al contenedor específico
    canvas.parent('canvas-wrapper');
    
    // Configurar el canvas
    background(0);
    colorMode(HSB, 360, 100, 100, 100);
    
    // Inicializar audio
    initializeAudio();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('Aplicación de Dibujo Sonoro inicializada');
}

function draw() {
    // Dibujar todas las formas almacenadas
    background(0, 0, 5, 10); // Fondo semi-transparente para efecto de estela
    
    for (let shape of shapes) {
        drawShape(shape);
    }
    
    // Mostrar información en tiempo real
    updateUI();
}

// Funciones de dibujo con p5.js
function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        isDrawing = true;
        
        // Crear nueva forma
        currentShape = {
            x: mouseX,
            y: mouseY,
            size: brushSize,
            color: brushColor,
            type: shapeType,
            timestamp: millis(),
            id: Date.now() + Math.random()
        };
        
        // Agregar la forma al array
        shapes.push(currentShape);
        
        // Reproducir sonido inmediatamente
        playShapeSound(currentShape);
        
        // Agregar efecto visual al canvas
        document.getElementById('canvas-wrapper').classList.add('drawing-active');
    }
}

function mouseDragged() {
    if (isDrawing && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Crear formas continuas durante el arrastre
        currentShape = {
            x: mouseX,
            y: mouseY,
            size: brushSize,
            color: brushColor,
            type: shapeType,
            timestamp: millis(),
            id: Date.now() + Math.random()
        };
        
        shapes.push(currentShape);
        
        // Reproducir sonido con menor frecuencia durante el arrastre
        if (frameCount % 5 === 0) {
            playShapeSound(currentShape);
        }
    }
}

function mouseReleased() {
    isDrawing = false;
    currentShape = null;
    document.getElementById('canvas-wrapper').classList.remove('drawing-active');
}

function drawShape(shape) {
    push();
    
    // Convertir color hex a HSB
    let c = color(shape.color);
    let h = hue(c);
    let s = saturation(c);
    let b = brightness(c);
    
    fill(h, s, b, 80);
    stroke(h, s, b + 20);
    strokeWeight(2);
    
    // Dibujar según el tipo de forma
    switch (shape.type) {
        case 'circle':
            ellipse(shape.x, shape.y, shape.size);
            break;
        case 'square':
            rectMode(CENTER);
            rect(shape.x, shape.y, shape.size, shape.size);
            break;
        case 'triangle':
            let halfSize = shape.size / 2;
            triangle(
                shape.x, shape.y - halfSize,
                shape.x - halfSize, shape.y + halfSize,
                shape.x + halfSize, shape.y + halfSize
            );
            break;
    }
    
    pop();
}

// Funciones de audio con Tone.js
async function initializeAudio() {
    try {
        // Inicializar Tone.js
        await Tone.start();
        
        // Crear sintetizador
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: synthType
            },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.4,
                release: 0.8
            }
        }).toDestination();
        
        // Configurar volumen inicial
        Tone.getDestination().volume.value = Tone.gainToDb(masterVolume);
        
        console.log('Audio inicializado correctamente');
        
        // Actualizar estado en UI
        document.getElementById('audio-status').textContent = 'Listo';
        
    } catch (error) {
        console.error('Error inicializando audio:', error);
        document.getElementById('audio-status').textContent = 'Error';
    }
}

function playShapeSound(shape) {
    if (!synth) return;
    
    try {
        // Mapear posición Y a nota musical (invertido para que arriba sea más agudo)
        let noteIndex = Math.floor(map(height - shape.y, 0, height, 0, scales[scaleType].length - 1));
        noteIndex = constrain(noteIndex, 0, scales[scaleType].length - 1);
        let note = scales[scaleType][noteIndex];
        
        // Mapear tamaño a duración (formas más grandes = sonidos más largos)
        let duration = map(shape.size, 5, 50, 0.1, 1.0);
        
        // Mapear color a efectos sutiles en el timbre
        let c = color(shape.color);
        let hueValue = hue(c);
        let detune = map(hueValue, 0, 360, -50, 50);
        
        // Configurar parámetros del sintetizador basados en la forma
        let synthParams = {
            oscillator: {
                type: synthType,
                detune: detune
            }
        };
        
        // Diferentes configuraciones según el tipo de forma
        switch (shape.type) {
            case 'circle':
                synthParams.envelope = { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 };
                break;
            case 'square':
                synthParams.envelope = { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.4 };
                break;
            case 'triangle':
                synthParams.envelope = { attack: 0.2, decay: 0.5, sustain: 0.2, release: 1.2 };
                break;
        }
        
        // Actualizar sintetizador
        synth.set(synthParams);
        
        // Tocar la nota
        synth.triggerAttackRelease(note, duration);
        
    } catch (error) {
        console.error('Error reproduciendo sonido:', error);
    }
}

function playDrawing() {
    if (shapes.length === 0) {
        alert('¡Dibuja algo primero!');
        return;
    }
    
    if (isPlaying) {
        stopAudio();
        return;
    }
    
    isPlaying = true;
    document.getElementById('audio-status').textContent = 'Reproduciendo';
    document.getElementById('play-drawing').textContent = '⏸️ Pausar';
    document.getElementById('canvas-wrapper').classList.add('audio-playing');
    
    // Ordenar formas por tiempo de creación
    let sortedShapes = [...shapes].sort((a, b) => a.timestamp - b.timestamp);
    let startTime = sortedShapes[0].timestamp;
    
    // Reproducir cada forma en secuencia temporal
    sortedShapes.forEach((shape, index) => {
        let delay = (shape.timestamp - startTime) / 1000; // Convertir a segundos
        
        setTimeout(() => {
            if (isPlaying) {
                playShapeSound(shape);
                
                // Efecto visual de resaltado
                highlightShape(shape);
            }
        }, delay * 1000); // Convertir de vuelta a milisegundos
    });
    
    // Detener automáticamente al final
    let totalDuration = (sortedShapes[sortedShapes.length - 1].timestamp - startTime) + 2000;
    setTimeout(() => {
        if (isPlaying) {
            stopAudio();
        }
    }, totalDuration);
}

function highlightShape(shape) {
    // Agregar un efecto visual temporal para mostrar qué forma está sonando
    push();
    stroke(60, 100, 100); // Amarillo brillante
    strokeWeight(4);
    noFill();
    
    switch (shape.type) {
        case 'circle':
            ellipse(shape.x, shape.y, shape.size + 10);
            break;
        case 'square':
            rectMode(CENTER);
            rect(shape.x, shape.y, shape.size + 10, shape.size + 10);
            break;
        case 'triangle':
            let halfSize = (shape.size + 10) / 2;
            triangle(
                shape.x, shape.y - halfSize,
                shape.x - halfSize, shape.y + halfSize,
                shape.x + halfSize, shape.y + halfSize
            );
            break;
    }
    pop();
}

function stopAudio() {
    isPlaying = false;
    document.getElementById('audio-status').textContent = 'Detenido';
    document.getElementById('play-drawing').textContent = '▶️ Reproducir Dibujo';
    document.getElementById('canvas-wrapper').classList.remove('audio-playing');
    
    // Detener todos los sonidos
    if (synth) {
        synth.releaseAll();
    }
}

// Event listeners para controles
function setupEventListeners() {
    // Control de color
    document.getElementById('brush-color').addEventListener('change', (e) => {
        brushColor = e.target.value;
    });
    
    // Control de tamaño
    document.getElementById('brush-size').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('brush-size-value').textContent = brushSize;
    });
    
    // Control de forma
    document.getElementById('shape-type').addEventListener('change', (e) => {
        shapeType = e.target.value;
    });
    
    // Control de volumen
    document.getElementById('master-volume').addEventListener('input', (e) => {
        masterVolume = parseInt(e.target.value) / 100;
        document.getElementById('volume-value').textContent = e.target.value + '%';
        
        if (Tone.getDestination()) {
            Tone.getDestination().volume.value = Tone.gainToDb(masterVolume);
        }
    });
    
    // Control de tipo de sintetizador
    document.getElementById('synth-type').addEventListener('change', (e) => {
        synthType = e.target.value;
        if (synth) {
            synth.set({
                oscillator: { type: synthType }
            });
        }
    });
    
    // Control de escala musical
    document.getElementById('scale-type').addEventListener('change', (e) => {
        scaleType = e.target.value;
    });
    
    // Botones de control
    document.getElementById('clear-canvas').addEventListener('click', () => {
        shapes = [];
        background(0);
        updateUI();
    });
    
    document.getElementById('play-drawing').addEventListener('click', playDrawing);
    document.getElementById('stop-audio').addEventListener('click', stopAudio);
    
    // Manejo de resize de ventana
    window.addEventListener('resize', () => {
        // p5.js maneja automáticamente el resize
    });
}

function updateUI() {
    // Actualizar contador de formas
    document.getElementById('shapes-count').textContent = shapes.length;
}

// Funciones auxiliares
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, esperando a que p5.js inicialice...');
});