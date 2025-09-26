// Variables globales del juego
let stars = []; // Estrellas de la constelación actual
let connections = []; // Líneas dibujadas por el usuario
let correctConnections = []; // Conexiones correctas completadas
let currentStarIndex = 0; // Siguiente estrella a conectar
let gameComplete = false;
let currentConstellation = 'leo';
let showHints = true;

// Variables de configuración
let synthType = 'sine';
let scaleType = 'pentatonic';
let masterVolume = 0.5;

// Audio variables
let synth;
let melodyNotes = [];
let currentNoteIndex = 0;
let isPlaying = false;

// Datos de las constelaciones
const constellations = {
    leo: {
        name: "Leo (El León)",
        stars: [
            { x: 200, y: 150, name: "Regulus", brightness: 1.4 },
            { x: 280, y: 180, name: "Algieba", brightness: 2.1 },
            { x: 350, y: 160, name: "Adhafera", brightness: 3.4 },
            { x: 380, y: 200, name: "Ras Elased", brightness: 3.8 },
            { x: 320, y: 250, name: "Chertan", brightness: 3.3 },
            { x: 250, y: 280, name: "Denebola", brightness: 2.1 },
            { x: 180, y: 240, name: "Zosma", brightness: 2.6 }
        ],
        connections: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]
        ],
        melody: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4']
    },
    acuario: {
        name: "Acuario (El Aguador)",
        stars: [
            { x: 150, y: 120, name: "Sadalsuud", brightness: 2.9 },
            { x: 220, y: 140, name: "Sadalmelik", brightness: 3.0 },
            { x: 280, y: 160, name: "Sadachbia", brightness: 3.8 },
            { x: 340, y: 200, name: "Skat", brightness: 3.3 },
            { x: 300, y: 260, name: "Albali", brightness: 3.7 },
            { x: 240, y: 280, name: "Ancha", brightness: 4.2 },
            { x: 180, y: 250, name: "Situla", brightness: 4.8 }
        ],
        connections: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 5]
        ],
        melody: ['A3', 'C4', 'E4', 'A4', 'F4', 'D4', 'A3']
    },
    orion: {
        name: "Orión (El Cazador)",
        stars: [
            { x: 250, y: 100, name: "Betelgeuse", brightness: 0.5 },
            { x: 350, y: 120, name: "Bellatrix", brightness: 1.6 },
            { x: 200, y: 200, name: "Alnitak", brightness: 1.8 },
            { x: 250, y: 210, name: "Alnilam", brightness: 1.7 },
            { x: 300, y: 220, name: "Mintaka", brightness: 2.2 },
            { x: 380, y: 280, name: "Rigel", brightness: 0.1 },
            { x: 180, y: 320, name: "Saiph", brightness: 2.1 }
        ],
        connections: [
            [0, 1], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2], [0, 2], [1, 4]
        ],
        melody: ['G3', 'D4', 'G4', 'B4', 'D5', 'G4', 'D4', 'G3']
    },
    osamayor: {
        name: "Osa Mayor (El Gran Carro)",
        stars: [
            { x: 150, y: 180, name: "Dubhe", brightness: 1.8 },
            { x: 220, y: 160, name: "Merak", brightness: 2.4 },
            { x: 290, y: 170, name: "Phecda", brightness: 2.4 },
            { x: 360, y: 180, name: "Megrez", brightness: 3.3 },
            { x: 420, y: 160, name: "Alioth", brightness: 1.8 },
            { x: 480, y: 170, name: "Mizar", brightness: 2.1 },
            { x: 540, y: 190, name: "Alkaid", brightness: 1.9 }
        ],
        connections: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 0]
        ],
        melody: ['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5']
    },
    casiopea: {
        name: "Casiopea (La Reina)",
        stars: [
            { x: 180, y: 150, name: "Caph", brightness: 2.3 },
            { x: 250, y: 200, name: "Schedar", brightness: 2.2 },
            { x: 320, y: 160, name: "Gamma Cas", brightness: 2.5 },
            { x: 390, y: 220, name: "Ruchbah", brightness: 2.7 },
            { x: 460, y: 180, name: "Segin", brightness: 3.4 }
        ],
        connections: [
            [0, 1], [1, 2], [2, 3], [3, 4]
        ],
        melody: ['E4', 'G4', 'B4', 'E5', 'B4']
    },
    cruz: {
        name: "Cruz del Sur",
        stars: [
            { x: 280, y: 120, name: "Acrux", brightness: 0.8 },
            { x: 320, y: 180, name: "Gacrux", brightness: 1.6 },
            { x: 280, y: 240, name: "Imai", brightness: 2.8 },
            { x: 240, y: 180, name: "Mimosa", brightness: 1.3 },
            { x: 350, y: 150, name: "Intrometida", brightness: 4.0 }
        ],
        connections: [
            [0, 2], [1, 3], [0, 1], [1, 2], [2, 3], [3, 0]
        ],
        melody: ['D4', 'F#4', 'A4', 'D5', 'A4']
    }
};

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
    background(0, 5, 20); // Azul oscuro nocturno
    colorMode(HSB, 360, 100, 100, 100);
    
    // NO inicializar audio automáticamente para evitar advertencias
    // initializeAudio();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar constelación inicial
    loadConstellation(currentConstellation);
    
    console.log('Juego de Constelaciones inicializado');
}

