import { animate, svg } from './vendor/anime.min.js'

document.documentElement.classList.remove('no-js')

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canHover = window.matchMedia('(pointer: fine)').matches

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

/* hero heart — drawn in on load, layered under the existing CSS fade-in */
if (!reduceMotion) {
  const heartPath = document.querySelector('.hero-title .heart path')
  if (heartPath) {
    const [drawable] = svg.createDrawable(heartPath)
    animate(drawable, {
      draw: ['0 0', '0 1'],
      duration: 1300,
      delay: 700,
      ease: 'inOutQuad'
    })
  }
}

/* scroll reveals — anime.js powered fade + rise + soften-into-focus */
const reveals = document.querySelectorAll('.reveal')
document.querySelectorAll('.pillars, .grid-services, .stats, .grid-gallery').forEach(group => {
  [...group.children].forEach((child, i) => {
    if (child.classList.contains('reveal') && !child.style.getPropertyValue('--i')) child.style.setProperty('--i', i)
  })
})

const countUp = (el) => {
  const node = el.firstChild
  if (!node || node.nodeType !== Node.TEXT_NODE) return
  const match = node.textContent.trim().match(/^([\d.]+)(.*)$/)
  if (!match) return
  const [, numStr, suffix] = match
  const decimals = (numStr.split('.')[1] || '').length
  const counter = {val: 0}
  animate(counter, {
    val: parseFloat(numStr),
    duration: 1400,
    delay: 200,
    ease: 'outExpo',
    onUpdate: () => { node.textContent = counter.val.toFixed(decimals) + suffix }
  })
}

const revealAnimation = (el) => {
  if (el.classList.contains('in')) return
  el.classList.add('in')
  const i = Number(el.style.getPropertyValue('--i')) || 0
  animate(el, {
    opacity: [0, 1],
    translateY: [26, 0],
    filter: ['blur(6px)', 'blur(0px)'],
    duration: 900,
    delay: i * 90,
    ease: 'outQuint'
  })
  const counted = el.querySelector('[data-count]')
  if (counted) countUp(counted)
}

if (reduceMotion) {
  reveals.forEach(el => {
    el.classList.add('in')
    el.style.opacity = 1
    const counted = el.querySelector('[data-count]')
    if (counted) countUp(counted)
  })
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        revealAnimation(e.target)
        io.unobserve(e.target)
      }
    })
  }, {threshold: 0.01, rootMargin: '0px 0px -8% 0px'})
  reveals.forEach(el => io.observe(el))
  setTimeout(() => reveals.forEach(el => {
    if (!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight * 1.1) {
      revealAnimation(el)
      io.unobserve(el)
    }
  }), 300)
}

/* gallery tilt — subtle pointer-driven parallax on desktop */
if (!reduceMotion && canHover) {
  document.querySelectorAll('.g-item').forEach(item => {
    let bounds = null
    const onMove = (e) => {
      if (!bounds) bounds = item.getBoundingClientRect()
      const px = (e.clientX - bounds.left) / bounds.width - 0.5
      const py = (e.clientY - bounds.top) / bounds.height - 0.5
      animate(item, {
        rotateX: py * -6,
        rotateY: px * 8,
        translateY: -6,
        duration: 500,
        ease: 'out(3)'
      })
    }
    item.addEventListener('pointerenter', () => { bounds = item.getBoundingClientRect() })
    item.addEventListener('pointermove', onMove)
    item.addEventListener('pointerleave', () => {
      bounds = null
      animate(item, {
        rotateX: 0,
        rotateY: 0,
        translateY: 0,
        duration: 700,
        ease: 'outElastic(1, .6)'
      })
    })
  })
}

/* lightbox */
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
  next.className = 'lb-slide'
  next.innerHTML = `<img src="${src}" alt="${alt}">`
  lbTrack.appendChild(next)
  lbCounter.textContent = `${lbIndex + 1} / ${slides.length}`

  if (reduceMotion) {
    next.style.opacity = 1
    if (old) old.remove()
    return
  }

  const offset = dir === 'right' ? 44 : dir === 'left' ? -44 : 0
  animate(next, {
    opacity: [0, 1],
    translateX: [offset, 0],
    scale: [0.97, 1],
    duration: 500,
    ease: 'outQuart'
  })
  if (old) {
    animate(old, {
      opacity: [1, 0],
      translateX: [0, -offset],
      scale: [1, 0.97],
      duration: 380,
      ease: 'outQuart',
      onComplete: () => old.remove()
    })
  }
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
