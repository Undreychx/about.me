// звуки кликов
const sounds = ['pop1', 'pop2', 'pop3', 'pop4'].map(n => {
  const a = new Audio('sounds/' + n + '.mp3');
  a.preload = 'auto';
  a.volume = 0.6;
  return a;
});
let last = -1;
let muted = false;
try { muted = localStorage.getItem('muted') === '1'; } catch (e) {}
function playPop() {
  if (muted) return;
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
  if (e.target.closest('a,button,.card.link,.card.popup,.pill,.contact-row,.q')) playPop();
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
    const t = e.target;
    setTimeout(() => { t.classList.remove('reveal', 'in'); t.style.transitionDelay = ''; }, 1000);
    io.unobserve(e.target);
    setTimeout(() => { e.target.classList.add('done'); e.target.style.transitionDelay = ''; }, 1100);
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
document.querySelectorAll('.card.link,.card.popup').forEach(c => {
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
const nmField = document.getElementById('nm');
try { nmField.value = localStorage.getItem('name') || ''; } catch (e) {}
document.getElementById('send').onclick = () => {
  const msgField = document.getElementById('msg');
  let ok = true;
  [nmField, msgField].forEach(f => {
    f.classList.remove('bad');
    if (f.value.trim().length < 2) { void f.offsetWidth; f.classList.add('bad'); ok = false; }
  });
  if (!ok) return say('Заполните имя и коротко опишите задачу');
  try { localStorage.setItem('name', nmField.value.trim()); } catch (e) {}
  const text = `Здравствуйте! Хочу заказать: ${document.getElementById('kind').value}.\nМеня зовут ${document.getElementById('nm').value || '—'}.\n${document.getElementById('msg').value}`;
  window.open('https://t.me/chandreybrest?text=' + encodeURIComponent(text), '_blank');
  modal.classList.remove('show');
  say('Открываю Telegram ✨');
};

// поиск в шапке главной
// ---- поиск по сайту ----
const INDEX = [
  { i: '🏠', t: 'Главная', d: 'Начало сайта Unchx', u: 'index.html', k: 'главная домой старт' },
  { i: '💼', t: 'Услуги и цены', d: 'Все типы сайтов и стоимость', u: 'services.html', k: 'услуги цены стоимость прайс сколько стоит' },
  { i: '🖼️', t: 'Портфолио', d: 'Примеры моих работ', u: 'portfolio.html', k: 'портфолио работы примеры проекты' },
  { i: '👤', t: 'Обо мне', d: 'Чабан Андрей, веб-программист из Бреста', u: 'about.html', k: 'обо мне андрей чабан разработчик брест html5 github' },
  { i: '📞', t: 'Контакты', d: 'Telegram, телефон, email', u: 'contact.html', k: 'контакты связаться написать позвонить' },
  { i: '🔗', t: 'Мультиссылки и визитки', d: 'Все соцсети на одной странице · от 70 BYN', u: 'services.html', k: 'мультиссылка визитка соцсети youtube instagram telegram 70 byn цена' },
  { i: '🚀', t: 'Промо-страницы (Landing Page)', d: 'Под запуск курсов, гайдов, мерча · от 100 BYN', u: 'services.html', k: 'промо лендинг landing курс гайд мерч реклама инфопродукт 100 byn цена' },
  { i: '📚', t: 'Многостраничные сайты', d: 'Разделы, меню, статьи · от 200 BYN', u: 'services.html', k: 'многостраничный сайт разделы меню статьи каталог 200 byn цена' },
  { i: '📊', t: 'Медиакиты и прайс-листы', d: 'Для рекламодателей · от 90 BYN', u: 'services.html', k: 'медиакит прайс блог статистика рекламодатель интеграции 90 byn цена' },
  { i: '🪑', t: 'Мебель под заказ (реклама)', d: 'Многостраничный каталог мебельной мастерской', u: 'portfolio.html', k: 'мебель кухни шкафы портфолио пример реклама мастерская' },
  { i: '✈️', t: 'Telegram @chandreybrest', d: 'Написать мне в Telegram', u: 'https://t.me/chandreybrest', k: 'telegram телеграм тг чат написать' },
  { i: '📱', t: 'Телефон +375 29 784 26 14', d: 'Позвонить', u: 'tel:+375297842614', k: 'телефон номер позвонить звонок' },
  { i: '✉️', t: 'Email ch.and_rey@icloud.com', d: 'Написать на почту', u: 'mailto:ch.and_rey@icloud.com', k: 'email почта mail письмо' },
  { i: '🆓', t: 'Хостинг бесплатно', d: 'Размещаю на GitHub Pages без ежемесячной платы', u: 'index.html#faq', k: 'хостинг бесплатно github pages платить' },
  { i: '⚡', t: 'Скорость и работа на телефоне', d: 'Чистый HTML5, быстро на любых устройствах', u: 'index.html#faq', k: 'быстро скорость телефон мобильный адаптив' },
  { i: '⏱️', t: 'Сроки и дедлайны', d: 'Сроки обсуждаем заранее и строго соблюдаем', u: 'index.html#faq', k: 'срок сроки быстро дедлайн готово' },
  { i: '📝', t: 'Заказать сайт', d: 'Откроется окно заказа', u: '#order', k: 'заказать заказ оформить купить сделать' }
];
const norm = s => s.toLowerCase().replace(/ё/g, 'е');
function find(q) {
  const words = norm(q).split(/\s+/).filter(Boolean).map(w => w.length > 4 ? w.slice(0, -2) : w);
  if (!words.length) return [];
  return INDEX.map(it => {
    const t = norm(it.t), d = norm(it.d), k = norm(it.k);
    let score = 0;
    for (const w of words) {
      const s = (t.includes(w) ? 3 : 0) + (k.includes(w) ? 2 : 0) + (d.includes(w) ? 1 : 0);
      if (!s) return null;
      score += s;
    }
    return { it, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(r => r.it);
}
function go(u) {
  if (u === '#order') { closeAll(); return openOrder(); }
  if (/^(https?:|tel:|mailto:)/.test(u)) return window.open(u, '_blank');
  document.body.classList.add('leave');
  setTimeout(() => location.href = u, 340);
}
function renderRes(ul, items, q) {
  ul.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = q ? 'Ничего не нашёл. Попробуйте: цена, telegram, сайт' : 'Начните вводить запрос';
    ul.appendChild(li);
    return;
  }
  const w = norm(q).split(/\s+/).filter(Boolean)[0] || '';
  items.slice(0, 8).forEach((it, n) => {
    const li = document.createElement('li');
    if (n === 0) li.className = 'sel';
    const box = document.createElement('div');
    const b = document.createElement('b');
    const at = norm(it.t).indexOf(w.length > 4 ? w.slice(0, -2) : w);
    if (w && at >= 0) {
      const len = w.length > 4 ? w.length - 2 : w.length;
      b.append(it.t.slice(0, at));
      const m = document.createElement('mark');
      m.textContent = it.t.slice(at, at + len);
      b.append(m, it.t.slice(at + len));
    } else b.textContent = it.t;
    const sm = document.createElement('small');
    sm.textContent = it.d;
    box.append(b, sm);
    const ic = document.createElement('span');
    ic.textContent = it.i;
    const ar = document.createElement('span');
    ar.className = 'go';
    ar.textContent = it.u === '#order' ? '⧉' : '→';
    li.append(ic, box, ar);
    li.onclick = () => go(it.u);
    li.dataset.u = it.u;
    ul.appendChild(li);
  });
}
function moveSel(ul, dir) {
  const lis = [...ul.querySelectorAll('li:not(.empty)')];
  if (!lis.length) return;
  let n = lis.findIndex(l => l.classList.contains('sel'));
  lis.forEach(l => l.classList.remove('sel'));
  n = (n + dir + lis.length) % lis.length;
  lis[n].classList.add('sel');
  lis[n].scrollIntoView({ block: 'nearest' });
}
function pick(ul) {
  const s = ul.querySelector('li.sel:not(.empty)');
  if (s) go(s.dataset.u);
  return !!s;
}

// окно поиска
const finder = document.getElementById('find');
const fq = document.getElementById('fq');
const fres = document.getElementById('fres');
function openFind() {
  finder.classList.add('show');
  fq.value = '';
  renderRes(fres, INDEX.slice(0, 5), '');
  setTimeout(() => fq.focus(), 50);
}
function closeAll() {
  modal.classList.remove('show');
  finder.classList.remove('show');
}
document.querySelectorAll('[data-search]').forEach(b => b.onclick = openFind);
finder.addEventListener('click', e => {
  if (e.target === finder || e.target.closest('.x')) finder.classList.remove('show');
});
fq.addEventListener('input', () => renderRes(fres, fq.value.trim() ? find(fq.value) : INDEX.slice(0, 5), fq.value.trim()));
fq.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(fres, 1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(fres, -1); }
  if (e.key === 'Enter') pick(fres);
});
addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
    e.preventDefault();
    openFind();
  }
  if (e.key === 'Escape') closeAll();
});

