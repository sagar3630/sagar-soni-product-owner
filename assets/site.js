(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const calm = root.classList.contains('static') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Mobile menu ----
  const mb = $('.menu-btn'), nav = $('#nav');
  if (mb && nav) {
    const set = (open) => { mb.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); };
    mb.addEventListener('click', () => set(mb.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); mb.focus(); } });
  }

  // ---- Work carousel: buttons + native swipe/scroll-snap, never auto-rotates ----
  $$('[data-carousel]').forEach(car => {
    const track = $('.ctrack', car), btns = $$('.car-btn', car);
    if (!track) return;
    const step = () => {
      const s = $('.slide', track);
      return s ? s.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 24) : track.clientWidth * .8;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      btns.forEach(b => { b.disabled = b.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max; });
    };
    btns.forEach(b => b.addEventListener('click', () => {
      track.scrollBy({left: step() * Number(b.dataset.dir), behavior: calm ? 'auto' : 'smooth'});
    }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), {passive: true});
    addEventListener('resize', update);
    update();
  });

  // ---- Reveal for showcase charts ----
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); so.unobserve(e.target); } }), {threshold: .3});
    $$('.showcase').forEach(s => so.observe(s));
  } else $$('.showcase').forEach(s => s.classList.add('in'));

  // ---- Mockup interactions (from v2) ----
  // ---- LoveYa order tracker ----
  const lyc = $('#lycOrder');
  if (lyc) {
    const steps = [
      {chip: 'Awaiting kitchen', btn: 'Accept as restaurant'},
      {chip: 'Accepted', btn: 'Start preparing'},
      {chip: 'Preparing', btn: 'Mark delivered'},
      {chip: 'Delivered', btn: 'Start over'}
    ];
    let st = 0;
    const bars = $$('.track i', lyc), labels = $$('.track-l span', lyc), btn = $('.btn', lyc), chip = $('.chip', lyc);
    btn.addEventListener('click', () => {
      st = (st + 1) % steps.length;
      bars.forEach((b, i) => b.classList.toggle('on', i <= st));
      labels.forEach((l, i) => l.classList.toggle('on', i === st));
      chip.textContent = steps[st].chip; btn.textContent = steps[st].btn;
    });
  }

  // ---- Thousand Greens map ----
  const map = $('#tgMap');
  if (map) {
    const clubs = [
      {x: 32, y: 34, name: 'Harbor Point Golf Club', hosts: 6, l: 3},
      {x: 62, y: 58, name: 'Cedar Ridge Country Club', hosts: 3, l: 2},
      {x: 80, y: 28, name: 'Old Quarry Links', hosts: 1, l: 1},
      {x: 18, y: 72, name: 'Willow Bend Golf Club', hosts: 4, l: 2},
      {x: 50, y: 22, name: 'Northfield Golf Club', hosts: 5, l: 3}
    ];
    const tier = ['', 'Low', 'Medium', 'High'];
    const sheet = $('#tgSheet');
    const pinSvg = '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="var(--c)"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>';
    clubs.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pin' + (c.l === 1 ? ' lo' : '') + (i === 0 ? ' sel' : '');
      b.style.left = c.x + '%'; b.style.top = c.y + '%';
      b.setAttribute('aria-label', c.name + ', ' + tier[c.l] + ' chance');
      b.innerHTML = pinSvg;
      b.addEventListener('click', () => {
        $$('.pin', map).forEach(p => p.classList.remove('sel')); b.classList.add('sel');
        $('#tgName').textContent = c.name;
        $('#tgHosts').textContent = c.hosts + (c.hosts === 1 ? ' member can host' : ' members can host');
        $('#tgTier').textContent = tier[c.l];
        $('#tgProb').dataset.l = c.l;
        sheet.classList.remove('sent');
      });
      map.appendChild(b);
    });
    $('#tgSend').addEventListener('click', () => sheet.classList.add('sent'));
  }

  // ---- Divya Santan slots ----
  const slotsEl = $('#dsSlots');
  if (slotsEl) {
    const times = ['10:00', '11:30', '1:00', '3:30', '5:00', '6:30'];
    const taken = {0: [1, 4], 1: [0, 2, 3], 2: [5], 3: [0, 1, 2, 3], 4: [2]};
    const book = $('#dsBook');
    let day = 0;
    const render = () => {
      slotsEl.innerHTML = '';
      times.forEach((t, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
        if ((taken[day] || []).includes(i)) b.disabled = true;
        b.addEventListener('click', () => {
          $$('button', slotsEl).forEach(x => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          book.disabled = false; book.textContent = 'Book ' + t + ', ₹750';
        });
        slotsEl.appendChild(b);
      });
      book.disabled = true; book.textContent = 'Choose a time';
    };
    $$('#dsDays button').forEach((b, i) => b.addEventListener('click', () => {
      $$('#dsDays button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); day = i; render();
    }));
    book.addEventListener('click', () => { book.textContent = 'Booked. See you then.'; book.disabled = true; });
    render();
  }

  // ---- TaxVero path → form ----
  $$('input[name="tvp"]').forEach(r => r.addEventListener('change', () => { $('#tvForm').textContent = 'Form ' + r.value; }));

  // ---- EngageKart tabs ----
  const tabs = $$('.ek-tabs [role="tab"]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.setAttribute('aria-selected', x === t); document.getElementById(x.getAttribute('aria-controls')).hidden = x !== t; });
  }));
})();

/* books shelf: pointer tilt + tap to pick up */
(function(){
  var books = document.querySelectorAll('.book');
  if(!books.length) return;
  var calm = document.documentElement.classList.contains('static') ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  books.forEach(function(b){
    var inner = b.querySelector('.b-3d');
    b.addEventListener('click', function(){ b.classList.toggle('up'); });
    b.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); b.classList.toggle('up'); }
    });
    if(calm) return;
    b.addEventListener('pointermove', function(e){
      if(e.pointerType !== 'mouse') return;
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      inner.style.transform = 'translateY(-22px) rotateY(' + (-30 + x * 22).toFixed(1) + 'deg) rotateX(' + (6 - y * 14).toFixed(1) + 'deg)';
    });
    b.addEventListener('pointerleave', function(){ inner.style.transform = ''; });
  });
})();
