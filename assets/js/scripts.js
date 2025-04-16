document.addEventListener('DOMContentLoaded', () => {
    /**
     * Loading Screen Configuration
     * -------------------------------
     * Menampilkan animasi loading saat halaman pertama kali dibuka
     * Note: setTimeout 5ms dipilih untuk memberikan kesan instant loading
     * tapi tetap memberi waktu browser untuk render animasi
     */
    const loadingScreen = document.querySelector('.loading-screen');
    const pageContent = document.querySelector('.page-content');
    
    // Loading screen hanya ditampilkan 5ms untuk UX yang cepat
    setTimeout(() => {
        if (loadingScreen) {
            // Tambahkan class untuk animasi fade out
            loadingScreen.classList.add('loading-hidden');
            
            // Setelah fade out, tampilkan konten utama dengan animasi
            setTimeout(() => {
                if (pageContent) {
                    pageContent.classList.add('visible');
                }
                loadingScreen.style.display = 'none';
            }, 300); // 300ms sesuai dengan durasi transisi CSS
        }
    }, 5);
    
    /**
     * Mario Character Control Variables
     * -------------------------------
     * mario: Referensi ke element Mario
     * playButton: Tombol untuk memulai game
     * isJumping: Status lompatan Mario
     * isWalking: Status jalan Mario
     * lastScrollPosition: Posisi scroll terakhir untuk animasi
     * Note: isJumping dan isWalking mencegah multiple animasi
     * berjalan secara bersamaan yang bisa menyebabkan glitch visual
     */
    const mario = document.getElementById('mario');
    const playButton = document.getElementById('playButton');
    let isJumping = false;
    let isWalking = false;
    let lastScrollPosition = window.pageYOffset;

    /**
     * Scroll Handler Function
     * -------------------------------
     * Mengatur pergerakan Mario dan elemen lain berdasarkan scroll
     * 1. Mario berjalan ke kanan saat scroll ke bawah
     * 2. Mario berjalan ke kiri saat scroll ke atas
     * 3. Menganimasikan section dan elemen game
     * [DUPLIKAT] handleScroll muncul dua kali:
     * 1. Di sini sebagai fungsi utama
     * 2. Di event listener sebagai callback
     * Alasan: Dipisah untuk memudahkan testing dan maintenance
     * Note: scrollDiff digunakan untuk menentukan arah scroll
     */
    function handleScroll() {
        const currentScroll = window.pageYOffset;
        const scrollDiff = currentScroll - lastScrollPosition;
        
        if (!mario) return;
        
        // Kontrol arah jalan Mario berdasarkan scroll
        if (scrollDiff > 0 && !isWalking) {
            mario.classList.add('mario-walk');
            mario.style.transform = 'scaleX(1)';
            isWalking = true;
        } else if (scrollDiff < 0 && !isWalking) {
            mario.classList.add('mario-walk');
            mario.style.transform = 'scaleX(-1)';
            isWalking = true;
        } else if (scrollDiff === 0 && isWalking) {
            mario.classList.remove('mario-walk');
            isWalking = false;
        }
        
        // Update posisi horizontal Mario dengan batasan screen
        const marioPosition = parseInt(mario.style.left) || 150;
        const newPosition = marioPosition + (scrollDiff * 0.5);
        mario.style.left = `${Math.max(50, Math.min(newPosition, window.innerWidth - 100))}px`;
        
        lastScrollPosition = currentScroll;
        
        // Animasi fade-in sections saat di-scroll
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < window.innerHeight * 0.75) {
                section.classList.add('visible');
            }
        });
        
        // Parallax effect untuk elemen game
        const gameElements = document.querySelectorAll('.scroll-element');
        gameElements.forEach(element => {
            const movement = currentScroll * 0.3;
            element.style.transform = `translateX(${movement}px)`;
        });
    }
    
    /**
     * Scroll Event Optimization
     * -------------------------------
     * Menggunakan throttling untuk mengoptimalkan performa
     * Membatasi eksekusi handleScroll ke ~60fps
     * Throttling dengan setTimeout mencegah terlalu banyak
     * kalkulasi yang bisa memperlambat performa
     * 16ms ≈ 60fps untuk animasi yang smooth
     */
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 16);
        }
    });

    /**
     * Mouse Movement Handler
     * -------------------------------
     * Mario mengikuti pergerakan cursor mouse
     * Hanya aktif saat Mario tidak sedang melompat
     * Note: Pembatasan pergerakan Mario (newX) mencegah
     * karakter keluar dari area yang visible
     * Margin 50px dari tepi memberikan buffer visual
     */
    document.addEventListener('mousemove', (e) => {
        if (isJumping || !mario) return;
        
        const mouseX = e.clientX;
        const screenWidth = window.innerWidth;
        const marioWidth = mario.offsetWidth;
        
        // Batasi pergerakan Mario dalam area layar
        let newX = mouseX - (marioWidth / 2);
        newX = Math.max(50, Math.min(newX, screenWidth - marioWidth - 50));
        
        mario.style.left = `${newX}px`;
    });

    /**
     * Jump Animation Function
     * -------------------------------
     * Mengatur animasi lompat Mario
     * Durasi lompatan: 500ms
     * [DUPLIKAT] Fungsi jump muncul dalam dua konteks:
     * 1. Sebagai respons keyboard (spasi)
     * 2. Sebagai bagian dari animasi transisi
     * Alasan: Reusability untuk berbagai trigger lompatan
     */
    function jump() {
        if (!mario || isJumping) return;
        
        isJumping = true;
        mario.classList.add('jump');
        
        setTimeout(() => {
            mario.classList.remove('jump');
            isJumping = false;
        }, 500);
    }

    /**
     * Play Game Button Handler
     * -------------------------------
     * Mengatur transisi ke halaman games.html
     * Sequence animasi kompleks:
     * 1. Mario melompat ke tombol (800ms)
     * 2. Footer slide up (800ms)
     * 3. Fade out konten
     * 4. Redirect dengan timing yang tepat
     */
    if (playButton && mario) {
        playButton.addEventListener('click', () => {
            const buttonRect = playButton.getBoundingClientRect();
            
            // Animasi Mario melompat ke tombol
            isJumping = true;
            mario.style.left = `${buttonRect.left}px`;
            mario.classList.add('jump');
            
            // Sequence transisi halaman
            setTimeout(() => {
                const footer = document.querySelector('.footer');
                if (footer) {
                    footer.style.transition = 'transform 0.8s cubic-bezier(0.86, 0, 0.07, 1)';
                    footer.style.transform = 'translateY(-100%)';
                }
                
                if (pageContent) {
                    pageContent.classList.remove('visible');
                }
                
                // Redirect ke games.html setelah animasi
                setTimeout(() => {
                    window.location.href = 'games.html';
                }, 800);
            }, 800);
        });
    }

    /**
     * Keyboard Controls
     * -------------------------------
     * Spasi: Mario melompat
     */
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isJumping && mario) {
            jump();
        }
    });

    /**
     * Games Page Special Behavior
     * -------------------------------
     * Khusus untuk halaman games.html:
     * 1. Mario diposisikan di kiri
     * 2. Otomatis melompat saat load
     * Note: Pengecekan pathname menggunakan includes()
     * untuk mengakomodasi berbagai struktur URL yang mungkin
     * (dengan atau tanpa trailing slash, subfolder, dll)
     */
    if (window.location.pathname.includes('games.html')) {
        if (mario) {
            mario.style.left = '100px';
            setTimeout(() => {
                jump();
            }, 500);
        }
    }
    
    /**
     * Responsive Design Handler
     * -------------------------------
     * Reset posisi Mario saat ukuran window berubah
     * Reset posisi Mario saat resize untuk mencegah
     * karakter terjebak di posisi yang tidak valid
     * pada ukuran layar baru
     */
    window.addEventListener('resize', () => {
        if (mario) {
            mario.style.left = '100px';
        }
    });

    /**
     * Contact Methods Interaction
     * -------------------------------
     * Hover effect untuk contact methods
     * Animasi translateY saat hover
     * Efek hover sederhana dengan CSS transform
     * -5px memberikan ilusi "floating" yang subtle
     * Note: Transisi diatur di CSS untuk performa lebih baik
     */
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', () => {
            method.style.transform = 'translateY(-5px)';
        });
        
        method.addEventListener('mouseleave', () => {
            method.style.transform = 'translateY(0)';
        });
    });

    // Initialize visibility untuk semua section
    handleScroll();
});
