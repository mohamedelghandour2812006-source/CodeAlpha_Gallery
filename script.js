const imageData = [
  { src: 'images/nature1.jpg', category: 'nature', alt: 'Sunlit forest canopy with layered green leaves' },
  { src: 'images/nature2.jpg', category: 'nature', alt: 'Rolling green hillside under soft light' },
  { src: 'images/nature3.jpg', category: 'nature', alt: 'Close-up of dew-covered foliage at sunrise' },
    { src: 'images/nature4.jpg', category: 'nature', alt: 'Sunlit forest canopy with layered green leaves' },
  { src: 'images/nature5.jpg', category: 'nature', alt: 'Rolling green hillside under soft light' },
  { src: 'images/nature6.jpg', category: 'nature', alt: 'Close-up of dew-covered foliage at sunrise' },
  { src: 'images/nature7.jpg', category: 'nature', alt: 'Close-up of dew-covered foliage at sunrise' },

  { src: 'images/sea1.jpg', category: 'sea', alt: 'Calm turquoise sea meeting a pale horizon' },
  { src: 'images/sea2.jpg', category: 'sea', alt: 'Deep blue ocean waves rolling toward the shore' },
  { src: 'images/sea3.jpg', category: 'sea', alt: 'Coastal water shifting from teal to deep navy' },
  { src: 'images/sea4.jpg', category: 'sea', alt: 'Calm turquoise sea meeting a pale horizon' },
  { src: 'images/sea5.jpg', category: 'sea', alt: 'Deep blue ocean waves rolling toward the shore' },

    

 
  { src: 'images/cars1.jpg', category: 'cars', alt: 'Classic car in dramatic low studio light' },
  { src: 'images/cars2.jpg', category: 'cars', alt: 'Motion streaks suggesting a car speeding past at night' },
  { src: 'images/cars3.jpg', category: 'cars', alt: 'Close-up automotive detail with warm highlights' },
  { src: 'images/cars4.jpg', category: 'cars', alt: 'Classic car in dramatic low studio light' },
  { src: 'images/cars5.jpg', category: 'cars', alt: 'Motion streaks suggesting a car speeding past at night' },
  { src: 'images/cars6.jpg', category: 'cars', alt: 'Close-up automotive detail with warm highlights' },
 

  { src: 'images/cities1.jpg', category: 'cities', alt: 'City skyline silhouette at dusk' },
  { src: 'images/cities2.jpg', category: 'cities', alt: 'Downtown high-rises glowing under a purple sky' },
  { src: 'images/cities3.jpg', category: 'cities', alt: 'Urban rooftops layered against an amber sunset' },
  { src: 'images/cities4.jpg', category: 'cities', alt: 'City skyline silhouette at dusk' },
  { src: 'images/cities5.jpg', category: 'cities', alt: 'Downtown high-rises glowing under a purple sky' },
  { src: 'images/cities6.jpg', category: 'cities', alt: 'Urban rooftops layered against an amber sunset' },
];
 
/* ==========================================================================
   2. DOM REFERENCES
   ========================================================================== */
 
const galleryEl = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');
 
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
 
// Tracks which category is currently shown ("all" | "nature" | "sea" | "cars" | "cities")
let activeFilter = 'all';
 
// Tracks the index (within imageData) of the photo currently open in the lightbox
let currentIndex = 0;
 
// Remembers what was focused before the lightbox opened, so focus can
// return there when it closes (good keyboard-accessibility practice)
let lastFocusedElement = null;
 
/* ==========================================================================
   3. RENDER THE GALLERY GRID
   ========================================================================== */
 
function renderGallery() {
  galleryEl.innerHTML = '';
 
  imageData.forEach((photo, index) => {
    // Each card is a real <button> so it's keyboard-focusable and
    // announced correctly by screen readers — no need for a click
    // listener + tabindex hack on a <div>.
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'gallery__item';
    item.dataset.category = photo.category;
    item.dataset.index = index;
    item.setAttribute('aria-label', `Open full screen: ${photo.alt}`);
 
    item.innerHTML = `
      <span class="gallery__frame">
        <img src="${photo.src}" alt="${photo.alt}" loading="lazy" />
      </span>
      <span class="gallery__caption">
        <span class="gallery__tag">${photo.category}</span>
      </span>
    `;
 
    item.addEventListener('click', () => openLightbox(index));
    galleryEl.appendChild(item);
  });
}
 
/* ==========================================================================
   4. CATEGORY FILTERING
   ========================================================================== */
 
const FADE_OUT_DURATION = 200; // must match the CSS transition time for .is-hiding
 
function applyFilter(category) {
  activeFilter = category;
 
  // Update which filter button looks active
  filterButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.filter === category);
  });
 
  const items = galleryEl.querySelectorAll('.gallery__item');
 
  items.forEach((item) => {
    const matches = category === 'all' || item.dataset.category === category;
 
    if (matches) {
      // Show it: cancel any pending fade-out, then play the "enter" animation
      item.classList.remove('is-hidden', 'is-hiding');
      item.classList.remove('is-entering');
      void item.offsetWidth; // forces a reflow so the animation restarts
      item.classList.add('is-entering');
    } else {
      // Hide it: fade out first, then remove from layout once the
      // transition finishes so the grid reflows smoothly
      item.classList.add('is-hiding');
      setTimeout(() => {
        // Only finish hiding if the filter hasn't changed again in the meantime
        if (item.dataset.category !== activeFilter && activeFilter !== 'all') {
          item.classList.add('is-hidden');
        }
      }, FADE_OUT_DURATION);
    }
  });
}
 
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
});
 
/* ==========================================================================
   5. LIGHTBOX
   ========================================================================== */
 
// Returns the list of image indexes that match the current filter,
// so Prev/Next only cycle through what the user can actually see
function getVisibleIndexes() {
  return imageData
    .map((photo, index) => ({ photo, index }))
    .filter(({ photo }) => activeFilter === 'all' || photo.category === activeFilter)
    .map(({ index }) => index);
}
 
function openLightbox(index) {
  currentIndex = index;
  lastFocusedElement = document.activeElement;
 
  updateLightboxContent();
 
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden'; // prevent background scrolling
  lightboxClose.focus();
 
  document.addEventListener('keydown', handleLightboxKeydown);
}
 
function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleLightboxKeydown);
 
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}
 
function updateLightboxContent() {
  const photo = imageData[currentIndex];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = photo.alt;
 
  const visible = getVisibleIndexes();
  const position = visible.indexOf(currentIndex) + 1;
  lightboxCounter.textContent = `${position} / ${visible.length}`;
}
 
// Moves to the next/previous image within the currently visible (filtered) set.
// Wraps around: Next from the last image returns to the first, and vice versa.
function showRelativeImage(direction) {
  const visible = getVisibleIndexes();
  if (visible.length === 0) return;
 
  const positionInVisible = visible.indexOf(currentIndex);
  const nextPosition = (positionInVisible + direction + visible.length) % visible.length;
 
  currentIndex = visible[nextPosition];
  updateLightboxContent();
}
 
function handleLightboxKeydown(event) {
  switch (event.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowRight':
      showRelativeImage(1);
      break;
    case 'ArrowLeft':
      showRelativeImage(-1);
      break;
  }
}
 
// Button listeners
lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', () => showRelativeImage(1));
lightboxPrev.addEventListener('click', () => showRelativeImage(-1));
 
// Click outside the image (on the dark backdrop) also closes the lightbox
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});
 
/* ==========================================================================
   INITIALIZE
   ========================================================================== */
 
renderGallery();