// поиск на главной
const sf = document.getElementById('sf');
if (sf) {
  const sq = document.getElementById('sq');
  const box = document.createElement('div');
  box.className = 'sres';
  const ul = document.createElement('ul');
  ul.className = 'res';
  box.appendChild(ul);
  sf.appendChild(box);
  sq.addEventListener('input', () => {
    const q = sq.value.trim();
    box.classList.toggle('show', !!q);
    if (q) renderRes(ul, find(q), q);
  });
  sq.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(ul, 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(ul, -1); }
  });
  document.addEventListener('click', e => { if (!sf.contains(e.target)) box.classList.remove('show'); });
  sf.onsubmit = e => {
    e.preventDefault();
    if (!sq.value.trim()) return say('Введите, что ищете');
    if (!pick(ul)) say('Ничего не нашёл, попробуйте другое слово');
  };
}

// переключатель звука
const snd = document.getElementById('snd');
function drawSnd() {
  snd.textContent = muted ? '🔇' : '🔊';
  snd.classList.toggle('off', muted);
}
drawSnd();
snd.onclick = () => {
  muted = !muted;
  try { localStorage.setItem('muted', muted ? '1' : '0'); } catch (e) {}
  drawSnd();
  say(muted ? 'Звук кликов выключен' : 'Звук кликов включён');
  if (!muted) playPop();
};

// сортировка услуг по цене
const svc = document.getElementById('svc');
if (svc) {
  const cards = [...svc.children];
  document.querySelectorAll('[data-sort]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-sort]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    const m = b.dataset.sort;
    const list = m === '0' ? cards : [...cards].sort((a, c) => (m === 'asc' ? 1 : -1) * (a.dataset.price - c.dataset.price));
    list.forEach(c => svc.appendChild(c));
  }));
}

document.querySelectorAll('.pill[data-go]').forEach(p => p.onclick = () => {
  document.body.classList.add('leave');
  setTimeout(() => location.href = p.dataset.go, 340);
});
document.querySelectorAll('[data-copy]').forEach(c => c.addEventListener('click', e => {
  navigator.clipboard && navigator.clipboard.writeText(c.dataset.copy);
  say('Скопировано: ' + c.dataset.copy);
}));

// возврат на страницу кнопкой «назад»
addEventListener('pageshow', e => {
  if (e.persisted) document.body.classList.remove('leave');
});