function draw() {
    // Cielo nocturno con estrellas de fondo
    drawNightSky();
    
    // Dibujar las conexiones completadas
    drawCompletedConnections();
    
    // Dibujar las estrellas de la constelación
    drawConstellationStars();
    
    // Mostrar información en tiempo real
    updateUI();
}

// Variables para estrellas de fondo
let backgroundStars = [];

function drawNightSky() {
    // Gradiente de cielo nocturno
    background(240, 80, 10); // Azul muy oscuro
    
    // Generar estrellas de fondo una sola vez
    if (backgroundStars.length === 0) {
        for (let i = 0; i < 100; i++) {
            backgroundStars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1,
                brightness: Math.random() * 60 + 40
            });
        }
    }
    
    // Dibujar estrellas de fondo
    fill(50, 20, 90, 30);
    noStroke();
    for (let star of backgroundStars) {
        ellipse(star.x, star.y, star.size);
    }
}

function drawConstellationStars() {
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        let isNext = (i === currentStarIndex);
        let isClickable = (i === currentStarIndex || (currentStarIndex > 0 && i === currentStarIndex - 1));
        
        // Determinar el color y brillo de la estrella
        let hue = 50; // Amarillo dorado
        let saturation = 60;
        let brightness = map(star.brightness, 0, 5, 100, 40); // Estrellas más brillantes = más luminosas
        
        if (isNext && showHints) {
            // Estrella siguiente: pulsar en amarillo brillante
            brightness = 90 + 10 * sin(frameCount * 0.1);
            saturation = 80;
        } else if (!isClickable) {
            // Estrellas no disponibles: más tenues
            brightness *= 0.5;
            saturation = 20;
        }
        
        // Dibujar el resplandor de la estrella
        push();
        drawingContext.shadowColor = color(hue, saturation, brightness);
        drawingContext.shadowBlur = 20;
        
        fill(hue, saturation, brightness);
        noStroke();
        
        // Tamaño basado en brillo real de la estrella
        let size = map(star.brightness, 0, 5, 12, 6);
        ellipse(star.x, star.y, size);
        
        // Puntos de luz adicionales para efecto de centelleo
        if (frameCount % 30 < 15) {
            fill(hue, 40, 100, 60);
            ellipse(star.x, star.y, size * 1.5);
        }
        
        pop();
        
        // Mostrar nombre de la estrella si está cerca del mouse
        let distance = dist(mouseX, mouseY, star.x, star.y);
        if (distance < 30) {
            fill(0, 0, 100);
            textAlign(CENTER);
            textSize(12);
            text(star.name, star.x, star.y - 20);
        }
        
        // Mostrar número de orden si las pistas están activadas
        if (showHints && isNext) {
            fill(120, 100, 100); // Verde brillante
            textAlign(CENTER);
            textSize(14);
            text(i + 1, star.x, star.y + 25);
        }
    }
}

function drawCompletedConnections() {
    stroke(120, 60, 80, 80); // Verde suave
    strokeWeight(3);
    
    for (let connection of correctConnections) {
        let star1 = stars[connection.from];
        let star2 = stars[connection.to];
        
        // Efecto de línea animada
        drawingContext.shadowColor = color(120, 60, 100);
        drawingContext.shadowBlur = 10;
        
        line(star1.x, star1.y, star2.x, star2.y);
        
        // Partículas en movimiento a lo largo de la línea
        let t = (frameCount * 0.02) % 1;
        let x = lerp(star1.x, star2.x, t);
        let y = lerp(star1.y, star2.y, t);
        
        fill(120, 80, 100, 60);
        noStroke();
        ellipse(x, y, 6);
    }
}

// Funciones de interacción del juego
function mousePressed() {
    if (gameComplete) return;
    
    // Buscar si se hizo clic en una estrella
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        let distance = dist(mouseX, mouseY, star.x, star.y);
        
        if (distance < 30) { // Radio de detección
            handleStarClick(i);
            break;
        }
    }
}

