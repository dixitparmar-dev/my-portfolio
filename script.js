/**
 * Portfolio JavaScript - Optimized for Performance
 */

// State Management
let artData = { heroImages: [], artworks: [] };
let projectData = { projects: [] };
let displayedProjectCount = 6;
const projectsPerLoad = 6;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  setupScrollAnimations();
  // Parallax removed for better performance
});

/**
 * Load data from JSON files
 */
async function loadData() {
  try {
    const [artResponse, projectResponse, linksResponse] = await Promise.all([
      fetch('art.json'),
      fetch('project.json'),
      fetch('links.json')
    ]);

    artData = await artResponse.json();
    projectData = await projectResponse.json();
    const linksData = await linksResponse.json();

    updateLinks(linksData);
    loadCodeProjects(true);
    loadFeaturedArt();
    animateHero();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Update social and resume links
 */
function updateLinks(links) {
  const githubLinks = document.querySelectorAll('a[href*="github.com"]');
  const resumeLinks = document.querySelectorAll('.js-resume-download');

  githubLinks.forEach(link => {
    link.href = links.github;
  });

  resumeLinks.forEach(link => {
    link.href = links.resume;
    link.setAttribute('download', 'Dixit_Parmar_Resume.pdf');
  });
}
function animateHero() {
  const heroElements = document.querySelectorAll('.hero-text');
  heroElements.forEach((el, index) => {
    setTimeout(() => el.classList.add('visible'), index * 150 + 400);
  });
}

/**
 * Setup scroll-based animations
 */
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

/**
 * Setup parallax scrolling effect - OPTIMIZED
 */
function setupParallax() {
  const parallaxItems = document.querySelectorAll('.parallax-item');

  if (parallaxItems.length === 0) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;

    parallaxItems.forEach(item => {
      const speed = parseFloat(item.dataset.speed) || 0.05;
      const yPos = -(scrolled * speed);
      item.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  setupLoadMore();
  setupGallery();
  setupSmoothScroll();
  setupLightboxControls();
}

/**
 * Load featured art
 */
function loadFeaturedArt() {
  const grid = document.getElementById('featuredArtGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const featured = artData.heroImages.slice(0, 2);

  featured.forEach((art, index) => {
    const div = document.createElement('div');
    div.className = 'scroll-reveal group';
    if (index === 1) div.style.transitionDelay = '100ms';

    div.innerHTML = `
      <div class="relative overflow-hidden rounded-xl">
        <img src="${escapeHtml(art.image)}" alt="${escapeHtml(art.title)}"
          class="w-full h-auto transition-transform duration-500 group-hover:scale-105">
      </div>
      <h3 class="text-[17px] font-semibold mt-4 mb-1 text-[#444]">${escapeHtml(art.title)}</h3>
      <p class="text-[14px] font-semibold text-[#444]/40">${escapeHtml(art.year)}</p>
    `;
    grid.appendChild(div);
  });

  setupScrollAnimations();
}

/**
 * Load code projects
 */
function loadCodeProjects(initial = false) {
  const grid = document.getElementById('codeGrid');
  const loadMoreBtn = document.getElementById('loadMoreProjects');

  if (!grid) return;

  if (initial) grid.innerHTML = '';

  const projectsToShow = projectData.projects.slice(0, displayedProjectCount);

  projectsToShow.forEach((project, index) => {
    if (initial || index >= displayedProjectCount - projectsPerLoad) {
      const card = document.createElement('div');
      card.className = 'code-card scroll-reveal';
      card.innerHTML = `
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="tech-stack">
          ${project.technologies.map(tech => `<span class="tech-badge">${escapeHtml(tech)}</span>`).join('')}
        </div>
      `;
      if (project.link) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.location.href = project.link);
      }
      grid.appendChild(card);
    }
  });

  if (loadMoreBtn) {
    loadMoreBtn.style.display = displayedProjectCount >= projectData.projects.length ? 'none' : 'block';
  }

  setupScrollAnimations();
}

/**
 * Load more projects button
 */
function setupLoadMore() {
  const loadMoreBtn = document.getElementById('loadMoreProjects');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      displayedProjectCount += projectsPerLoad;
      loadCodeProjects();
    });
  }
}

/**
 * Gallery modal functionality
 */
function setupGallery() {
  const viewAllBtn = document.getElementById('viewAllArt');
  const galleryModal = document.getElementById('galleryModal');
  const galleryClose = document.getElementById('galleryClose');
  const fullGalleryGrid = document.getElementById('fullGalleryGrid');

  if (viewAllBtn && galleryModal) {
    viewAllBtn.addEventListener('click', () => {
      fullGalleryGrid.innerHTML = '';
      const allArt = [...artData.heroImages, ...artData.artworks];

      allArt.forEach((art, index) => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.innerHTML = `<img src="${escapeHtml(art.image)}" alt="${escapeHtml(art.title)}">`;
        item.addEventListener('click', () => openLightbox(allArt, index));
        fullGalleryGrid.appendChild(item);
      });

      galleryModal.classList.remove('hidden');
      galleryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (galleryClose) {
    galleryClose.addEventListener('click', () => {
      galleryModal.classList.add('hidden');
      galleryModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }
}

/**
 * Smooth scroll for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      e.preventDefault();
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Lightbox functionality
 */
let currentLightboxIndex = 0;
let currentLightboxSource = [];

function openLightbox(dataSource, index) {
  currentLightboxSource = dataSource;
  currentLightboxIndex = index;

  const modal = document.getElementById('imageModal');
  modal.classList.remove('hidden');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  updateLightboxContent();
  generateThumbnails();
}

function updateLightboxContent() {
  const item = currentLightboxSource[currentLightboxIndex];
  const modalImg = document.getElementById('modalImg');
  const fullPreviewBtn = document.getElementById('fullPreviewBtn');

  modalImg.src = item.image;
  modalImg.alt = item.title;



  document.querySelectorAll('.thumbnail').forEach((thumb, idx) => {
    if (idx === currentLightboxIndex) {
      thumb.classList.add('active');
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      thumb.classList.remove('active');
    }
  });
}

function generateThumbnails() {
  const strip = document.getElementById('thumbnailStrip');
  strip.innerHTML = '';

  currentLightboxSource.forEach((item, index) => {
    const thumb = document.createElement('div');
    thumb.className = `thumbnail ${index === currentLightboxIndex ? 'active' : ''}`;
    thumb.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">`;
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      currentLightboxIndex = index;
      updateLightboxContent();
    });
    strip.appendChild(thumb);
  });
}

function setupLightboxControls() {
  const modal = document.getElementById('imageModal');
  const closeBtn = document.getElementById('modalClose');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');

  const closeLightbox = () => {
    modal.classList.add('hidden');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxSource.length;
    updateLightboxContent();
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxSource.length) % currentLightboxSource.length;
    updateLightboxContent();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);
  if (prevBtn) prevBtn.addEventListener('click', prevImage);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('hidden')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    }
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
