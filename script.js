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
reveals.forEach(el => io.observe(el))
window.addEventListener('load', () => {
  setTimeout(() => reveals.forEach(el => {
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight) el.classList.add('in')
  }), 200)
})

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
