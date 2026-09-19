document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('hero-section');
  const mainPage = document.getElementById('main-page');
  const btnEnter = document.getElementById('btn-enter');
  const btnReturnHero = document.getElementById('btn-return-hero');
  const btnEvent = document.getElementById('btn-event');
  const eventModal = document.getElementById('event-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const brandHomeLink = document.getElementById('brand-home-link');
  const bgVideo = document.getElementById('bg-video');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIconMuted = document.getElementById('sound-icon-muted');
  const soundIconUnmuted = document.getElementById('sound-icon-unmuted');
  const epicContainer = document.querySelector('.epic-heading-container');
  const bottomDock = document.getElementById('bottom-dock');

  // Asegurar que el video intente reproducirse automáticamente
  if (bgVideo) {
    bgVideo.play().catch(() => {
      // Si el navegador bloquea autoplay, se reproducirá con la primera interacción
      document.body.addEventListener('click', () => {
        bgVideo.play().catch(() => {});
      }, { once: true });
    });
  }

  const bannerTextBox = document.getElementById('banner-text-box');

  // Transición a la página principal (Deslizándose lentamente desde abajo hacia arriba)
  function enterMainPage(skipAnimation = false) {
    // OPTIMIZACIÓN CRÍTICA: Pausar el vídeo de portada inmediatamente para liberar 100% de GPU y CPU
    if (bgVideo && !bgVideo.paused) {
      bgVideo.pause();
    }

    // Mostrar menú flotante de navegación al entrar a la web
    if (bottomDock) {
      bottomDock.classList.add('dock-visible');
    }

    if (skipAnimation) {
      if (mainPage) mainPage.classList.remove('slide-up-anim');
      if (heroSection) heroSection.classList.add('hide-hero');
      return;
    }

    if (mainPage) {
      mainPage.classList.remove('slide-up-anim');
      mainPage.style.transform = '';
      void mainPage.offsetHeight; // forzar reflow para reiniciar animación
      mainPage.classList.add('slide-up-anim');

      // CRUCIAL: Limpiar la clase y transform al terminar la animación para que position: sticky funcione
      const cleanAnim = () => {
        mainPage.classList.remove('slide-up-anim');
        mainPage.style.transform = '';
        mainPage.removeEventListener('animationend', cleanAnim);
      };
      mainPage.addEventListener('animationend', cleanAnim);
      setTimeout(cleanAnim, 2300); // Respaldo por temporizador
    }
    
    if (heroSection) heroSection.classList.add('hide-hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reiniciar animación del banner de foto1 para ver la entrada fluida desde la izquierda hacia el centro
    if (bannerTextBox) {
      bannerTextBox.style.animation = 'none';
      void bannerTextBox.offsetHeight; // trigger reflow
      bannerTextBox.style.animation = 'bannerSlideFromLeftToCenter 2.4s cubic-bezier(0.12, 0.96, 0.24, 1) forwards';
    }
  }

  // Volver a la pantalla del video hero
  function returnToHero() {
    // Ocultar menú flotante al volver a la portada
    if (bottomDock) {
      bottomDock.classList.remove('dock-visible');
    }

    // Reanudar reproducción del vídeo de portada al volver
    if (bgVideo && bgVideo.paused) {
      bgVideo.play().catch(() => {});
    }

    if (mainPage) {
      mainPage.classList.remove('slide-up-anim');
    }
    if (heroSection) heroSection.classList.remove('hide-hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Detectar navegación directa por URL con hash (ej: index.html#section-experience o #section-agatha)
  function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash && hash !== '#hero-section' && hash !== '#') {
      enterMainPage(true);
      setTimeout(() => {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    }
  }

  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);

  if (btnEnter) {
    btnEnter.addEventListener('click', () => {
      enterMainPage();
    });
  }

  if (btnReturnHero) {
    btnReturnHero.addEventListener('click', returnToHero);
  }

  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      returnToHero();
    });
  }

  // Modal "Próximo Evento" / "Pedir info"
  const modalEventDate = document.getElementById('modal-event-date');

  function openModal(dateText) {
    if (eventModal) {
      if (modalEventDate && dateText) {
        modalEventDate.textContent = `${dateText} 2026`;
      }
      eventModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (eventModal) {
      eventModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  const btnAgathaEvent = document.getElementById('btn-agatha-event');

  if (btnEvent) {
    btnEvent.addEventListener('click', () => openModal('24 JULIO'));
  }

  if (btnAgathaEvent && btnAgathaEvent.tagName === 'BUTTON') {
    btnAgathaEvent.addEventListener('click', () => openModal('24 JULIO'));
  }

  // =========================================================================
  // CARRUSEL ROTATIVO COVER-FLOW DE EVENTOS CON PÓSTERES
  // =========================================================================
  const carouselContainer = document.getElementById('events-carousel');
  const eventCards = document.querySelectorAll('.event-rect-card');
  let currentCardIndex = 0;
  let carouselInterval = null;
  const totalCards = eventCards.length;

  function setActiveCard(index) {
    if (!eventCards || totalCards === 0) return;
    
    // Asegurar que el índice está en rango
    currentCardIndex = ((index % totalCards) + totalCards) % totalCards;

    // Calcular índices relativos
    const prevIndex = (currentCardIndex - 1 + totalCards) % totalCards;
    const nextIndex = (currentCardIndex + 1) % totalCards;
    const farPrevIndex = (currentCardIndex - 2 + totalCards) % totalCards;
    const farNextIndex = (currentCardIndex + 2) % totalCards;

    eventCards.forEach((card, i) => {
      // Limpiar clases
      card.className = 'event-rect-card';

      if (i === currentCardIndex) {
        card.classList.add('active');
      } else if (i === prevIndex) {
        card.classList.add('prev');
      } else if (i === nextIndex) {
        card.classList.add('next');
      } else if (i === farPrevIndex && totalCards > 3) {
        card.classList.add('far-prev');
      } else if (i === farNextIndex && totalCards > 3) {
        card.classList.add('far-next');
      }
    });
  }

  function startCarouselAutoRotate() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
      const nextIndex = (currentCardIndex + 1) % totalCards;
      setActiveCard(nextIndex);
    }, 2400);
  }

  function stopCarouselAutoRotate() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  if (eventCards.length > 0) {
    setActiveCard(0);
    startCarouselAutoRotate();

    // Pausar rotación al pasar el ratón por el contenedor y reanudar al salir (sin saltos bruscos)
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopCarouselAutoRotate);
      carouselContainer.addEventListener('mouseleave', startCarouselAutoRotate);
    }

    eventCards.forEach((card) => {
      // Al hacer clic en cualquier tarjeta, llevar directamente al evento en eventos.html
      card.addEventListener('click', (e) => {
        const targetHref = card.getAttribute('href');
        if (targetHref) {
          window.location.href = targetHref;
        }
      });
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (eventModal) {
    eventModal.addEventListener('click', (e) => {
      if (e.target === eventModal) {
        closeModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && eventModal && eventModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Control de sonido para el video de fondo
  if (soundToggle && bgVideo) {
    soundToggle.addEventListener('click', () => {
      if (bgVideo.muted) {
        bgVideo.muted = false;
        soundIconMuted.style.display = 'none';
        soundIconUnmuted.style.display = 'block';
      } else {
        bgVideo.muted = true;
        soundIconMuted.style.display = 'block';
        soundIconUnmuted.style.display = 'none';
      }
    });
  }

  // =========================================================================
  // MENÚ FLOTANTE INFERIOR (BOTTOM DOCK) INTERACTIVO
  // =========================================================================
  const bottomDock = document.getElementById('bottom-dock');
  const dockBtnGrid = document.getElementById('dock-btn-grid');
  const dockBtnEvents = document.getElementById('dock-btn-events');
  const dockNavItems = document.querySelectorAll('.dock-nav-item');

  function toggleDockMenu() {
    if (!bottomDock) return;
    const isExpanded = bottomDock.classList.toggle('is-expanded');
    if (dockBtnGrid) {
      dockBtnGrid.setAttribute('aria-expanded', isExpanded);
    }
  }

  function closeDockMenu() {
    if (bottomDock && bottomDock.classList.contains('is-expanded')) {
      bottomDock.classList.remove('is-expanded');
      if (dockBtnGrid) {
        dockBtnGrid.setAttribute('aria-expanded', 'false');
      }
    }
  }

  if (dockBtnGrid) {
    dockBtnGrid.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDockMenu();
    });
  }

  // Botón Logo en el dock
  const dockLogoBtn = document.getElementById('dock-logo-btn');
  if (dockLogoBtn) {
    dockLogoBtn.addEventListener('click', () => {
      returnToHero();
      closeDockMenu();
    });
  }

  // Botones desplegables laterales en las alas
  dockNavItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = item.dataset.action;

      if (action === 'go-hero') {
        history.pushState(null, '', window.location.pathname);
        returnToHero();
      } else if (action === 'go-experience') {
        enterMainPage(true);
        const sec = document.getElementById('section-experience');
        if (sec) {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (action === 'go-agatha') {
        enterMainPage(true);
        const sec = document.getElementById('section-agatha');
        if (sec) {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (action === 'go-boat') {
        enterMainPage(true);
        const sec = document.getElementById('section-boat-party');
        if (sec) {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      closeDockMenu();
    });
  });

  // Cerrar el menú desplegado al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (bottomDock && !bottomDock.contains(e.target)) {
      closeDockMenu();
    }
  });

  // =========================================================================
  // GENERADOR DE PARTÍCULAS BRILLANTES PARA EL FONDO DISCOTECA
  // =========================================================================
  const sparklesContainer = document.getElementById('disco-sparkles');
  if (sparklesContainer) {
    const sparkleColors = [
      'rgba(229, 195, 101, 0.8)',   // Gold
      'rgba(229, 60, 255, 0.7)',    // Magenta
      'rgba(0, 180, 255, 0.7)',     // Cyan
      'rgba(255, 50, 120, 0.6)',    // Pink
      'rgba(0, 255, 180, 0.6)',     // Teal
      'rgba(100, 80, 255, 0.6)',    // Purple
      'rgba(255, 255, 255, 0.9)',   // White
    ];

    const numSparkles = 45;

    for (let i = 0; i < numSparkles; i++) {
      const sparkle = document.createElement('div');
      sparkle.classList.add('disco-sparkle');

      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      const size = 2 + Math.random() * 3;
      const duration = 3 + Math.random() * 5;
      const delay = Math.random() * 8;

      sparkle.style.left = x + '%';
      sparkle.style.top = y + '%';
      sparkle.style.width = size + 'px';
      sparkle.style.height = size + 'px';
      sparkle.style.setProperty('--sparkle-color', color);
      sparkle.style.setProperty('--sparkle-duration', duration + 's');
      sparkle.style.setProperty('--sparkle-delay', delay + 's');

      sparklesContainer.appendChild(sparkle);
    }
  }

  // =========================================================================
  // CARRUSEL MANUAL REVIVE: ARRASTRE CON RATÓN / TOUCH & BOTONES DE NAVEGACIÓN
  // =========================================================================
  const reviveTrack = document.getElementById('revive-manual-track');
  const revivePrevBtn = document.getElementById('revive-prev-btn');
  const reviveNextBtn = document.getElementById('revive-next-btn');

  if (reviveTrack) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    reviveTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      reviveTrack.classList.add('is-dragging');
      startX = e.pageX - reviveTrack.offsetLeft;
      scrollLeft = reviveTrack.scrollLeft;
    });

    reviveTrack.addEventListener('mouseleave', () => {
      isDown = false;
      reviveTrack.classList.remove('is-dragging');
    });

    reviveTrack.addEventListener('mouseup', () => {
      isDown = false;
      reviveTrack.classList.remove('is-dragging');
    });

    reviveTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - reviveTrack.offsetLeft;
      const walk = (x - startX) * 1.6; // Factor de desplazamiento ágil
      reviveTrack.scrollLeft = scrollLeft - walk;
    });

    if (revivePrevBtn) {
      revivePrevBtn.addEventListener('click', () => {
        reviveTrack.scrollBy({ left: -360, behavior: 'smooth' });
      });
    }

    if (reviveNextBtn) {
      reviveNextBtn.addEventListener('click', () => {
        reviveTrack.scrollBy({ left: 360, behavior: 'smooth' });
      });
    }
  }

  // =========================================================================
  // SECCIÓN BOAT PARTY: APILAMIENTO NATIVO FLUIDO POR GPU A 120 FPS
  // =========================================================================

  // =========================================================================
  // CONTROLADOR DE VÍDEO BOAT PARTY (BAJO DEMANDA / ON-CLICK + AUTO-PAUSE)
  // =========================================================================
  const boatVideo = document.getElementById('boat-party-vid');
  const boatPlayOverlay = document.getElementById('boat-play-overlay');

  if (boatVideo && boatPlayOverlay) {
    boatPlayOverlay.addEventListener('click', () => {
      boatVideo.play().then(() => {
        boatPlayOverlay.classList.add('is-playing');
      }).catch(() => {
        boatPlayOverlay.classList.add('is-playing');
      });
    });

    boatVideo.addEventListener('play', () => {
      boatPlayOverlay.classList.add('is-playing');
    });

    boatVideo.addEventListener('pause', () => {
      if (boatVideo.currentTime === 0 || boatVideo.ended) {
        boatPlayOverlay.classList.remove('is-playing');
      }
    });

    // Pausar automáticamente el vídeo si el usuario se desplaza fuera de la sección
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !boatVideo.paused) {
            boatVideo.pause();
          }
        });
      }, { threshold: 0.15 });
      videoObserver.observe(boatVideo);
    }
  }
});