async function handleStarClick(starIndex) {
    // Solo permitir clic en la siguiente estrella en secuencia
    if (starIndex !== currentStarIndex) {
        // Efecto de error
        showError("¡Conecta las estrellas en orden!");
        return;
    }
    
    // Inicializar audio en la primera interacción
    if (!audioInitialized) {
        await startAudioContext();
    }
    
    // Si hay una estrella anterior, crear la conexión
    if (currentStarIndex > 0) {
        let connection = {
            from: currentStarIndex - 1,
            to: currentStarIndex
        };
        correctConnections.push(connection);
        
        // Reproducir nota correspondiente
        playConnectionSound(currentStarIndex - 1);
        
        // Efecto visual de conexión exitosa
        showSuccess();
    } else {
        // Primera estrella, solo reproducir su sonido
        playConnectionSound(0);
    }
    
    // Avanzar a la siguiente estrella
    currentStarIndex++;
    
    // Verificar si se completó la constelación
    if (currentStarIndex >= stars.length) {
        completeConstellation();
    }
    
    updateGameInfo();
}

function loadConstellation(constellationKey) {
    let constellation = constellations[constellationKey];
    if (!constellation) return;
    
    stars = constellation.stars.map(star => ({...star}));
    correctConnections = [];
    currentStarIndex = 0;
    gameComplete = false;
    melodyNotes = [...constellation.melody];
    currentNoteIndex = 0;
    
    // Actualizar UI
    document.getElementById('current-constellation').textContent = constellation.name;
    document.getElementById('next-star').textContent = stars[0].name;
    document.getElementById('game-status').textContent = 'Listo para jugar';
    
    updateGameInfo();
}

function completeConstellation() {
    gameComplete = true;
    document.getElementById('game-status').textContent = '¡Constelación completada!';
    
    // Reproducir melodía completa
    setTimeout(() => {
        playCompleteMelody();
    }, 500);
    
    // Agregar a logros
    addAchievement(currentConstellation);
    
    // Efectos visuales de celebración
    celebrateCompletion();
}

function showError(message) {
    // Efecto visual de error
    document.getElementById('canvas-wrapper').style.border = '3px solid #ff4444';
    setTimeout(() => {
        document.getElementById('canvas-wrapper').style.border = '';
    }, 500);
    
    // Mostrar mensaje temporal
    document.getElementById('game-status').textContent = message;
    setTimeout(() => {
        document.getElementById('game-status').textContent = 'Continúa conectando...';
    }, 2000);
}

function showSuccess() {
    // Efecto visual de éxito
    document.getElementById('canvas-wrapper').style.border = '3px solid #44ff44';
    setTimeout(() => {
        document.getElementById('canvas-wrapper').style.border = '';
    }, 300);
}

function celebrateCompletion() {
    // Efecto de partículas de celebración
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            let x = random(width);
            let y = random(height);
            drawCelebrationParticle(x, y);
        }, i * 50);
    }
}

function drawCelebrationParticle(x, y) {
    push();
    fill(random(0, 360), 80, 100, 80);
    noStroke();
    ellipse(x, y, random(5, 15));
    pop();
}

// Variables de estado del audio
let audioInitialized = false;

// Funciones de audio con Tone.js
async function initializeAudio() {
    // Solo mostrar mensaje, no inicializar nada hasta interacción del usuario
    updateAudioStatus('Listo para iniciar');
}

async function startAudioContext() {
    if (audioInitialized) return;
    
    try {
        // Inicializar Tone.js después de interacción del usuario
        await Tone.start();
        
        // Crear sintetizador polifónico para las constelaciones
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: synthType
            },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.7,
                release: 1.2
            }
        }).toDestination();
        
        // Configurar volumen inicial
        Tone.getDestination().volume.value = Tone.gainToDb(masterVolume);
        
        audioInitialized = true;
        console.log('Audio inicializado correctamente');
        
        // Actualizar UI para mostrar que el audio está listo
        updateAudioStatus('Listo');
        
    } catch (error) {
        console.error('Error inicializando audio:', error);
        updateAudioStatus('Error');
    }
}

function updateAudioStatus(status) {
    // Actualizar algún elemento de UI si existe
    const statusElement = document.getElementById('audio-status');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

async function playConnectionSound(starIndex) {
    // Asegurar que el audio esté inicializado
    if (!audioInitialized) {
        await startAudioContext();
    }
    
    if (!synth || !melodyNotes[starIndex]) return;
    
    try {
        let note = melodyNotes[starIndex];
        let duration = '8n'; // Octava nota
        
        // Configurar el sintetizador
        synth.set({
            oscillator: { type: synthType },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.7,
                release: 1.2
            }
        });
        
        // Tocar la nota
        synth.triggerAttackRelease(note, duration);
        
        console.log(`Nota tocada: ${note} (estrella ${starIndex})`);
        
    } catch (error) {
        console.error('Error reproduciendo sonido de conexión:', error);
    }
}

