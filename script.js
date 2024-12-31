// Set up the scene, camera, and renderer
console.log('Setting up the scene...');
const scene = new THREE.Scene();

// Adjust FOV and position to zoom in
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // Smaller FOV for zooming in
camera.position.x = 0;   // Keep camera centered horizontally
camera.position.y = 0;   // Center vertically
camera.position.z = 8;  // Move the camera further out for better view

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Remove any existing canvas elements before adding the new one
const existingCanvas = document.querySelector('canvas');
if (existingCanvas) {
    existingCanvas.remove();  // Remove the previous canvas if it exists
}

document.body.appendChild(renderer.domElement); // Append the new canvas
renderer.setClearColor(0x000000, 1);  // Set background to black
console.log('Scene, camera, and renderer setup complete.');

// Add lighting
console.log('Adding ambient light...');
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft ambient light
scene.add(ambientLight);

console.log('Adding directional light...');
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Direct light to cast shadows
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Camera positioning - Move camera closer and zoom in
console.log('Camera positioned at x=0, y=0, z=10.');

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Update the camera's projection matrix to match the new aspect ratio
});



// Load Troye image as background texture
const textureLoader = new THREE.TextureLoader();
const troyeTexture = textureLoader.load('troye.png'); // Make sure the path to the image is correct

// Create a plane geometry for the background image
const planeGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({ map: troyeTexture, side: THREE.DoubleSide, transparent: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// Position the plane behind everything else
plane.position.set(0, 0, -5); // Adjust the Z-position to ensure it's behind the particles
scene.add(plane);


// Create grid background (dark blue with glowing effect)
console.log('Creating dark blue grid background...');
// Increase grid size and number of divisions for better visibility
const gridSize = 100; // Size of the grid
const gridDivisions = 50; // Number of divisions (lines) in the grid

// First grid (Top grid)
const gridHelperTop = new THREE.GridHelper(gridSize, gridDivisions, 0x0000ff, 0x00008b); // Dark blue grid
gridHelperTop.position.z = 5;  // Place the grid flat on the XY plane
gridHelperTop.position.x = 2;
gridHelperTop.position.y = 6;
scene.add(gridHelperTop);

// Apply glow effect to the first grid (top)
gridHelperTop.material.emissive = new THREE.Color(0x00008b); // Dark blue emissive color

// Second grid (Bottom grid)
const gridHelperBottom = new THREE.GridHelper(gridSize, gridDivisions, 0x0000ff, 0x00008b); // Dark blue grid
gridHelperBottom.position.z = -5; // Place the grid flat on the XY plane (flipped to the bottom)
gridHelperBottom.position.x = 2;
gridHelperBottom.position.y = -6;  // Adjust the y position to bring the second grid to the bottom
scene.add(gridHelperBottom);

// Apply glow effect to the second grid (bottom)
gridHelperBottom.material.emissive = new THREE.Color(0x00008b); // Dark blue emissive color


// Audio setup
console.log('Setting up audio context...');
const audio = document.getElementById('audioPlayer');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

// Set up the analyser for frequency data
analyser.fftSize = 256;  // Determines the frequency resolution
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
console.log(`Analyser setup complete with fftSize of ${analyser.fftSize} and bufferLength of ${bufferLength}.`);

audio.addEventListener('play', () => {
    const currentSong = audio.src.split('/').pop();  // Get the song filename
    animateSongText(currentSong); // Update the text for the song
    console.log('Audio started playing:', currentSong);
});

audio.addEventListener('pause', () => {
    console.log('Audio paused.');
});

audio.addEventListener('ended', () => {
    hideSongText();  // Hide text when the song ends

    // Move to the next song automatically
    currentSongIndex = (currentSongIndex + 1) % songList.length;
    loadAndPlaySong(currentSongIndex);
});


// GSAP Animation for text
function animateSongText(song) {
    const songText = document.getElementById("songText");

    // Set the appropriate text for each song
    if (song === 'bite.mp3') {
        songText.textContent = "Don't you want to see your man up close?";
    } else if (song === 'one-of-your-girls.mp3') {
        songText.textContent = "Give me a call if you ever get lonely";
    } else if (song === 'talk-me-down.mp3') {
        songText.textContent = "So if you don't mind, I'll walk that line";
    }

    // Animate text with GSAP (fade in)
    gsap.fromTo(songText, 
        { opacity: 0 }, 
        { opacity: 1, duration: 1, ease: "power2.inOut" }); // Fade in

    // Add the glowing effect (no pulsing)
    gsap.to(songText, {
        duration: 2,  // Duration for each dim-bright cycle
        repeat: -1,   // Infinite loop
        yoyo: true,   // Yoyo effect to go back and forth
        opacity: 1,   // Bright glow effect
        ease: "power1.inOut",
        textShadow: "0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #ff00ff",
    });

    // Show the text on the screen
    songText.style.display = "block";
}


// Song list and default index
const songList = [
    'bite.mp3',
    'talk-me-down.mp3',
    'one-of-your-girls.mp3',
    // Add more song files here
];
let currentSongIndex = 0;

// Function to load and play the selected song
function loadAndPlaySong(songIndex) {
    const currentSong = songList[songIndex];
    audio.src = currentSong;
    audio.load();
    audio.play();
    console.log(`Now playing: ${currentSong}`);

    // Trigger the song text change based on the current song
    if (currentSong === "bite.mp3") {
        animateSongText('bite.mp3');
    } else if (currentSong === "one-of-your-girls.mp3") {
        animateSongText('one-of-your-girls.mp3');
    } else if (currentSong === "talk-me-down.mp3") {
        animateSongText('talk-me-down.mp3');
    }
}


// Load the first song initially
loadAndPlaySong(currentSongIndex);

// Listen for the 'ended' event to load the next song
audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songList.length; // Loop back to the first song if at the end
    loadAndPlaySong(currentSongIndex);
});

