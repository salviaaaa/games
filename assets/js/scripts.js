document.addEventListener('DOMContentLoaded', () => {
    // Loading Screen
    const loadingScreen = document.querySelector('.loading-screen');
    
    // Tampilkan content setelah 5 millisecond
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('loading-hidden');
            
            // Hapus loading screen setelah transisi selesai
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 500); // 500ms = 0.5 detik (loading terlalu cepat jika hanya 5ms)
    
    const mario = document.getElementById('mario');
    const playButton = document.getElementById('playButton');
    let isJumping = false;

    // Fungsi untuk menggerakkan Mario mengikuti kursor
    document.addEventListener('mousemove', (e) => {
        // Jangan pindahkan Mario jika sedang melompat
        if (isJumping || !mario) return;
        
        const mouseX = e.clientX;
        
        // Batasi pergerakan Mario agar tetap dalam area tampilan
        const screenWidth = window.innerWidth;
        const marioWidth = mario.offsetWidth;
        
        let newX = mouseX - (marioWidth / 2);
        newX = Math.max(50, Math.min(newX, screenWidth - marioWidth - 50));
        
        mario.style.left = `${newX}px`;
    });

    // Fungsi untuk membuat Mario melompat
    function jump() {
        if (!mario || isJumping) return;
        
        isJumping = true;
        mario.classList.add('jump');
        
        setTimeout(() => {
            mario.classList.remove('jump');
            isJumping = false;
        }, 500);
    }

    // Event listener untuk tombol Play Game (hanya di halaman utama)
    if (playButton && mario) {
        playButton.addEventListener('click', () => {
            // Animasi Mario melompat ke tombol
            const buttonRect = playButton.getBoundingClientRect();
            
            isJumping = true;
            mario.style.left = `${buttonRect.left}px`;
            mario.classList.add('jump');
            
            // Pindah ke halaman games.html setelah animasi selesai
            setTimeout(() => {
                // Animasi transisi halaman - hanya footer yang bergerak
                const footer = document.querySelector('.footer');
                
                if (footer) {
                    // Buat animasi transisi footer
                    footer.style.transition = 'transform 0.8s cubic-bezier(0.86, 0, 0.07, 1)';
                    footer.style.transform = 'translateY(-100%)';
                }
                
                setTimeout(() => {
                    window.location.href = 'games.html';
                }, 800);
            }, 800);
        });
    }

    // Event listener untuk spasi (optional jump)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            jump();
        }
    });

    // Animasi sederhana untuk Mario di halaman games
    if (window.location.pathname.includes('games.html')) {
        // Posisikan Mario di sebelah kiri
        if (mario) {
            mario.style.left = '100px';
            
            // Tambahkan animasi lompat ketika halaman dimuat
            setTimeout(() => {
                jump();
            }, 500);
        }
    }
    
    // Pastikan elemen-elemen game responsif saat resize
    window.addEventListener('resize', () => {
        if (mario) {
            // Reset posisi Mario saat ukuran layar berubah
            mario.style.left = '100px';
        }
    });
});
