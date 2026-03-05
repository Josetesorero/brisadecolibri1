// Brisas de Colibrí - Main Script

document.addEventListener('DOMContentLoaded', () => {
    // 0. Smooth Scroll con Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 1. Header Background & Scroll Parallax
    const header = document.querySelector('.main-header');
    const heroBg = document.querySelector('.hero-video');
    const asymImage = document.querySelector('.asym-image');
    const heroVid = document.getElementById('hero-vid');

    let wasAtTop = true;

    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;

        // Reinicio al llegar arriba
        if (scrollY <= 10) {
            if (!wasAtTop && heroVid) {
                heroVid.currentTime = 0;
                heroVid.play().catch(() => { });
            }
            wasAtTop = true;
        } else {
            wasAtTop = false;
        }

        // Reiniciar video al hacer scroll si ya terminó
        if (heroVid && heroVid.ended && scrollY > 10) {
            heroVid.currentTime = 0;
            heroVid.play().catch(() => { });
        }
    });

    lenis.on('scroll', (e) => {
        let scrollY = window.scrollY;

        // Header Solid
        if (scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.9)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.4)';
            header.style.boxShadow = 'none';
        }

        // Parallax sutil ultrasuave
        if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
        if (asymImage) asymImage.style.transform = `translateY(${scrollY * 0.15}px)`;
    });

    // 2. Scroll-triggered animations con Stagger effects
    const grids = document.querySelectorAll('.services-grid, .features, .contact-wrapper');
    grids.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            child.classList.add('reveal-up');
            child.style.transitionDelay = `${index * 150}ms`; // Cascading delay
        });
    });

    const revealElements = document.querySelectorAll('.reveal-up, .section-title, .mental-health .asym-image');
    revealElements.forEach(el => el.classList.add('reveal-up'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. 3D Card Transforms (Interactive Perspective)
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // 4. Sistema de naturaleza (Hojitas interactuando con el mouse)
    const initParticles = () => {
        const canvas = document.getElementById('hero-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const mouse = { x: -1000, y: -1000, radius: 100 };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const particles = [];
        const numParticles = 30;

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 6 + 3,
                speed: Math.random() * 0.4 + 0.2,
                vx: 0,
                vy: 0,
                swing: Math.random() * 1.5 + 0.5,
                angle: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015,
                opacity: Math.random() * 0.3 + 0.2
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const canvasRect = canvas.getBoundingClientRect();

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Interacción con mouse (Efecto de viento)
                const dx = p.x - (mouse.x - canvasRect.left);
                const dy = p.y - (mouse.y - canvasRect.top);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // Empujar la hoja lejos del mouse con suavidad
                    p.vx += Math.cos(angle) * force * 1.5;
                    p.vy += Math.sin(angle) * force * 0.5;
                }

                // Aplicar fricción para frenar el movimiento inducido
                p.vx *= 0.95;
                p.vy *= 0.95;

                // Combinación de caída natural y movimiento del mouse
                p.angle += 0.01;
                p.x += Math.sin(p.angle) * p.swing + p.vx;
                p.y += p.speed + p.vy;
                p.rotation += p.rotSpeed + (p.vx * 0.05);

                // Reposicionar si salen del canvas
                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.vy = 0;
                }
                if (p.x > canvas.width + 20) p.x = -20;
                if (p.x < -20) p.x = canvas.width + 20;

                // Dibujar silueta de hoja orgánica
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;

                ctx.moveTo(0, -p.size);
                ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
                ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);

                ctx.fill();
                ctx.restore();
            }
            requestAnimationFrame(draw);
        };
        draw();
    };

    initParticles();

    // 5. Contact Form Simulation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            setTimeout(() => {
                btn.style.backgroundColor = '#2A9D8F';
                btn.innerText = '¡Mensaje enviado!';
                contactForm.reset();

                setTimeout(() => {
                    btn.style.backgroundColor = '';
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    // 6. Smooth scroll logic con Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetInfo = this.getAttribute('href');
            if (targetInfo === '#') return;

            // Reiniciar video al dar clic en Inicio
            const heroVid = document.getElementById('hero-vid');
            if (targetInfo === '#inicio' && heroVid) {
                heroVid.currentTime = 0;
                heroVid.play().catch(() => { });
            }

            const target = document.querySelector(targetInfo);
            if (target) {
                lenis.scrollTo(target);
            }
        });
    });

    // 7. Mobile Navigation Interactivity
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    if (mobileNavItems.length > 0) {
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-target');
                const target = document.querySelector(targetId);
                if (target) {
                    lenis.scrollTo(target);
                    // Update active class immediately on click
                    mobileNavItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });

        // Update active state on scroll
        window.addEventListener('scroll', () => {
            let current = "";
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                    current = `#${section.getAttribute('id')}`;
                }
            });

            mobileNavItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-target') === current) {
                    item.classList.add('active');
                }
            });
        });
    }

    console.log('CoreShift Animation System Initialized.');
});
