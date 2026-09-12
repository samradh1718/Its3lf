const scenes = [
  `<h3 class="demo-title">Find. Scan. Add.</h3><p class="demo-sub">Point your camera at a barcode</p><div class="scanner"><div class="demo-product">EVERYDAY PICKS<strong>OATS</strong><div class="barcode"></div></div><span class="scan-line"></span></div><div class="demo-toast"><b><svg class="ui-icon" aria-hidden="true" focusable="false"><use href="#icon-check"/></svg></b> Rolled oats added to your basket</div><p class="demo-note">Illustrative app preview</p>`,
  `<h3 class="demo-title">Your good finds.</h3><p class="demo-sub">Review your basket before paying</p><div class="basket-item"><span>Rolled oats × 1</span><b>₹180</b></div><div class="basket-item"><span>Fresh oranges × 1</span><b>₹90</b></div><div class="basket-item"><span>Oat drink × 1</span><b>₹130</b></div><div class="demo-total"><span>Total</span><span>₹400</span></div><div class="demo-pay">Pay online <svg class="ui-icon" aria-hidden="true" focusable="false"><use href="#icon-arrow"/></svg></div><div class="demo-cash">Or pay cash at the counter</div><p class="demo-note">Illustrative products and prices</p>`,
  `<div class="success"><div class="success-mark"><svg class="ui-icon" aria-hidden="true" focusable="false"><use href="#icon-check"/></svg></div><h3 class="demo-title">All set. Let's go.</h3><p class="demo-sub">Payment complete</p><div class="qr-illustration" aria-hidden="true"></div><p class="demo-note">Show your exit QR to store staff<br>for verification.</p><div class="demo-toast">A little more time for you. <svg class="ui-icon" aria-hidden="true" focusable="false"><use href="#icon-arrow"/></svg></div><p class="demo-note">Illustration only · not a valid exit QR</p></div>`
];
const preview = document.querySelector('#demo-content');
const controls = [...document.querySelectorAll('[data-step]')];
let activeScene = -1;
function setScene(index) {
  if (index === activeScene) return;
  activeScene = index;
  preview.innerHTML = scenes[index];
  controls.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}
setScene(0);
controls.forEach(button => button.addEventListener('click', () => setScene(Number(button.dataset.step))));
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
}
const steps = [...document.querySelectorAll('[data-scene]')];
let scheduled = false;
function updateSceneOnScroll() {
  scheduled = false;
  const focusY = window.innerHeight * (window.innerWidth <= 650 ? 0.8 : 0.5);
  let nearest = null;
  let distance = Infinity;
  steps.forEach(step => {
    const rect = step.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const nextDistance = Math.abs(rect.top + rect.height / 2 - focusY);
    if (nextDistance < distance) { nearest = step; distance = nextDistance; }
  });
  if (nearest) setScene(Number(nearest.dataset.scene));
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateSceneOnScroll); }
}, { passive: true });
window.addEventListener('resize', updateSceneOnScroll);
updateSceneOnScroll();