async function playCompleteMelody() {
    // Asegurar que el audio esté inicializado
    if (!audioInitialized) {
        await startAudioContext();
    }
    
    if (!synth || !melodyNotes.length) return;
    
    isPlaying = true;
    document.getElementById('canvas-wrapper').classList.add('audio-playing');
    
    // Reproducir toda la melodía en secuencia
    melodyNotes.forEach((note, index) => {
        setTimeout(() => {
            if (isPlaying) {
                synth.triggerAttackRelease(note, '4n'); // Negras para la melodía completa
                
                // Resaltar la estrella correspondiente
                if (index < stars.length) {
                    highlightStar(index);
                }
            }
        }, index * 600); // 600ms entre notas
    });
    
    // Detener al final
    setTimeout(() => {
        stopAudio();
    }, melodyNotes.length * 600 + 1000);
}

function highlightStar(starIndex) {
    if (!stars[starIndex]) return;
    
    let star = stars[starIndex];
    
    // Crear efecto de resplandor temporal
    setTimeout(() => {
        push();
        drawingContext.shadowColor = color(60, 100, 100);
        drawingContext.shadowBlur = 30;
        fill(60, 100, 100, 80);
        noStroke();
        ellipse(star.x, star.y, 25);
        pop();
    }, 0);
}

function stopAudio() {
    isPlaying = false;
    document.getElementById('canvas-wrapper').classList.remove('audio-playing');
    
    // Detener todos los sonidos
    if (synth && synth.releaseAll) {
        synth.releaseAll();
    }
}

// Event listeners para controles
function setupEventListeners() {
    // Selector de constelación
    document.getElementById('constellation-select').addEventListener('change', (e) => {
        currentConstellation = e.target.value;
        loadConstellation(currentConstellation);
    });
    
    // Control de pistas visuales
    document.getElementById('show-hints').addEventListener('change', (e) => {
        showHints = e.target.checked;
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
    
    // Botones de control del juego
    document.getElementById('new-game').addEventListener('click', () => {
        loadConstellation(currentConstellation);
    });
    
    document.getElementById('reset-current').addEventListener('click', () => {
        resetCurrentGame();
    });
    
    document.getElementById('play-melody').addEventListener('click', () => {
        if (gameComplete) {
            playCompleteMelody();
        } else {
            alert('¡Completa la constelación primero para escuchar la melodía!');
        }
    });
    
    document.getElementById('stop-audio').addEventListener('click', stopAudio);
}

function resetCurrentGame() {
    correctConnections = [];
    currentStarIndex = 0;
    gameComplete = false;
    currentNoteIndex = 0;
    
    document.getElementById('game-status').textContent = 'Juego reiniciado';
    updateGameInfo();
}

function updateGameInfo() {
    let constellation = constellations[currentConstellation];
    if (!constellation) return;
    
    // Actualizar progreso
    let progress = `${currentStarIndex}/${stars.length}`;
    document.getElementById('progress').textContent = progress;
    
    // Actualizar siguiente estrella
    if (currentStarIndex < stars.length) {
        document.getElementById('next-star').textContent = stars[currentStarIndex].name;
    } else {
        document.getElementById('next-star').textContent = '¡Completado!';
    }
}

function addAchievement(constellationKey) {
    let constellation = constellations[constellationKey];
    let achievementsDiv = document.getElementById('completed-constellations');
    
    // Verificar si ya existe
    if (achievementsDiv.querySelector(`[data-constellation="${constellationKey}"]`)) {
        return;
    }
    
    // Crear nuevo logro
    let achievement = document.createElement('div');
    achievement.className = 'achievement-item';
    achievement.setAttribute('data-constellation', constellationKey);
    achievement.innerHTML = `
        <span class="achievement-icon">⭐</span>
        <span class="achievement-name">${constellation.name}</span>
    `;
    
    achievementsDiv.appendChild(achievement);
}

function updateUI() {
    updateGameInfo();
}

// Funciones auxiliares
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Funciones auxiliares adicionales (por si p5.js no está disponible)
function lerp(start, stop, amt) {
    return start + (stop - start) * amt;
}

function randomSeed(seed) {
    // Implementación simple de random con seed
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, esperando a que p5.js inicialice...');
});