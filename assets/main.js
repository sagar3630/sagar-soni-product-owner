(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header border on scroll
  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, {passive: true}); onScroll();

  // Highlight the nav / TOC link for the section in view
  const spy = (links) => {
    const map = new Map();
    links.forEach(a => { const id = a.hash && a.hash.slice(1); const el = id && document.getElementById(id); if (el) map.set(el, a); });
    if (!map.size) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('on'));
      map.get(e.target).classList.add('on');
    }), {rootMargin: '-40% 0px -55% 0px'});
    map.forEach((_, el) => io.observe(el));
  };
  spy($$('.nav a[href^="#"]'));
  spy($$('.toc a'));

  // Hero ticket: tick acceptance criteria one by one (the page's one load moment)
  const crit = $$('.t-ac li');
  if (crit.length) {
    if (reduce) crit.forEach(li => li.classList.add('done'));
    else crit.forEach((li, i) => setTimeout(() => li.classList.add('done'), 500 + i * 380));
  }

  // Reveal for showcase charts
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); so.unobserve(e.target); } }), {threshold: .3});
  $$('.showcase').forEach(s => so.observe(s));

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

  // LinkedIn URL not provided yet
  $$('[data-todo]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
})();
