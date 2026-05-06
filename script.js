document.addEventListener('DOMContentLoaded', () => {
    // Global Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        
        // Navbar glass effect
        if (scroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Parallax effect for featured banner
        const featuredBg = document.querySelector('.featured-bg');
        if (featuredBg) {
            const zoom = 1 + (scroll / 2000);
            featuredBg.style.transform = `scale(${zoom})`;
        }
    });

    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        if(navLinks.style.display === 'flex') {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'var(--surface-glass)';
            navLinks.style.backdropFilter = 'blur(10px)';
            navLinks.style.padding = '20px';
            navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        }
    });

    // Carousel Logic
    const setupCarousel = (carouselId, nextBtnId, prevBtnId) => {
        const carousel = document.getElementById(carouselId);
        const nextBtn = document.getElementById(nextBtnId);
        const prevBtn = document.getElementById(prevBtnId);
        
        if(!carousel || !nextBtn || !prevBtn) return;

        const getScrollAmount = () => {
            const firstCard = carousel.querySelector('.show-card');
            if(!firstCard) return 300;
            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(window.getComputedStyle(carousel).gap) || 20;
            return cardWidth + gap;
        };

        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        // Intersection Observer for highlighting center card in THIS carousel
        const centerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting && entry.intersectionRatio > 0.8) {
                    carousel.querySelectorAll('.show-card').forEach(c => c.classList.remove('active'));
                    entry.target.classList.add('active');
                }
            });
        }, {
            root: carousel,
            threshold: 0.9
        });

        return centerObserver;
    };

    // Setup observers for both carousels (will be used during population)
    let regularObserver, openMicObserver;
    
    // Dynamic Shows Fetching & Modal Logic
    const showsAPI = 'https://tezbcztewhvotmohbjju.supabase.co/functions/v1/public-shows?comedian_id=c3952e23-4b7b-46a8-9a5f-5f0361a7bc6c';
    const showModal = document.getElementById('showModal');
    const closeShowModalBtn = document.getElementById('closeShowModal');
    
    // Format date in human-readable Spanish format
    const formatDate = (dateString, timeString) => {
        const date = new Date(`${dateString}T${timeString || '00:00:00'}`);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        let formatted = date.toLocaleDateString('es-ES', options).replace(',', ' -');
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    // Short date for cards
    const getShortDate = (dateString) => {
        const date = new Date(`${dateString}T00:00:00`);
        const day = date.getDate();
        const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
        return { day, month };
    };

    const openShowModal = (show) => {
        document.getElementById('showModalTitle').textContent = show.nombre;
        document.getElementById('showModalDate').textContent = formatDate(show.fecha, show.hora);
        document.getElementById('showModalVenue').textContent = show.venue || 'Por confirmar';
        document.getElementById('showModalCity').textContent = show.ciudad ? ` (${show.ciudad})` : '';
        document.getElementById('showModalPrice').textContent = show.precio_entrada || 'Consultar';
        
        const comediansContainer = document.getElementById('showModalComediansContainer');
        const comediansSpan = document.getElementById('showModalComedians');
        const collaborators = show.otros_comediantes || show.colaboradores || show.comedians;
        
        if (collaborators) {
            comediansSpan.textContent = collaborators;
            if(comediansContainer) comediansContainer.style.display = 'block';
        } else {
            if(comediansContainer) comediansContainer.style.display = 'none';
        }
        
        const flyerImg = document.getElementById('showModalFlyer');
        if (show.flyer_url) {
            flyerImg.src = show.flyer_url;
            flyerImg.style.display = 'block';
        } else {
            flyerImg.style.display = 'none';
        }

        const ticketsBtn = document.getElementById('showModalTicketsBtn');
        if (show.link_tickets) {
            ticketsBtn.href = show.link_tickets;
            ticketsBtn.style.display = 'inline-flex';
        } else {
            ticketsBtn.style.display = 'none';
        }

        if(showModal) showModal.classList.add('active');
    };

    const closeShowModal = () => {
        if (showModal) showModal.classList.remove('active');
    };

    if (closeShowModalBtn) closeShowModalBtn.addEventListener('click', closeShowModal);
    if (showModal) {
        showModal.addEventListener('click', (e) => {
            if (e.target === showModal) closeShowModal();
        });
    }

    const renderShowsToCarousel = (shows, carousel, observer) => {
        if (!carousel) return;
        carousel.innerHTML = '';
        
        shows.forEach((show, index) => {
            const { day, month } = getShortDate(show.fecha);
            
            const card = document.createElement('div');
            card.className = `show-card reveal delay-${(index % 5) * 100 + 100} ${index === 0 ? 'active' : ''}`;
            card.innerHTML = `
                <div class="show-card-bg" style="${show.flyer_url ? `background-image: url('${show.flyer_url}')` : ''}"></div>
                <div class="show-card-content">
                    <div class="show-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="show-info">
                        <h3>${show.nombre}</h3>
                        <p>${show.ciudad ? show.ciudad + ' - ' : ''}${show.venue || 'TBA'}</p>
                    </div>
                    <button class="btn btn-primary btn-sm">Más Info</button>
                </div>
            `;
            
            card.addEventListener('click', () => openShowModal(show));
            
            carousel.appendChild(card);
            if(observer) observer.observe(card); // Carousel center observer
            revealObserver.observe(card); // Global reveal observer
        });
    };

    const loadShows = async () => {
        const regularCarousel = document.getElementById('regularShowsCarousel');
        const openMicCarousel = document.getElementById('openMicsCarousel');
        const regularSection = document.getElementById('regularShowsSection');
        const openMicSection = document.getElementById('openMicsSection');
        
        if (!regularCarousel || !openMicCarousel) return;
        
        try {
            regularCarousel.innerHTML = '<p style="text-align: center; width: 100%;">Cargando...</p>';
            openMicCarousel.innerHTML = '<p style="text-align: center; width: 100%;">Cargando...</p>';
            
            const response = await fetch(showsAPI);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                // Filter shows based on 'tipo' attribute (with fallback to name for local testing)
                const isOpenMic = (s) => {
                    const type = s.tipo || "";
                    const name = s.nombre || "";
                    
                    // If type is defined, use it strictly
                    if (type) {
                        return type.toLowerCase().includes('open mic');
                    }
                    
                    // Fallback: Check if name specifically contains "Open Mic"
                    // User confirmed "Open Lab" is Public, so we match "Open Mic" strictly
                    return name.toLowerCase().includes('open mic');
                };

                const regularShows = result.data.filter(s => !isOpenMic(s));
                const openMicShows = result.data.filter(s => isOpenMic(s));
                
                // Setup navigation and observers
                regularObserver = setupCarousel('regularShowsCarousel', 'nextRegular', 'prevRegular');
                openMicObserver = setupCarousel('openMicsCarousel', 'nextOpen', 'prevOpen');

                // Populate regular shows
                if (regularShows.length > 0) {
                    renderShowsToCarousel(regularShows, regularCarousel, regularObserver);
                    regularSection.style.display = 'block';
                    
                    // Hide buttons if items fit on screen and center
                    setTimeout(() => {
                        const hasOverflow = regularCarousel.scrollWidth > regularCarousel.clientWidth;
                        console.log('Regular Carousel Overflow:', hasOverflow, regularCarousel.scrollWidth, regularCarousel.clientWidth);
                        document.getElementById('prevRegular').style.display = hasOverflow ? 'flex' : 'none';
                        document.getElementById('nextRegular').style.display = hasOverflow ? 'flex' : 'none';
                        if (!hasOverflow) {
                            regularCarousel.classList.add('centered');
                        }
                    }, 500);
                } else {
                    regularSection.style.display = 'none';
                }

                // Populate open mics
                if (openMicShows.length > 0) {
                    renderShowsToCarousel(openMicShows, openMicCarousel, openMicObserver);
                    openMicSection.style.display = 'block';

                    // Hide buttons if items fit on screen and center
                    setTimeout(() => {
                        const hasOverflow = openMicCarousel.scrollWidth > openMicCarousel.clientWidth;
                        console.log('Open Mic Carousel Overflow:', hasOverflow, openMicCarousel.scrollWidth, openMicCarousel.clientWidth);
                        document.getElementById('prevOpen').style.display = hasOverflow ? 'flex' : 'none';
                        document.getElementById('nextOpen').style.display = hasOverflow ? 'flex' : 'none';
                        if (!hasOverflow) {
                            openMicCarousel.classList.add('centered');
                        }
                    }, 500);
                } else {
                    openMicSection.style.display = 'none';
                }

            } else {
                regularCarousel.innerHTML = '<p style="text-align: center; width: 100%;">No hay shows próximos.</p>';
                openMicSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
            regularCarousel.innerHTML = '<p style="text-align: center; width: 100%;">Error cargando los shows.</p>';
        }
    };

    loadShows();

    // Form submission using FormSubmit (AJAX)
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            const formData = {
                nombre: document.getElementById('name').value,
                correo: document.getElementById('email').value,
                asunto: document.getElementById('subject').value,
                mensaje: document.getElementById('message').value
            };

            try {
                const response = await fetch("https://formsubmit.co/ajax/herrerarances182@gmail.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    btn.textContent = '¡Mensaje Enviado!';
                    btn.style.backgroundColor = '#00E5FF';
                    btn.style.color = '#000';
                    form.reset();
                } else {
                    throw new Error('FormSubmit Error');
                }
            } catch (error) {
                console.error('Error enviando formulario:', error);
                btn.textContent = 'Error al enviar';
                btn.style.backgroundColor = '#ff4d4d';
                btn.style.color = '#fff';
            }

            // Restore button after 4 seconds
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 4000);
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignore if href is just "#" or doesn't start with "#" (e.g. changed dynamically)
            if (!href || !href.startsWith('#') || href === '#') {
                return;
            }

            e.preventDefault();
            
            if(window.innerWidth <= 768 && navLinks && navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            }

            try {
                const target = document.querySelector(href);
                if(target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (err) {
                // Just in case of any other invalid selectors
                console.error('Invalid selector for smooth scroll:', href);
            }
        });
    });

    // YouTube Modal Logic
    const playBtns = document.querySelectorAll('.play-btn[data-youtube]');
    const modal = document.getElementById('videoModal');
    const closeModal = document.getElementById('closeModal');
    const youtubePlayer = document.getElementById('youtubePlayer');

    playBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.getAttribute('data-youtube');
            if(videoId && youtubePlayer) {
                youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                modal.classList.add('active');
            }
        });
    });

    const closeVideoModal = () => {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (youtubePlayer) youtubePlayer.src = ''; // stop playing
            }, 300);
        }
    };

    if(closeModal) {
        closeModal.addEventListener('click', closeVideoModal);
    }
    
    if(modal) {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                closeVideoModal();
            }
        });
    }
});
