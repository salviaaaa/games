document.addEventListener('DOMContentLoaded', () => {
    // Loading Screen
    const loadingScreen = document.querySelector('.loading-screen');
    const pageContent = document.querySelector('.page-content');
    
    // Tampilkan loading screen selama 5ms
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('loading-hidden');
            
            // Tampilkan konten halaman setelah loading screen hilang
            setTimeout(() => {
                if (pageContent) {
                    pageContent.classList.add('visible');
                }
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }, 5); // 5ms sesuai permintaan
    
    const mario = document.getElementById('mario');
    const playButton = document.getElementById('playButton');
    let isJumping = false;
    let isWalking = false;
    let lastScrollPosition = window.pageYOffset;

    // Fungsi untuk menggerakkan Mario berdasarkan scroll
    function handleScroll() {
        const currentScroll = window.pageYOffset;
        const scrollDiff = currentScroll - lastScrollPosition;
        
        if (!mario) return;
        
        // Jika scroll ke bawah, Mario berjalan ke kanan
        if (scrollDiff > 0 && !isWalking) {
            mario.classList.add('mario-walk');
            mario.style.transform = 'scaleX(1)';
            isWalking = true;
        }
        // Jika scroll ke atas, Mario berjalan ke kiri
        else if (scrollDiff < 0 && !isWalking) {
            mario.classList.add('mario-walk');
            mario.style.transform = 'scaleX(-1)';
            isWalking = true;
        }
        // Jika tidak scroll, Mario berhenti
        else if (scrollDiff === 0 && isWalking) {
            mario.classList.remove('mario-walk');
            isWalking = false;
        }
        
        // Update posisi Mario berdasarkan scroll
        const marioPosition = parseInt(mario.style.left) || 150;
        const newPosition = marioPosition + (scrollDiff * 0.5);
        mario.style.left = `${Math.max(50, Math.min(newPosition, window.innerWidth - 100))}px`;
        
        lastScrollPosition = currentScroll;
        
        // Animate sections on scroll
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < window.innerHeight * 0.75) {
                section.classList.add('visible');
            }
        });
        
        // Move game elements based on scroll
        const gameElements = document.querySelectorAll('.scroll-element');
        gameElements.forEach(element => {
            const movement = currentScroll * 0.3;
            element.style.transform = `translateX(${movement}px)`;
        });
    }
    
    // Throttle scroll event
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 16); // ~60fps
        }
    });

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

    // Event listener untuk tombol Play Game
    if (playButton && mario) {
        playButton.addEventListener('click', () => {
            const buttonRect = playButton.getBoundingClientRect();
            
            isJumping = true;
            mario.style.left = `${buttonRect.left}px`;
            mario.classList.add('jump');
            
            setTimeout(() => {
                const footer = document.querySelector('.footer');
                if (footer) {
                    footer.style.transition = 'transform 0.8s cubic-bezier(0.86, 0, 0.07, 1)';
                    footer.style.transform = 'translateY(-100%)';
                }
                
                if (pageContent) {
                    pageContent.classList.remove('visible');
                }
                
                setTimeout(() => {
                    window.location.href = 'games.html';
                }, 800);
            }, 800);
        });
    }

    // Event listener untuk spasi (optional jump)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isJumping && mario) {
            isJumping = true;
            mario.classList.add('jump');
            
            setTimeout(() => {
                mario.classList.remove('jump');
                isJumping = false;
            }, 500);
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

    // Contact Page Interactions
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', () => {
            method.style.transform = 'translateY(-5px)';
        });
        
        method.addEventListener('mouseleave', () => {
            method.style.transform = 'translateY(0)';
        });
    });

    // Initialize sections visibility
    handleScroll();
});
