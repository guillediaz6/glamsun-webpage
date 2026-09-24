document.addEventListener('DOMContentLoaded', () => {
  // 1. Generador de Chispas / Partículas Brillantes para el fondo disco
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

  // 2. Interacción del Botón + para expandir el texto de la tarjeta si es largo
  const expandButtons = document.querySelectorAll('.btn-expand-text');
  expandButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.event-item-card');
      if (!card) return;

      const isExpanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', isExpanded);
      const label = btn.querySelector('.expand-label');
      if (label) {
        label.textContent = isExpanded ? 'Ver menos' : 'Ver más';
      }
    });
  });

  // 3. Menú Dock Flotante Inferior en la página de eventos
  const bottomDock = document.getElementById('bottom-dock');
  const dockBtnGrid = document.getElementById('dock-btn-grid');

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

  document.addEventListener('click', (e) => {
    if (bottomDock && !bottomDock.contains(e.target)) {
      closeDockMenu();
    }
  });

  // =========================================================================
  // 4. SISTEMA DE PAGINACIÓN DINÁMICA (6 EVENTOS POR PÁGINA)
  // =========================================================================
  const EVENTS_PER_PAGE = 6;
  const eventCards = Array.from(document.querySelectorAll('.event-item-card'));
  const paginationContainer = document.getElementById('events-pagination');

  // Detección automática del próximo evento en la lista según la fecha de hoy
  const todayStr = new Date().toISOString().split('T')[0];
  let upcomingCard = null;
  let minDiff = Infinity;

  eventCards.forEach(card => {
    const cardDate = card.getAttribute('data-date');
    if (cardDate && cardDate >= todayStr) {
      const diff = new Date(cardDate) - new Date(todayStr);
      if (diff < minDiff) {
        minDiff = diff;
        upcomingCard = card;
      }
    }
  });

  if (upcomingCard) {
    const badgeRow = upcomingCard.querySelector('.event-meta-badge-row');
    if (badgeRow && !badgeRow.querySelector('.event-status-pill.next-up')) {
      const nextUpPill = document.createElement('span');
      nextUpPill.className = 'event-status-pill next-up';
      nextUpPill.textContent = '✦ PRÓXIMO EVENTO ✦';
      badgeRow.appendChild(nextUpPill);
    }
  }

  let currentPage = 1;
  const totalEvents = eventCards.length;
  const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);

  function renderPage(pageNumber) {
    currentPage = pageNumber;
    const startIndex = (pageNumber - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;

    eventCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = 'grid';
        card.classList.remove('event-card-fade-in');
        void card.offsetWidth; // trigger reflow for smooth animation
        card.classList.add('event-card-fade-in');
      } else {
        card.style.display = 'none';
        card.classList.remove('event-card-fade-in');
      }
    });

    renderPaginationControls();
  }

  function renderPaginationControls() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    // Si solo hay 1 página, mostramos la píldora informativa
    if (totalPages <= 1) {
      paginationContainer.innerHTML = `
        <div class="pagination-info-pill">Mostrando los ${totalEvents} eventos</div>
      `;
      return;
    }

    // Botón Anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-pagination btn-pagination-nav';
    prevBtn.innerHTML = '← Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        renderPage(currentPage - 1);
        scrollToTop();
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Números de Página
    const pagesWrapper = document.createElement('div');
    pagesWrapper.className = 'pagination-numbers-wrapper';

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `btn-pagination btn-pagination-num ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.setAttribute('aria-label', `Ir a página ${i}`);
      if (i === currentPage) {
        pageBtn.setAttribute('aria-current', 'page');
      }
      pageBtn.addEventListener('click', () => {
        if (i !== currentPage) {
          renderPage(i);
          scrollToTop();
        }
      });
      pagesWrapper.appendChild(pageBtn);
    }
    paginationContainer.appendChild(pagesWrapper);

    // Botón Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-pagination btn-pagination-nav';
    nextBtn.innerHTML = 'Siguiente →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        renderPage(currentPage + 1);
        scrollToTop();
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  function scrollToTop() {
    const heroSection = document.querySelector('.events-hero-section');
    if (heroSection) {
      const targetPos = heroSection.getBoundingClientRect().bottom + window.pageYOffset - 20;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  }

  // Inicializar paginación (y detectar si se navega a un evento específico por hash)
  if (eventCards.length > 0) {
    let initialPage = 1;
    if (window.location.hash) {
      const targetCard = document.querySelector(window.location.hash);
      if (targetCard) {
        const cardIndex = eventCards.indexOf(targetCard);
        if (cardIndex !== -1) {
          initialPage = Math.floor(cardIndex / EVENTS_PER_PAGE) + 1;
        }
      }
    }
    renderPage(initialPage);

    if (window.location.hash) {
      setTimeout(() => {
        const targetEl = document.querySelector(window.location.hash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }
});