// Listen for changes in the song selector dropdown
const songSelector = document.getElementById('songs');
songSelector.addEventListener('change', (event) => {
    const selectedSong = event.target.value;
    currentSongIndex = songList.indexOf(selectedSong); // Find the selected song's index
    loadAndPlaySong(currentSongIndex); // Load and play the selected song
});

// Load the first song initially
loadAndPlaySong(currentSongIndex);

// Listen for the 'ended' event to load the next song
audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songList.length; // Loop back to the first song if at the end
    loadAndPlaySong(currentSongIndex);
});

// Audio setup with explicit user interaction to start playback
document.body.addEventListener('click', () => {
    console.log('User clicked, resuming AudioContext...');
    // Ensure the audio context is resumed after a user gesture
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext resumed');
            audio.play();  // Ensure audio starts playing
        }).catch(error => {
            console.error('Error resuming AudioContext:', error);
        });
    } else {
        console.log('Audio is already playing.');
        audio.play();  // Play the audio if already started
    }
});





// Create particle system (spheres that pulse and change color)
console.log('Creating particle system...');
const particlesGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const particlesMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Start with pink color

const particles = [];
for (let i = 0; i < 300; i++) {  // Increased the particle count
    const particle = new THREE.Mesh(particlesGeometry, particlesMaterial);
    particle.position.set(
        Math.random() * 20 - 10,  // Random X position, increased range to span the screen
        Math.random() * 10 - 8,   // Random Y position, adjusted range to bring particles lower
        Math.random() * 20 - 10   // Random Z position, increased range to span the screen
    );
    scene.add(particle);
    particles.push(particle);
}
console.log(`${particles.length} particles created.`);


function animateParticles() {
    analyser.getByteFrequencyData(dataArray);

    // Adjust particle count based on audio frequency data (volume)
    let volume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;  // Average volume
    let targetParticleCount = Math.max(300, Math.floor(volume * 10));  // Increase particle count with volume (beat)

    // Adjust the number of particles dynamically
    if (particles.length < targetParticleCount) {
        for (let i = particles.length; i < targetParticleCount; i++) {
            const particle = new THREE.Mesh(particlesGeometry, particlesMaterial);
            particle.position.set(
                Math.random() * 20 - 10,  // Random X position
                Math.random() * 20 - 10,  // Random Y position
                Math.random() * 20 - 10   // Random Z position
            );
            scene.add(particle);
            particles.push(particle);
        }
    } else if (particles.length > targetParticleCount) {
        for (let i = particles.length - 1; i >= targetParticleCount; i--) {
            scene.remove(particles[i]);
            particles.splice(i, 1);
        }
    }

    // Update scale and color of the particles
    for (let i = 0; i < particles.length; i++) {
        const scale = dataArray[i % bufferLength] / 256; // Scale based on frequency
        particles[i].scale.set(scale, scale, scale); // Pulse effect
        
        // Update color based on frequency range (Dynamic colors)
        let color = new THREE.Color();
        const frequencyRange = scale * 2.5; // Amplify the color change based on frequency data
        color.setHSL(frequencyRange, 0.7, 0.5); // Vibrant HSL color shift
        particles[i].material.color = color;
    }
}

// Create waveform and change its color based on frequency
console.log('Creating waveform...');
const waveformGeometry = new THREE.BufferGeometry();
const waveformMaterial = new THREE.LineBasicMaterial({ color: 0xffa500 }); // Initial smooth orange color

const waveformVertices = [];
for (let i = 0; i < bufferLength; i++) {
    waveformVertices.push(i / bufferLength * 10 - 5, 0, 0); // X positions across the screen
}
waveformGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waveformVertices, 3));

const waveform = new THREE.Line(waveformGeometry, waveformMaterial);
scene.add(waveform);

function updateWaveform() {
    analyser.getByteFrequencyData(dataArray);

    let voiceSensitiveFactor = 1.5; // Control sensitivity to voice (can adjust to taste)
    
    for (let i = 0; i < bufferLength; i++) {
        // Increase sensitivity to mid-range frequencies for vocal presence (singer's voice)
        const adjustedData = (dataArray[i] / 256) * 5 * Math.sin(i * 0.2);  // Making it more responsive
        waveformGeometry.attributes.position.setY(i * 3, adjustedData); // Smooth sine wave
    }
    

    waveformGeometry.attributes.position.needsUpdate = true;

    // Change color based on energy and frequency
    let averageFrequency = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    let color = new THREE.Color();
    
    // Make color dynamic: hue shifts based on average frequency (with intensity affecting saturation)
    const hue = averageFrequency / 256;  // Hue shifts with energy
    const saturation = 0.7;  // Fixed saturation
    const lightness = averageFrequency / 256 * 0.5 + 0.5;  // Lightness depending on average frequency
    
    color.setHSL(hue, saturation, lightness);  // Apply dynamic color change
    waveform.material.color = color;
}


// Render loop
function animate() {
    requestAnimationFrame(animate);

    animateParticles();
    updateWaveform();

    renderer.render(scene, camera);
}

console.log('Starting animation loop...');
animate();
