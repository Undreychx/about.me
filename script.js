// звуки кликов
const sounds = ['pop1', 'pop2', 'pop3', 'pop4'].map(n => {
  const a = new Audio('sounds/' + n + '.mp3');
  a.preload = 'auto';
  a.volume = 0.6;
  return a;
});
let last = -1;
function playPop() {
  let i;
  do { i = Math.floor(Math.random() * sounds.length); } while (i === last);
  last = i;
  const s = sounds[i].cloneNode();
  s.volume = 0.6;
  s.play().catch(() => {});
}

// волна при нажатии / касании
document.addEventListener('pointerdown', e => {
  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.left = e.clientX + 'px';
  r.style.top = e.clientY + 'px';
  r.style.width = r.style.height = '150px';
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 700);
  if (e.target.closest('a,button,.card,.pill,.contact-row,.stat,.q')) playPop();
});

// звёздное небо
const cv = document.getElementById('stars');
const ctx = cv.getContext('2d');
let W, H, stars = [], mx = 0, my = 0, shooting = [];
function resize() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
  stars = Array.from({ length: Math.min(190, W / 6) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    z: Math.random() * 1.6 + .3, t: Math.random() * 6
  }));
}
addEventListener('resize', resize);
resize();
addEventListener('mousemove', e => {
  mx = (e.clientX - W / 2) / W;
  my = (e.clientY - H / 2) / H;
  const c = document.getElementById('cursor');
  c.style.left = e.clientX + 'px';
  c.style.top = e.clientY + 'px';
});
function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.t += 0.02;
    const x = s.x - mx * 30 * s.z, y = s.y - my * 30 * s.z;
    ctx.globalAlpha = .45 + Math.sin(s.t) * .4;
    ctx.fillStyle = s.z > 1.5 ? '#c084fc' : '#fff';
    ctx.beginPath();
    ctx.arc(x, y, s.z * .9, 0, 7);
    ctx.fill();
  }
  if (Math.random() < .004) shooting.push({ x: Math.random() * W, y: 0, l: 0 });
  shooting = shooting.filter(s => s.l < 60);
  for (const s of shooting) {
    s.x -= 9; s.y += 6; s.l++;
    ctx.globalAlpha = 1 - s.l / 60;
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + 70, s.y - 46);
    ctx.stroke();
  }
  requestAnimationFrame(draw);
}
draw();

// шапка, прогресс, кнопка вверх
const header = document.querySelector('header');
const prog = document.querySelector('.prog');
const topBtn = document.querySelector('.top');
addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 10);
  const p = scrollY / (document.body.scrollHeight - innerHeight || 1);
  prog.style.width = p * 100 + '%';
  topBtn.classList.toggle('show', scrollY > 500);
});
topBtn.onclick = () => scrollTo({ top: 0 });

// меню на телефоне
const burger = document.querySelector('.burger');
const nav = document.querySelector('header nav');
burger.onclick = () => {
  nav.classList.toggle('open');
  burger.textContent = nav.classList.contains('open') ? '✕' : '☰';
};

// плавный переход между страницами
document.querySelectorAll('a[href]').forEach(a => {
  const h = a.getAttribute('href');
  if (h.startsWith('#') || h.startsWith('http') || h.startsWith('tel') || h.startsWith('mailto')) return;
  a.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.add('leave');
    setTimeout(() => location.href = h, 340);
  });
});

// появление блоков при прокрутке
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    io.unobserve(e.target);
    e.target.querySelectorAll('[data-n]').forEach(count);
  }
}), { threshold: .15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 90 + 'ms';
  io.observe(el);
});
function count(el) {
  const to = +el.dataset.n;
  let n = 0;
  const t = setInterval(() => {
    n += Math.ceil(to / 40);
    if (n >= to) { n = to; clearInterval(t); }
    el.textContent = n + (el.dataset.s || '');
  }, 35);
}

// подсветка и наклон карточек
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const b = c.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    c.style.setProperty('--mx', x + 'px');
    c.style.setProperty('--my', y + 'px');
    c.style.transform = `perspective(700px) rotateX(${(.5 - y / b.height) * 9}deg) rotateY(${(x / b.width - .5) * 9}deg) translateY(-6px)`;
  });
  c.addEventListener('mouseleave', () => c.style.transform = '');
  const go = c.dataset.go;
  if (go) c.addEventListener('click', () => {
    document.body.classList.add('leave');
    setTimeout(() => location.href = go, 340);
  });
});

// печатающийся заголовок
const typed = document.getElementById('typed');
if (typed) {
  const words = ['сайты', 'мультиссылки', 'лендинги', 'медиакиты', 'визитки'];
  let w = 0, ch = 0, del = false;
  (function tick() {
    const word = words[w];
    typed.textContent = word.slice(0, ch);
    if (!del && ch === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && ch === 0) { del = false; w = (w + 1) % words.length; }
    ch += del ? -1 : 1;
    setTimeout(tick, del ? 45 : 95);
  })();
}

// вопросы и ответы
document.querySelectorAll('.q button').forEach(b => b.onclick = () => {
  const q = b.parentElement, was = q.classList.contains('open');
  document.querySelectorAll('.q').forEach(x => x.classList.remove('open'));
  if (!was) q.classList.add('open');
});

// окно заказа
const modal = document.getElementById('order');
const toast = document.getElementById('toast');
function say(t) {
  toast.textContent = t;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
function openOrder(type) {
  if (type) document.getElementById('kind').value = type;
  modal.classList.add('show');
}
document.querySelectorAll('[data-order]').forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  openOrder(b.dataset.order);
}));
modal.addEventListener('click', e => {
  if (e.target === modal || e.target.closest('.x')) modal.classList.remove('show');
});
addEventListener('keydown', e => e.key === 'Escape' && modal.classList.remove('show'));
document.getElementById('send').onclick = () => {
  const text = `Здравствуйте! Хочу заказать: ${document.getElementById('kind').value}.\nМеня зовут ${document.getElementById('nm').value || '—'}.\n${document.getElementById('msg').value}`;
  window.open('https://t.me/chandreybrest?text=' + encodeURIComponent(text), '_blank');
  modal.classList.remove('show');
  say('Открываю Telegram ✨');
};

// поиск в шапке главной
const sf = document.getElementById('sf');
if (sf) sf.onsubmit = e => {
  e.preventDefault();
  const v = document.getElementById('sq').value.toLowerCase();
  const map = { мульти: 'services.html', визит: 'services.html', лендинг: 'services.html', промо: 'services.html', медиа: 'services.html', прайс: 'services.html', портф: 'portfolio.html', контакт: 'contact.html' };
  const k = Object.keys(map).find(k => v.includes(k));
  say(k ? 'Нашёл! Перехожу…' : 'Открываю все услуги…');
  document.body.classList.add('leave');
  setTimeout(() => location.href = k ? map[k] : 'services.html', 700);
};
document.querySelectorAll('.pill[data-go]').forEach(p => p.onclick = () => {
  document.body.classList.add('leave');
  setTimeout(() => location.href = p.dataset.go, 340);
});
document.querySelectorAll('[data-copy]').forEach(c => c.addEventListener('click', e => {
  navigator.clipboard && navigator.clipboard.writeText(c.dataset.copy);
  say('Скопировано: ' + c.dataset.copy);
}));
