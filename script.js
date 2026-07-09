document.documentElement.classList.remove('no-js')

const header = document.getElementById('site-header')
const toggle = document.querySelector('.menu-toggle')

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40)
onScroll()
window.addEventListener('scroll', onScroll, {passive: true})

toggle.addEventListener('click', () => {
  const open = header.classList.toggle('open')
  toggle.setAttribute('aria-expanded', open)
  toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu')
})
document.querySelectorAll('.mobile-menu a').forEach(a =>
  a.addEventListener('click', () => {
    header.classList.remove('open')
    toggle.setAttribute('aria-expanded', 'false')
  })
)

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in')
      io.unobserve(e.target)
    }
  })
}, {threshold: 0.01, rootMargin: '0px 0px -8% 0px'})
const reveals = document.querySelectorAll('.reveal')
document.querySelectorAll('.pillars, .grid-services, .stats, .grid-gallery').forEach(group => {
  [...group.children].forEach((child, i) => {
    if (child.classList.contains('reveal') && !child.style.getPropertyValue('--i')) child.style.setProperty('--i', i)
  })
})
reveals.forEach(el => io.observe(el))
setTimeout(() => reveals.forEach(el => {
  if (!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight * 1.1) el.classList.add('in')
}), 300)

const galleryItems = [...document.querySelectorAll('.g-item')]
const lightbox = document.getElementById('lightbox')
const lbTrack = lightbox.querySelector('.lb-track')
const lbCounter = lightbox.querySelector('.lb-counter')
const lbPrev = lightbox.querySelector('.lb-prev')
const lbNext = lightbox.querySelector('.lb-next')
const lbClose = lightbox.querySelector('.lb-close')
let lbIndex = 0
let lastFocused = null

const slides = galleryItems.map(item => {
  const img = item.querySelector('img')
  return {src: img.src, alt: img.alt}
})

const renderSlide = (dir) => {
  const {src, alt} = slides[lbIndex]
  const old = lbTrack.querySelector('.lb-slide')
  const next = document.createElement('figure')
  next.className = `lb-slide${dir === 'right' ? ' dir-right' : ''}`
  next.innerHTML = `<img src="${src}" alt="${alt}">`
  lbTrack.appendChild(next)
  requestAnimationFrame(() => next.classList.add('active'))
  if (old) old.remove()
  lbCounter.textContent = `${lbIndex + 1} / ${slides.length}`
}

const openLightbox = (index) => {
  lbIndex = index
  lastFocused = document.activeElement
  lightbox.hidden = false
  requestAnimationFrame(() => lightbox.classList.add('open'))
  renderSlide()
  document.body.style.overflow = 'hidden'
  lbClose.focus()
}

const closeLightbox = () => {
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
  setTimeout(() => { lightbox.hidden = true }, 350)
  if (lastFocused) lastFocused.focus()
}

const goTo = (delta) => {
  lbIndex = (lbIndex + delta + slides.length) % slides.length
  renderSlide(delta > 0 ? 'right' : 'left')
}

galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)))
lbPrev.addEventListener('click', () => goTo(-1))
lbNext.addEventListener('click', () => goTo(1))
lbClose.addEventListener('click', closeLightbox)
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox() })
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') goTo(1)
  if (e.key === 'ArrowLeft') goTo(-1)
})

let touchStartX = 0
lbTrack.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX }, {passive: true})
lbTrack.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 40) goTo(dx < 0 ? 1 : -1)
}, {passive: true})

const form = document.querySelector('.contact-form')
const status = document.querySelector('.form-status')
form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }
  status.textContent = 'Dziękuję! Odezwę się w ciągu 24 godzin.'
  form.reset()
})
