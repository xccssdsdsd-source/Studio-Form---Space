document.documentElement.classList.remove('no-js')
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduced) document.documentElement.classList.add('js')

const header = document.getElementById('site-header')
const toggle = document.querySelector('.menu-toggle')

const progress = document.createElement('div')
progress.className = 'scroll-progress'
document.body.appendChild(progress)

const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40)
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%'
}
onScroll()
window.addEventListener('scroll', onScroll, {passive: true})
window.addEventListener('resize', onScroll, {passive: true})

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

const reveals = [...document.querySelectorAll('.reveal')]
document.querySelectorAll('.pillars, .grid-services, .stats').forEach(group => {
  [...group.children].forEach((child, i) => {
    if (child.classList.contains('reveal') && !child.style.getPropertyValue('--i')) child.style.setProperty('--i', i)
  })
})

if (reduced || !window.anime) {
  reveals.forEach(el => el.classList.add('in'))
  document.querySelectorAll('.hero-title, .hero-actions').forEach(el => { el.style.opacity = '1' })
  document.querySelectorAll('.g-item').forEach(el => { el.style.opacity = '1' })
  document.querySelectorAll('.g-media').forEach(el => { el.style.clipPath = 'none' })
} else {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      obs.unobserve(e.target)
      const el = e.target
      el.classList.add('in')
      const delay = (parseFloat(el.style.getPropertyValue('--i')) || 0) * 90
      anime.set(el, {opacity: 0, translateY: 28, scale: .985})
      anime({
        targets: el,
        opacity: [0, 1],
        translateY: [28, 0],
        scale: [.985, 1],
        duration: 1000,
        delay,
        easing: 'cubicBezier(.16,1,.3,1)',
        complete: () => el.style.transform = ''
      })
    })
  }, {threshold: 0.08, rootMargin: '0px 0px -6% 0px'})
  reveals.forEach(el => io.observe(el))

  anime.timeline({easing: 'cubicBezier(.16,1,.3,1)'})
    .add({targets: '.hero-kicker', opacity: [0, 1], translateY: [18, 0], duration: 900, delay: 200})
    .add({targets: '.hero-title', opacity: [0, 1], translateY: [30, 0], duration: 1100}, '-=650')
    .add({targets: '.hero-actions > *', opacity: [0, 1], translateY: [20, 0], duration: 850, delay: anime.stagger(110)}, '-=700')
}

const galleryItems = [...document.querySelectorAll('.g-item')]

if (!reduced && window.anime) {
  const gio = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      obs.unobserve(e.target)
      const item = e.target
      const i = galleryItems.indexOf(item)
      const fromRight = item.dataset.dir === 'right'
      const media = item.querySelector('.g-media')
      const img = item.querySelector('img')
      const veil = item.querySelector('.g-veil')
      const cap = item.querySelectorAll('.g-cap > *')
      const delay = i * 130

      anime.set(item, {opacity: 1})
      anime.set(cap, {opacity: 0, translateY: 16})
      anime.set(veil, {opacity: 0})
      anime.set(img, {scale: 1.24, translateX: fromRight ? 40 : -40})

      anime.timeline({easing: 'cubicBezier(.16,1,.3,1)'})
        .add({
          targets: media,
          clipPath: fromRight
            ? ['inset(0 0 0 100%)', 'inset(0 0 0 0%)']
            : ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
          duration: 1150,
          delay
        })
        .add({targets: img, scale: 1, translateX: 0, duration: 1500}, delay)
        .add({targets: veil, opacity: .92, duration: 900}, delay + 350)
        .add({targets: cap, opacity: 1, translateY: 0, duration: 800, delay: anime.stagger(90)}, delay + 500)
    })
  }, {threshold: .18})
  galleryItems.forEach(el => gio.observe(el))

  galleryItems.forEach(item => {
    const img = item.querySelector('img')
    item.addEventListener('pointermove', (e) => {
      const r = item.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - .5
      const y = (e.clientY - r.top) / r.height - .5
      anime({targets: img, translateX: x * 14, translateY: y * 14, duration: 700, easing: 'easeOutQuad'})
    })
    item.addEventListener('pointerleave', () => {
      anime({targets: img, translateX: 0, translateY: 0, duration: 900, easing: 'easeOutElastic(1, .8)'})
    })
    item.addEventListener('pointerdown', () => anime({targets: item, scale: .985, duration: 160, easing: 'easeOutQuad'}))
    item.addEventListener('pointerup', () => anime({targets: item, scale: 1, duration: 500, easing: 'easeOutElastic(1, .6)'}))
  })
}
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

if (!reduced && matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) / r.width
      const y = (e.clientY - r.top - r.height / 2) / r.height
      btn.style.transform = `translate(${x * 8}px, ${y * 8}px)`
    })
    btn.addEventListener('pointerleave', () => { btn.style.transform = '' })
  })
}
