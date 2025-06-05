// Music Player Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Background Music
    const bgMusic = new Audio(window.location.pathname.includes('/games/') ? '../../assets/super-mario-bros.mp3' : 'assets/super-mario-bros.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5; // Set volume to 50%
    let isMusicPlaying = true;
    
    // Music Player Container
    const musicPlayerContainer = document.getElementById('musicPlayerContainer');
    const musicStatus = document.getElementById('musicStatus');
    
    // Function to toggle music
    function toggleMusic() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicStatus.innerHTML = '<i class="fas fa-play"></i>';
            musicPlayerContainer.setAttribute('data-playing', 'false');
        } else {
            bgMusic.play();
            musicStatus.innerHTML = '<i class="fas fa-pause"></i>';
            musicPlayerContainer.setAttribute('data-playing', 'true');
        }
        isMusicPlaying = !isMusicPlaying;
    }
    
    // Add click event to music player container
    if (musicPlayerContainer) {
        musicPlayerContainer.addEventListener('click', toggleMusic);
    }
    
    // Try to play music automatically
    const playPromise = bgMusic.play();
    
    // Handle autoplay restrictions
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Auto-play was prevented
            // Show a UI element to let the user manually start playback
            console.log('Autoplay prevented. Adding click event to start music.');
            isMusicPlaying = false;
            if (musicStatus) musicStatus.innerHTML = '<i class="fas fa-play"></i>';
            if (musicPlayerContainer) musicPlayerContainer.setAttribute('data-playing', 'false');
            
            // Add click event to the document to start music on first interaction
            document.addEventListener('click', () => {
                bgMusic.play();
                isMusicPlaying = true;
                if (musicStatus) musicStatus.innerHTML = '<i class="fas fa-pause"></i>';
                if (musicPlayerContainer) musicPlayerContainer.setAttribute('data-playing', 'true');
            }, { once: true });
        });
    }
    
    // Ensure music restarts if it somehow ends
    bgMusic.addEventListener('ended', () => {
        bgMusic.currentTime = 0;
        bgMusic.play();
    });
});