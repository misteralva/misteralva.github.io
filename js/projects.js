

window.goToDesktop = function() {
  sessionStorage.setItem('da-skip-loader', '1');

  const mon     = document.getElementById('monitor-off');
  const line    = mon?.querySelector('.mon-off-line');
  const desktop = document.getElementById('kali-desktop');
  if (!mon) { window.location.href = 'index.html'; return; }

  
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [[784, 0], [659, 90], [523, 180]].forEach(([freq, delay]) => {
      setTimeout(() => {
        const osc = ac.createOscillator(), g = ac.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.028, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.55);
        osc.connect(g); g.connect(ac.destination);
        osc.start(); osc.stop(ac.currentTime + 0.6);
      }, delay);
    });
  } catch {}

  
  if (desktop) desktop.classList.add('powering-off');

  
  setTimeout(() => mon.classList.add('mon-active'), 360);

  
  const terminal = document.getElementById('shutdown-terminal');
  const MSGS = [
    { t:0,    cls:'sd-ok',   txt:'[ OK ] Stopping kali-desktop.service' },
    { t:150,  cls:'sd-ok',   txt:'[ OK ] Stopping display-manager.service' },
    { t:300,  cls:'sd-ok',   txt:'[ OK ] Stopping network-manager.service' },
    { t:460,  cls:'sd-ok',   txt:'[ OK ] Reached target Shutdown' },
    { t:630,  cls:'sd-warn', txt:'The system will power off now.' },
    { t:800,  cls:'sd-dim',  txt:'Goodbye.' },
  ];
  MSGS.forEach(({ t, cls, txt }) => {
    setTimeout(() => {
      if (!terminal) return;
      const el = document.createElement('div');
      el.className = 'sd-line ' + cls;
      el.textContent = txt;
      terminal.appendChild(el);
    }, 480 + t);
  });

  
  setTimeout(() => {
    if (terminal) terminal.style.transition = 'opacity 0.4s ease-out';
    if (terminal) terminal.style.opacity    = '0';
  }, 1360);

  
  setTimeout(() => {
    if (line) {
      line.style.transition = 'none';
      line.style.opacity    = '1';
      line.style.transform  = 'scaleY(1)';
    }
  }, 1800);

  
  setTimeout(() => {
    if (line) {
      line.style.transition = 'transform 0.45s cubic-bezier(.7,0,1,1), opacity 0.2s';
      line.style.transform  = 'scaleY(0.004)';
    }
  }, 1860);

  
  setTimeout(() => {
    if (line) line.style.opacity = '0';
  }, 2340);

  
  setTimeout(() => { window.location.href = 'index.html'; }, 2500);
};

const LC = {
  JavaScript:'#f1e05a', HTML:'#e34c26', CSS:'#563d7c',
  Python:'#3572A5', TypeScript:'#2b7489', Shell:'#89e051',
  PHP:'#4F5D95', Ruby:'#701516', Go:'#00ADD8', Rust:'#dea584',
  Vue:'#41b883', React:'#61dafb', default:'#367bf0',
};

const CATS = {
  'Frontend':   { icon:'fa-code',         color:'#3b82f6' },
  'Networking': { icon:'fa-network-wired', color:'#f97316' },
  'Backend':    { icon:'fa-server',        color:'#22c55e' },
};

const REPO_CAT = {
  'pachinko':                      'Frontend',
  'misteralva.github.io':          'Frontend',
  'alwaysontech-red-empresarial':  'Networking',
  'lec-database':                  'Backend',
};

function categorizeRepo(repo) {
  return REPO_CAT[repo.name.toLowerCase()] || null;
}

let _currentCat      = null;
let _currentCatRepos = [];
let _currentCatDef   = null;

const FB = [
  { name:'Web-StarterKit',  description:'Modular web starter kit with frontend best practices and clean project structure.', html_url:'https://github.com/misteralva/Web-StarterKit',  language:'HTML',       stargazers_count:0, topics:['html','css','javascript'], homepage:null, updated_at:'2024-03-10T00:00:00Z' },
  { name:'GSAP-Actividad',  description:'Advanced GSAP animations, scroll effects, timeline sequences and smooth transitions.',    html_url:'https://github.com/misteralva/GSAP-Actividad',  language:'JavaScript', stargazers_count:0, topics:['gsap','scroll','animation'], homepage:null, updated_at:'2024-02-20T00:00:00Z' },
  { name:'GSAP-Practica',   description:'Motion design with GSAP: TextPlugin, morphSVG, staggered animations and visual effects.', html_url:'https://github.com/misteralva/GSAP-Practica',   language:'JavaScript', stargazers_count:0, topics:['gsap','motion','css'],       homepage:null, updated_at:'2024-01-15T00:00:00Z' },
];

let allRepos   = [];
let selectedIdx = -1;
const history  = [];
let histIdx    = -1;

const ICON_W = 88, ICON_H = 85, ICON_GAX = 10, ICON_GAY = 6, ICON_PAD = 16;

function getGridPos(idx) {
  const area   = document.getElementById('kali-icons-area');
  const aH     = area ? area.clientHeight : (window.innerHeight - 30);
  const perCol = Math.max(1, Math.floor((aH - ICON_PAD * 2) / (ICON_H + ICON_GAY)));
  const col    = Math.floor(idx / perCol);
  const row    = idx % perCol;
  return { x: ICON_PAD + col * (ICON_W + ICON_GAX), y: ICON_PAD + row * (ICON_H + ICON_GAY) };
}

function saveIconPositions() {
  const pos = {};
  document.querySelectorAll('.kali-icon').forEach((el, i) => {
    pos[i] = { x: parseInt(el.style.left) || 0, y: parseInt(el.style.top) || 0 };
  });
  try { localStorage.setItem('da-icon-pos', JSON.stringify(pos)); } catch {}
}

function loadIconPos(idx) {
  try {
    const data = JSON.parse(localStorage.getItem('da-icon-pos') || '{}');
    return data[idx] != null ? data[idx] : null;
  } catch { return null; }
}

function arrangeIcons() {
  document.querySelectorAll('.kali-icon').forEach((el, i) => {
    const p = getGridPos(i);
    el.style.left = p.x + 'px';
    el.style.top  = p.y + 'px';
  });
  try { localStorage.removeItem('da-icon-pos'); } catch {}
}

function makeDraggable(el) {
  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    let moved    = false;
    const area   = document.getElementById('kali-icons-area');
    const aRect  = area.getBoundingClientRect();
    const eRect  = el.getBoundingClientRect();
    const ox     = e.clientX - eRect.left;
    const oy     = e.clientY - eRect.top;
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = ev => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 5) {
        moved = true;
        el.classList.add('ki-dragging');
        document.body.style.userSelect = 'none';
      }
      if (!moved) return;
      el.style.left = Math.max(0, Math.min(ev.clientX - aRect.left - ox, aRect.width  - ICON_W)) + 'px';
      el.style.top  = Math.max(0, Math.min(ev.clientY - aRect.top  - oy, aRect.height - ICON_H)) + 'px';
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      el.classList.remove('ki-dragging');
      document.body.style.userSelect = '';
      if (moved) { el._dragged = true; saveIconPositions(); }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

function folderSVG(color, size) {
  const c  = color || '#367bf0';
  const c2 = c + 'bb';
  const w = size || 52, h = size ? Math.round(size*44/56) : 42;
  return `<svg viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="0" y="8" width="20" height="7" rx="2" fill="${c}"/>
    <rect x="0" y="13" width="56" height="31" rx="3" fill="${c2}"/>
    <rect x="0" y="13" width="56" height="5" rx="2" fill="${c}" opacity=".7"/>
    <rect x="4" y="20" width="28" height="2" rx="1" fill="rgba(255,255,255,.22)"/>
    <rect x="4" y="25" width="20" height="2" rx="1" fill="rgba(255,255,255,.15)"/>
    <rect x="4" y="30" width="24" height="2" rx="1" fill="rgba(255,255,255,.12)"/>
  </svg>`;
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)   return m + ' min ago';
  const h = Math.floor(m / 60);
  if (h < 24)   return h + ' hr ago';
  const d = Math.floor(h / 24);
  if (d < 30)   return d + ' day' + (d > 1 ? 's' : '') + ' ago';
  const mo = Math.floor(d / 30);
  if (mo < 12)  return mo + ' month' + (mo > 1 ? 's' : '') + ' ago';
  return Math.floor(mo / 12) + ' yr ago';
}

function startClock() {
  const timeEl = document.getElementById('kp-time');
  function tick() {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  }
  tick(); setInterval(tick, 10000);
}

function renderIcons(repos) {
  const container = document.getElementById('kali-icons');
  const loading   = document.getElementById('ki-loading');
  if (loading) loading.remove();
  container.innerHTML = '';
  _currentCat = null;

  
  const groups = {};
  repos.forEach(repo => {
    const cat = categorizeRepo(repo);
    if (!cat) return;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(repo);
  });

  const sorted = Object.keys(CATS).filter(c => groups[c]);

  const count = document.getElementById('ktb-count');
  if (count) count.textContent = sorted.length + ' folders';
  const ksb = document.getElementById('ksb-info');
  if (ksb) ksb.textContent = sorted.length + ' categories · /home/david/projects';

  sorted.forEach((catName, i) => {
    const catRepos = groups[catName];
    const def      = CATS[catName] || { icon:'fa-folder', color:'#64ffda' };
    const el       = document.createElement('div');
    el.className   = 'kali-icon';
    el.style.animationDelay = (i * 60) + 'ms';
    el.innerHTML =
      `<div class="ki-folder ki-cat-folder">` +
        `<div class="ki-cat-icon"><i class="fas ${def.icon}"></i></div>` +
        folderSVG(def.color) +
        `<span class="ki-cat-count">${catRepos.length}</span>` +
      `</div>` +
      `<span class="ki-label">${catName}</span>`;
    const pos = loadIconPos(i) || getGridPos(i);
    el.style.left = pos.x + 'px';
    el.style.top  = pos.y + 'px';
    makeDraggable(el);
    el.addEventListener('click', () => {
      if (el._dragged) { el._dragged = false; return; }
      selectIcon(i); openCategoryView(catName, catRepos, def);
    });
    container.appendChild(el);
  });
}

function openCategoryView(catName, catRepos, def) {
  _currentCat      = catName;
  _currentCatRepos = catRepos;
  _currentCatDef   = def;
  const win     = document.getElementById('kali-files');
  const content = document.getElementById('kfiles-content');
  const title   = document.getElementById('kfiles-title');
  const repoEl  = document.getElementById('khb-repo');
  const sep2    = document.getElementById('khb-sep2');
  if (title)  title.textContent  = catName;
  if (repoEl) { repoEl.textContent = catName; repoEl.style.display = ''; }
  if (sep2)   sep2.style.display = '';
  setPanelTitle('Files — /home/david/projects/' + catName);

  const ksb = document.getElementById('ksb-info');
  const sbr = document.getElementById('ksb-right');
  if (ksb) ksb.textContent = `${catRepos.length} ${catRepos.length === 1 ? 'item' : 'items'} · /home/david/projects/${catName}`;
  if (sbr) sbr.textContent = `misteralva/${catName.toLowerCase()}`;

  const accentColor = def?.color || '#64ffda';

  
  content.innerHTML = `
    <div class="kf-cat-header" style="--cat-color:${accentColor}">
      <div class="kf-cat-header-icon"><i class="fas ${def?.icon || 'fa-folder'}" style="color:${accentColor}"></i></div>
      <div>
        <h2 class="kf-cat-title">${catName}</h2>
        <span class="kf-cat-subtitle">${catRepos.length} ${catRepos.length === 1 ? 'repository' : 'repositories'}</span>
      </div>
    </div>
    <div class="kf-proj-grid" id="kf-proj-grid"></div>`;

  
  const grid = content.querySelector('#kf-proj-grid');
  catRepos.forEach((repo, i) => {
    const idx  = allRepos.indexOf(repo);
    const lc   = LC[repo.language] || LC.default;
    const name = repo.name.replace(/-/g, ' ');

    const el = document.createElement('div');
    el.className = 'kf-proj-folder';
    el.style.animationDelay = (i * 40) + 'ms';
    el.dataset.idx = idx;
    el.innerHTML =
      `<div class="kf-pf-icon">${folderSVG(lc, 52)}</div>` +
      `<span class="kf-pf-label" title="${name}">${name}</span>`;

    el.addEventListener('click', () => {
      
      grid.querySelectorAll('.kf-proj-folder').forEach(f => f.classList.remove('kf-pf-selected'));
      el.classList.add('kf-pf-selected');
    });
    el.addEventListener('dblclick', () => openProject(idx));

    
    let clickTimer;
    el.addEventListener('click', () => {
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => openProject(idx), 280);
    });
    el.addEventListener('dblclick', () => clearTimeout(clickTimer));

    grid.appendChild(el);
  });

  win.classList.add('open');
  win.setAttribute('aria-hidden', 'false');
}

function selectIcon(idx) {
  document.querySelectorAll('.kali-icon').forEach((el, i) =>
    el.classList.toggle('selected', i === idx)
  );
}

async function openProject(idx) {
  const repo = allRepos[idx];
  if (!repo) return;

  selectedIdx = idx;
  selectIcon(idx);

  const win     = document.getElementById('kali-files');
  const content = document.getElementById('kfiles-content');
  const title   = document.getElementById('kfiles-title');
  const lc      = LC[repo.language] || LC.default;
  const repoEl  = document.getElementById('khb-repo');
  const sep2    = document.getElementById('khb-sep2');

  
  if (title)  title.textContent  = repo.name;
  if (repoEl) { repoEl.textContent = repo.name.replace(/-/g,' '); repoEl.style.display=''; }
  if (sep2)   sep2.style.display = '';

  
  const sbi  = document.getElementById('ksb-info');
  const sbr  = document.getElementById('ksb-right');
  if (sbi) sbi.textContent = `${repo.language || 'Unknown'}  ·  ${timeAgo(repo.updated_at)}`;
  if (sbr) sbr.textContent = `misteralva/${repo.name}`;

  
  if (history[histIdx] !== idx) {
    history.splice(histIdx + 1);
    history.push(idx);
    histIdx = history.length - 1;
  }
  updateNavBtns();

  
  updateRecent(idx, lc, repo);

  
  const heroGrad = `linear-gradient(135deg, ${lc}22 0%, ${lc}0a 60%, transparent 100%)`;

  
  const updated = timeAgo(repo.updated_at);
  const stars   = repo.stargazers_count || 0;
  const forks   = repo.forks_count      || 0;
  const watchers = repo.watchers_count  || 0;

  
  const badgeBg  = lc + '22';
  const badgeBdr = lc + '55';

  
  const topics = (repo.topics || []).map(t => `<span class="kf-topic">${t}</span>`).join('');

  
  const ghBtn = `<a href="${repo.html_url}" target="_blank" rel="noopener" class="kf-btn-gh">
    <i class="fab fa-github"></i> Open on GitHub
  </a>`;
  const demoBtn = repo.homepage
    ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="kf-btn-demo">
        <i class="fas fa-arrow-up-right-from-square"></i> Live Demo
       </a>` : '';

  content.innerHTML = `
    <!-- HERO -->
    <div class="kf-hero">
      <div class="kf-hero-bg" style="--hero-grad:${heroGrad}"></div>
      <div class="kf-hero-pattern"></div>
      <div class="kf-hero-inner">
        <div class="kf-hero-top">
          <div class="kf-hero-icon">${folderSVG(lc, 46)}</div>
          <div>
            <h2 class="kf-name">${repo.name.replace(/-/g,' ')}</h2>
            <span class="kf-lang-badge" style="--badge-bg:${badgeBg};--badge-col:${lc};--badge-bdr:${badgeBdr}">
              <span class="kf-lang-dot-sm" style="background:${lc}"></span>
              ${repo.language || 'Unknown'}
            </span>
          </div>
        </div>
        <div class="kf-hero-stats">
          ${stars  ? `<span><i class="fas fa-star"></i> ${stars} stars</span>` : ''}
          ${forks  ? `<span><i class="fas fa-code-fork"></i> ${forks} forks</span>` : ''}
          ${watchers ? `<span><i class="fas fa-eye"></i> ${watchers} watchers</span>` : ''}
          <span><i class="fas fa-clock"></i> Updated ${updated}</span>
        </div>
      </div>
    </div>

    <!-- PROPERTIES -->
    <div class="kf-props">
      <div class="kf-prop">
        <span class="kfp-key">Language</span>
        <span class="kfp-val" style="color:${lc}">● ${repo.language || '—'}</span>
      </div>
      <div class="kf-prop">
        <span class="kfp-key">Stars</span>
        <span class="kfp-val">${stars ? '★ ' + stars : '—'}</span>
      </div>
      <div class="kf-prop">
        <span class="kfp-key">Forks</span>
        <span class="kfp-val">${forks ? forks : '—'}</span>
      </div>
      <div class="kf-prop">
        <span class="kfp-key">Updated</span>
        <span class="kfp-val">${updated}</span>
      </div>
      <div class="kf-prop">
        <span class="kfp-key">Size</span>
        <span class="kfp-val">${repo.size ? (repo.size > 1024 ? (repo.size/1024).toFixed(1)+' MB' : repo.size+' KB') : '—'}</span>
      </div>
      <div class="kf-prop">
        <span class="kfp-key">Visibility</span>
        <span class="kfp-val" style="color:#30a14e">● Public</span>
      </div>
      ${repo.homepage ? `<div class="kf-prop kf-prop-full">
        <span class="kfp-key">Homepage</span>
        <a class="kfp-val kfp-link" href="${repo.homepage}" target="_blank" rel="noopener">${repo.homepage.replace(/^https?:\/\//,'')}</a>
      </div>` : ''}
    </div>

    <!-- DESCRIPTION -->
    <div class="kf-section">
      <div class="kf-section-title">About</div>
      <p class="kf-desc">${repo.description || 'No description available.'}</p>
    </div>

    <!-- LANGUAGES (populated async) -->
    <div class="kf-section" id="kf-langs-section">
      <div class="kf-section-title">Languages</div>
      <div class="kf-lang-tags" id="kf-lang-tags">
        <span class="kf-lang-tag-loading">loading…</span>
      </div>
    </div>

    ${topics ? `
    <div class="kf-section">
      <div class="kf-section-title">Topics</div>
      <div class="kf-topics">${topics}</div>
    </div>` : ''}

    <!-- ACTIONS -->
    <div class="kf-section">
      <div class="kf-section-title">Links</div>
      <div class="kf-actions">${ghBtn}${demoBtn}</div>
    </div>

    <!-- README -->
    <div class="kf-section">
      <div class="kf-section-title"><i class="fas fa-file-lines" style="margin-right:4px"></i>README.md</div>
      <div class="kf-readme" id="kf-readme-pre">Loading…</div>
    </div>
  `;

  
  win.classList.add('open');
  win.setAttribute('aria-hidden','false');
  setPanelTitle('Files — /home/david/projects/' + repo.name);

  
  window._ktermProjectOpened?.(repo);

  
  const pre      = document.getElementById('kf-readme-pre');
  const langTags = document.getElementById('kf-lang-tags');

  const [, ] = await Promise.allSettled([

    
    (async () => {
      try {
        const r    = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/languages`);
        if (!r.ok) throw 0;
        const data = await r.json();
        const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
        const tags  = Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([lang, bytes]) => {
            const color = LC[lang] || '#6e7a9f';
            const pct   = ((bytes / total) * 100).toFixed(1);
            return `<span class="kf-lang-tag" style="--lc:${color}">
                      <span class="kf-lang-tag-dot"></span>${lang}
                      <span class="kf-lang-tag-pct">${pct}%</span>
                    </span>`;
          }).join('');
        if (langTags) langTags.innerHTML = tags || '<span class="kf-lang-tag-loading">—</span>';
      } catch {
        const fallback = repo.staticLanguages || (repo.language ? { [repo.language]: 1 } : null);
        if (langTags) {
          if (fallback) {
            const total = Object.values(fallback).reduce((a, b) => a + b, 0) || 1;
            langTags.innerHTML = Object.entries(fallback).map(([lang, bytes]) => {
              const color = LC[lang] || '#6e7a9f';
              const pct   = ((bytes / total) * 100).toFixed(1);
              return `<span class="kf-lang-tag" style="--lc:${color}"><span class="kf-lang-tag-dot"></span>${lang}<span class="kf-lang-tag-pct">${pct}%</span></span>`;
            }).join('');
          } else {
            langTags.innerHTML = '<span class="kf-lang-tag-loading">—</span>';
          }
        }
      }
    })(),

    
    (async () => {
      try {
        const r    = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/readme`);
        if (!r.ok) throw 0;
        const data = await r.json();
        const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0));
        const text  = new TextDecoder('utf-8').decode(bytes);
        if (pre) pre.innerHTML = marked.parse(text.length > 4000 ? text.slice(0, 4000) + '\n\n...' : text);
      } catch {
        if (pre) pre.textContent = 'No README found for this repository.';
      }
    })(),

  ]);
}

function updateNavBtns() {
  const back = document.getElementById('khb-back');
  const fwd  = document.getElementById('khb-fwd');
  if (back) back.disabled = histIdx <= 0 && !_currentCat;
  if (fwd)  fwd.disabled  = histIdx >= history.length - 1;
}

function goBack() {
  if (histIdx > 0) {
    histIdx--;
    openProject(history[histIdx]);
  } else if (_currentCat) {
    
    history.length = 0;
    histIdx = -1;
    openCategoryView(_currentCat, _currentCatRepos, _currentCatDef);
  }
}
function goForward() {
  if (histIdx >= history.length - 1) return;
  histIdx++;
  openProject(history[histIdx]);
}

const recentList = [];
function updateRecent(idx, lc, repo) {
  if (!recentList.includes(idx)) {
    recentList.unshift(idx);
    if (recentList.length > 5) recentList.pop();
  }
  const hdr = document.getElementById('ks-recent-hdr');
  const box = document.getElementById('ks-recent');
  if (!hdr || !box) return;
  hdr.style.display = '';
  box.innerHTML = recentList.slice(0,5).map(ri => {
    const r  = allRepos[ri];
    const rc = LC[r?.language] || LC.default;
    return `<div class="ks-recent-item${ri === idx ? ' ks-active' : ''}" onclick="openProject(${ri})">
      <span class="ks-rdot" style="background:${rc}"></span>
      ${(r?.name || '').replace(/-/g,' ')}
    </div>`;
  }).join('');
}

function closeFilesWin() {
  const win     = document.getElementById('kali-files');
  const content = document.getElementById('kfiles-content');
  win.classList.remove('open');
  win.setAttribute('aria-hidden','true');
  document.querySelectorAll('.kali-icon').forEach(el => el.classList.remove('selected'));
  selectedIdx = -1;
  const repoEl = document.getElementById('khb-repo');
  const sep2   = document.getElementById('khb-sep2');
  const title  = document.getElementById('kfiles-title');
  if (repoEl)  repoEl.textContent    = '';
  if (sep2)    sep2.style.display    = 'none';
  if (title)   title.textContent     = 'Files';
  if (content) content.style.cssText = '';
}

function initDragWin() {
  const win = document.getElementById('kali-files');
  const bar = document.getElementById('kali-win-bar');
  if (!win || !bar) return;
  let dragging = false, ox = 0, oy = 0;
  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.kwb,.kwt-r')) return;
    dragging = true;
    const rect = win.getBoundingClientRect();
    win.style.left = rect.left + 'px';
    win.style.top  = rect.top  + 'px';
    win.style.transform = 'none';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    win.classList.add('dragging');
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = Math.max(0, e.clientX - ox) + 'px';
    win.style.top  = Math.max(32, e.clientY - oy) + 'px';
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    win.classList.remove('dragging');
    document.body.style.userSelect = '';
  });
}

function boot(cb) {
  const overlay = document.getElementById('boot-overlay');
  const fill    = document.getElementById('boot-fill');
  const pct     = document.getElementById('boot-pct');
  const log     = document.getElementById('boot-log');
  if (!overlay) { cb(); return; }
  const MSGS = [
    '[  OK  ] Started kernel modules',
    '[  OK  ] Mounted /dev/portfolio',
    '[  OK  ] Starting OpenSSH daemon',
    '[  OK  ] Network interface eth0 UP',
    '[  OK  ] Loading Kali Linux desktop',
  ];
  let p = 0, mi = 0;
  const iv = setInterval(() => {
    p = Math.min(p + Math.random() * 16, 100);
    if (fill) fill.style.width = p + '%';
    if (pct)  pct.textContent  = Math.round(p) + '%';
    if (log && mi < MSGS.length && p > mi * 20) {
      const s = document.createElement('div');
      s.textContent = MSGS[mi++]; log.appendChild(s);
    }
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => { overlay.classList.add('out'); setTimeout(cb, 650); }, 300);
    }
  }, 90);
}

const PINNED = [
  { name:'Pachinko',                       description:'Interactive Pachinko game with canvas animations.',    language:'JavaScript', topics:['javascript','canvas','game'],        html_url:'https://github.com/misteralva/Pachinko',                       homepage:null, stargazers_count:0, forks_count:0, watchers_count:0, size:0, updated_at:null },
  { name:'misteralva.github.io',           description:'Personal portfolio and GitHub Pages site.',           language:'HTML',       topics:['portfolio','html','css'],            html_url:'https://github.com/misteralva/misteralva.github.io',           homepage:'https://misteralva.github.io', stargazers_count:0, forks_count:0, watchers_count:0, size:0, updated_at:null },
  { name:'AlwaysOnTech-Red-Empresarial',   description:'Enterprise network infrastructure design and config.',language:'Cisco IOS',  topics:['networking','cisco','vlan','ospf'],  html_url:'https://github.com/misteralva/AlwaysOnTech-Red-Empresarial',   homepage:null, stargazers_count:0, forks_count:0, watchers_count:0, size:0, updated_at:null },
  { name:'lec-database',                   description:'Backend project with database design and management.',language:'PHP',        topics:['backend','php','sql','database'],    html_url:'https://github.com/misteralva/lec-database',                   homepage:null, stargazers_count:0, forks_count:0, watchers_count:0, size:0, updated_at:null, staticLanguages:{'PHP':7500,'SQL':3200,'HTML':1800} },
];

function mergePinned(apiRepos) {
  const byName = Object.fromEntries(apiRepos.map(r => [r.name.toLowerCase(), r]));
  return PINNED.map(p => byName[p.name.toLowerCase()] || p);
}

async function loadRepos() {
  try {
    const r = await fetch('https://api.github.com/users/misteralva/repos?sort=updated&per_page=20');
    if (!r.ok) throw 0;
    const data = await r.json();
    allRepos = mergePinned(data.filter(r => !r.fork));
    if (!allRepos.length) throw 0;
  } catch { allRepos = PINNED; }
  renderIcons(allRepos);
}

function initAppMenu() {
  
  document.getElementById('kp-launch-term')?.addEventListener('click',  () => openTerminal(selectedIdx));
  document.getElementById('kp-launch-files')?.addEventListener('click', () => {
    if (allRepos.length) openProject(selectedIdx >= 0 ? selectedIdx : 0);
  });

  const btn  = document.getElementById('kp-menu-btn');
  const menu = document.getElementById('kali-appmenu');
  if (!btn || !menu) return;

  
  const KAM_CATEGORIES = {
    'Favorites': [
      { icon:'fa-folder-open',     brand:false, name:'File Manager',      sub:'Thunar',               action:'files' },
      { icon:'fa-terminal',        brand:false, name:'Terminal Emulator',  sub:'xfce4-terminal',       action:'terminal' },
      { icon:'fa-firefox-browser', brand:true,  name:'Web Browser',        sub:'Firefox ESR' },
      { icon:'fa-github',          brand:true,  name:'GitHub',             sub:'misteralva',           url:'https://github.com/misteralva' },
      { icon:'fa-desktop',         brand:false, name:'DA.OS Desktop',      sub:'Back to portfolio',    action:'desktop' },
      { icon:'fa-book',            brand:false, name:'Kali Docs',          sub:'kali.org/docs' },
    ],
    'Recently Used': [
      { icon:'fa-github',          brand:true,  name:'GitHub',             sub:'misteralva',           url:'https://github.com/misteralva' },
      { icon:'fa-folder-open',     brand:false, name:'File Manager',       sub:'Thunar',               action:'files' },
      { icon:'fa-terminal',        brand:false, name:'Terminal Emulator',  sub:'xfce4-terminal',       action:'terminal' },
    ],
    '01 - Reconnaissance': [
      { icon:'fa-magnifying-glass', brand:false, name:'Nmap',              sub:'Network port scanner' },
      { icon:'fa-globe',            brand:false, name:'theHarvester',      sub:'OSINT gathering' },
      { icon:'fa-spider',           brand:false, name:'Maltego',           sub:'Threat intelligence' },
      { icon:'fa-binoculars',       brand:false, name:'Shodan CLI',        sub:'IoT search engine' },
      { icon:'fa-network-wired',    brand:false, name:'Masscan',           sub:'TCP port scanner' },
      { icon:'fa-eye',              brand:false, name:'Recon-ng',          sub:'Web reconnaissance' },
    ],
    '02 - Resource Development': [
      { icon:'fa-github',           brand:true,  name:'GitHub',            sub:'misteralva',           url:'https://github.com/misteralva' },
      { icon:'fa-code',             brand:false, name:'msfvenom',          sub:'Payload generator' },
      { icon:'fa-scroll',           brand:false, name:'Empire',            sub:'Post-exploitation' },
    ],
    '03 - Initial Access': [
      { icon:'fa-crosshairs',       brand:false, name:'Metasploit',        sub:'Exploit framework' },
      { icon:'fa-lock-open',        brand:false, name:'Hydra',             sub:'Brute force logins' },
      { icon:'fa-shield-halved',    brand:false, name:'Burp Suite',        sub:'Web app scanner' },
      { icon:'fa-fish',             brand:false, name:'SET',               sub:'Social Engineering Toolkit' },
    ],
    '04 - Execution': [
      { icon:'fa-terminal',         brand:false, name:'Terminal',          sub:'bash / zsh',           action:'terminal' },
      { icon:'fa-code',             brand:false, name:'Python3',           sub:'Scripting' },
      { icon:'fa-cube',             brand:false, name:'Chisel',            sub:'TCP tunneling' },
    ],
    '05 - Persistence': [
      { icon:'fa-clock',            brand:false, name:'Crontab',           sub:'Scheduled tasks' },
      { icon:'fa-key',              brand:false, name:'SSH Keys',          sub:'Authorized keys' },
      { icon:'fa-plug',             brand:false, name:'Netcat',            sub:'Reverse listener' },
    ],
    '06 - Privilege Escalation': [
      { icon:'fa-arrow-up-right-dots', brand:false, name:'LinPEAS',        sub:'Linux PrivEsc script' },
      { icon:'fa-user-shield',      brand:false, name:'GTFObins',          sub:'Unix binary bypasses' },
      { icon:'fa-shield',           brand:false, name:'sudo -l',           sub:'Sudo misconfiguration' },
    ],
    '07 - Defense Evasion': [
      { icon:'fa-eye-slash',        brand:false, name:'Obfuscator.io',     sub:'Code obfuscation' },
      { icon:'fa-mask',             brand:false, name:'ProxyChains',       sub:'Traffic proxying' },
      { icon:'fa-book',             brand:false, name:'Kali Docs',         sub:'kali.org/docs' },
    ],
    '08 - Credential Access': [
      { icon:'fa-hammer',           brand:false, name:'John the Ripper',   sub:'Password cracker' },
      { icon:'fa-fire',             brand:false, name:'Hashcat',           sub:'GPU hash cracker' },
      { icon:'fa-ghost',            brand:false, name:'Mimikatz',          sub:'Credential dumper' },
      { icon:'fa-database',         brand:false, name:'CrackMapExec',      sub:'AD enumeration' },
    ],
    '09 - Discovery': [
      { icon:'fa-wifi',             brand:false, name:'Wireshark',         sub:'Packet capture' },
      { icon:'fa-network-wired',    brand:false, name:'Netdiscover',       sub:'ARP scanner' },
      { icon:'fa-satellite-dish',   brand:false, name:'arp-scan',          sub:'Layer 2 discovery' },
      { icon:'fa-chart-simple',     brand:false, name:'Nessus',            sub:'Vulnerability scanner' },
    ],
    '10 - Lateral Movement': [
      { icon:'fa-right-left',       brand:false, name:'SSH',               sub:'Secure shell' },
      { icon:'fa-link',             brand:false, name:'ProxyChains',       sub:'Chain SOCKS proxies' },
      { icon:'fa-route',            brand:false, name:'Impacket',          sub:'SMB / WMI toolkit' },
    ],
  };

  let _kamActiveCat = 'Favorites';

  function renderKamApps(catKey, filter) {
    const appsEl = document.getElementById('kam-apps');
    if (!appsEl) return;
    const apps = KAM_CATEGORIES[catKey] || KAM_CATEGORIES['Favorites'];
    const q    = (filter || '').toLowerCase().trim();
    const list = q
      ? apps.filter(a => a.name.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q))
      : apps;

    appsEl.innerHTML = list.map(a => {
      const ic = a.brand ? `fab ${a.icon}` : `fas ${a.icon}`;
      return `<div class="kam-app" data-action="${a.action || ''}" data-url="${a.url || ''}">` +
        `<i class="${ic} kam-app-icon"></i>` +
        `<div><div class="kam-app-name">${a.name}</div><div class="kam-app-sub">${a.sub}</div></div>` +
        `</div>`;
    }).join('');

    appsEl.querySelectorAll('.kam-app').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        const url    = el.dataset.url;
        menu.classList.remove('open');
        btn.classList.remove('open');
        if      (action === 'files')    { if (allRepos.length) openProject(selectedIdx >= 0 ? selectedIdx : 0); }
        else if (action === 'terminal') { openTerminal(selectedIdx); }
        else if (action === 'desktop')  { window.goToDesktop(); }
        else if (url)                   { window.open(url, '_blank'); }
      });
    });
  }

  
  renderKamApps('Favorites');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    if (open) {
      menu.querySelectorAll('.kam-cat').forEach(c => c.classList.remove('active'));
      menu.querySelector('.kam-cat[data-cat="Favorites"]')?.classList.add('active');
      _kamActiveCat = 'Favorites';
      const inp = document.getElementById('kam-input');
      if (inp) inp.value = '';
      renderKamApps('Favorites');
      inp?.focus();
    }
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });

  
  menu.querySelectorAll('.kam-cat[data-cat]').forEach(cat => {
    cat.addEventListener('click', () => {
      menu.querySelectorAll('.kam-cat').forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      _kamActiveCat = cat.dataset.cat;
      const inp = document.getElementById('kam-input');
      if (inp) inp.value = '';
      renderKamApps(_kamActiveCat);
    });
  });

  
  document.getElementById('kam-input')?.addEventListener('input', e => {
    renderKamApps(_kamActiveCat, e.target.value);
  });

}

async function openTerminal(repoIdx) {
  const idx      = repoIdx != null ? repoIdx : selectedIdx;
  const repo     = idx >= 0 ? allRepos[idx] : null;
  const shortDir = repo ? `~/projects/${repo.name}` : '~/projects';
  const fullDir  = repo ? `/home/david/projects/${repo.name}` : '/home/david/projects';
  const repoName = repo ? repo.name : null;

  document.getElementById('da-kterm')?.remove();

  const tw = document.createElement('div');
  tw.id = 'da-kterm';
  tw.style.cssText = [
    'position:fixed','z-index:800','top:48px','left:50%','transform:translateX(-50%)',
    'width:min(860px,calc(100vw - 32px))','height:calc(100vh - 100px)',
    'background:#0c0c0f','border:1px solid rgba(255,255,255,.10)','border-radius:8px',
    'box-shadow:0 32px 90px rgba(0,0,0,.88),0 0 0 1px rgba(255,255,255,.04)',
    'display:flex','flex-direction:column','overflow:hidden',
    'font-family:"JetBrains Mono",monospace','font-size:.72rem','line-height:1.7','color:#e6edf3'
  ].join(';');

  tw.innerHTML = `
    <div id="da-kterm-bar" style="height:28px;flex-shrink:0;background:#161b22;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;padding:0 10px;gap:6px;cursor:move;user-select:none;">
      <span id="da-kterm-close" style="width:12px;height:12px;border-radius:50%;background:#da3633;cursor:pointer;flex-shrink:0;transition:filter .15s;"></span>
      <span style="width:12px;height:12px;border-radius:50%;background:#f0883e;flex-shrink:0;"></span>
      <span style="width:12px;height:12px;border-radius:50%;background:#30a14e;flex-shrink:0;"></span>
      <span style="font-size:.52rem;color:rgba(230,237,243,.28);margin:0 auto;letter-spacing:.06em;">david@kali: ${shortDir}</span>
    </div>
    <div id="da-kterm-body" style="flex:1;min-height:0;overflow-y:auto;padding:12px 16px 4px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent;"></div>
    <div style="flex-shrink:0;padding:4px 16px 12px;border-top:1px solid rgba(255,255,255,.04);">
      <div id="da-ps1-top" style="color:#30a14e;pointer-events:none;line-height:1.55;"></div>
      <div style="display:flex;align-items:center;">
        <span id="da-ps1-bot" style="color:#30a14e;white-space:nowrap;margin-right:3px;"></span>
        <input id="da-kterm-inp" autocomplete="off" spellcheck="false"
          style="flex:1;min-width:0;background:transparent;border:none;outline:none;color:#e6edf3;font-family:'JetBrains Mono',monospace;font-size:.72rem;caret-color:#30a14e;padding:0;">
      </div>
    </div>`;

  const desktop = document.getElementById('kali-desktop');
  if (!desktop) return;
  desktop.appendChild(tw);

  
  function setPs1(dir) {
    const t = tw.querySelector('#da-ps1-top');
    const b = tw.querySelector('#da-ps1-bot');
    if (t) t.innerHTML = `<span style="color:#30a14e;">┌──(</span><span style="color:#e34c26;">david</span><span style="color:#30a14e;">㉿kali)</span><span style="color:#fff;">-</span><span style="color:#367bf0;">[${dir}]</span>`;
    if (b) b.textContent = '└─$ ';
  }
  let curDir = shortDir;
  setPs1(curDir);

  document.getElementById('da-kterm-close').onclick = () => tw.remove();

  
  const bar = document.getElementById('da-kterm-bar');
  let drag = false, ox2 = 0, oy2 = 0;
  bar.addEventListener('mousedown', e => {
    if (e.target.id === 'da-kterm-close') return;
    const r = tw.getBoundingClientRect();
    tw.style.left = r.left + 'px'; tw.style.transform = 'none';
    ox2 = e.clientX - r.left; oy2 = e.clientY - r.top;
    drag = true; document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => { if (!drag) return; tw.style.left=(e.clientX-ox2)+'px'; tw.style.top=(e.clientY-oy2)+'px'; });
  document.addEventListener('mouseup',   () => { drag = false; document.body.style.userSelect = ''; });

  const B   = document.getElementById('da-kterm-body');
  const inp = document.getElementById('da-kterm-inp');
  setTimeout(() => inp.focus(), 50);

  const G = '#30a14e', BL = '#367bf0', DIM = 'rgba(230,237,243,.32)', ERR = '#ff6b6b', SHA = '#f0883e', WARN = '#e8c97e';

  
  function ln(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    B.appendChild(d); B.scrollTop = B.scrollHeight;
  }
  function gap() { const d = document.createElement('div'); d.style.height = '4px'; B.appendChild(d); }
  function cmdEcho(c) {
    const d = document.createElement('div');
    d.style.marginBottom = '2px';
    d.innerHTML =
      `<div><span style="color:#30a14e;">┌──(</span><span style="color:#e34c26;">david</span><span style="color:#30a14e;">㉿kali)</span><span>-</span><span style="color:#367bf0;">[${curDir}]</span></div>` +
      `<div><span style="color:#30a14e;">└─$</span> <span style="color:#e6edf3;">${c}</span></div>`;
    B.appendChild(d); B.scrollTop = B.scrollHeight;
  }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  let commits = [], files = [], cmdHistory = [], histIdx2 = -1;

  
  ln(`<span style="color:${DIM}">Last login: ${new Date().toLocaleString('en-GB')} on pts/0</span>`);
  gap();

  
  if (repo) {
    cmdEcho(`cd ${repo.name}`);
    await wait(50);
    cmdEcho('git log --oneline -5');
    try { const r = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/commits?per_page=5`); if (r.ok) commits = await r.json(); } catch {}
    if (commits.length) {
      commits.forEach(c => ln(`<span style="color:${SHA};font-weight:600;">${c.sha.slice(0,7)}</span> <span style="color:${DIM}">${esc(c.commit.message.split('\n')[0].slice(0,72))}</span>`));
    } else { ln(`<span style="color:${DIM}">(no commits found)</span>`); }
    gap();
    await wait(60);
    cmdEcho('ls -la');
    try { const r = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/contents`); if (r.ok) files = await r.json(); } catch {}
    if (files.length) {
      ln(`<span style="color:${DIM}">total ${files.length * 4 + 8}</span>`);
      files.forEach(f => {
        const d = f.type === 'dir';
        ln(`<span style="color:${DIM}">${d ? 'drwxr-xr-x' : '-rw-r--r--'} 1 david david ${String(f.size||4096).padStart(6)}</span> <span style="color:${d?BL:G};">${f.name}${d?'/':''}</span>`);
      });
    } else {
      ['README.md','index.html','style.css','main.js'].forEach(f => ln(`<span style="color:${DIM}">-rw-r--r-- 1 david david   1024</span> <span style="color:${G};">${f}</span>`));
    }
  } else {
    cmdEcho('ls -la');
    if (allRepos.length) {
      ln(`<span style="color:${DIM}">total ${allRepos.length * 4 + 8}</span>`);
      allRepos.forEach(r => ln(`<span style="color:${DIM}">drwxr-xr-x 1 david david  4096</span> <span style="color:${BL};">${r.name}/</span>`));
    } else {
      ln(`<span style="color:${DIM}">(no projects — double-click a project icon first)</span>`);
    }
  }
  gap();
  ln(`<span style="color:${DIM}">Type <span style="color:#e6edf3;">help</span> for available commands.</span>`);
  gap();

  
  inp.addEventListener('keydown', async e => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) _playKeyClick();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx2 < cmdHistory.length - 1) inp.value = cmdHistory[++histIdx2];
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      inp.value = histIdx2 > 0 ? cmdHistory[--histIdx2] : (histIdx2 = -1, '');
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = inp.value.trim(); if (!v) return;
      const CMDS = ['cat','clear','docker','echo','exit','git','help','history','hostname','id','ifconfig','ls','man','neofetch','nmap','note','ping','ps','pwd','sound','ssh','sudo','traceroute','uname','uptime','whoami'];
      const m = CMDS.find(c => c.startsWith(v));
      if (m) inp.value = m + ' ';
      return;
    }
    if (e.key !== 'Enter') return;

    const raw = inp.value.trim(); inp.value = ''; histIdx2 = -1;
    if (!raw) return;
    cmdHistory.unshift(raw);

    cmdEcho(esc(raw));
    const pts = raw.split(/\s+/);
    const c0  = pts[0].toLowerCase();

    if (c0 === 'clear' || c0 === 'reset') {
      B.innerHTML = '';

    } else if (c0 === 'exit' || c0 === 'quit') {
      ln(`<span style="color:${DIM}">logout</span>`);
      setTimeout(() => tw.remove(), 500);

    } else if (c0 === 'help') {
      gap();
      ln(`<span style="color:#e6edf3;font-weight:600;">Available commands</span>`);
      ln(`<span style="color:${DIM}">─────────────────────────────────────────────</span>`);
      [
        ['ls / ls -la',        'List directory contents'],
        ['cat <file>',          'Print file contents'],
        ['neofetch',            'System info'],
        ['ping <host>',         'Ping a host'],
        ['ssh user@host',       'Connect to remote host'],
        ['uptime',              'System uptime'],
        ['git log',             'Show commit history'],
        ['git status',          'Show repository status'],
        ['git branch',          'List branches'],
        ['pwd',                 'Print working directory'],
        ['whoami',              'Current user'],
        ['id',                  'User and group IDs'],
        ['uname -a',            'System information'],
        ['hostname',            'Machine hostname'],
        ['ifconfig',            'Network interfaces'],
        ['nmap localhost',      'Scan local ports'],
        ['ps aux',              'Running processes'],
        ['sudo !!',             'Escalate privileges'],
        ['history',             'Command history'],
        ['man <cmd>',           'Read the manual page'],
        ['traceroute <host>',   'Trace route to host'],
        ['docker ps',           'List running containers'],
        ['echo <text>',         'Print text'],
        ['clear',               'Clear terminal'],
        ['exit',                'Close terminal'],
      ].forEach(([cmd, desc]) => {
        ln(`  <span style="color:#e6edf3;display:inline-block;min-width:200px;">${cmd}</span><span style="color:${DIM}">${desc}</span>`);
      });
      gap();

    } else if (c0 === 'ls') {
      const la = pts[1] === '-la' || pts[1] === '-al' || pts[1] === '-a' || pts[1] === '-l';
      if (!repo) {
        if (la) {
          if (_ctfStage === 0) _ctfStage = 1;
          ln(`<span style="color:${DIM}">total 64</span>`);
          [
            ['drwxr-xr-x','5 ','david david','4096','Jun  8 12:00','./'            , BL  ],
            ['drwxr-xr-x','14','david david','4096','Jun  8 12:00','../'           , BL  ],
            ['-rw-------','1 ','david david',' 220','Jun  8 12:00','.bash_history' , DIM ],
            ['-rw-r--r--','1 ','david david','3526','Jun  8 12:00','.bashrc'       , DIM ],
            ['-rw-------','1 ','david david','  73','Jun  8 12:00','.mission'      , WARN],
            ['drwxr-xr-x','3 ','david david','4096','Jun  8 12:00','networking/'   , BL  ],
            ['-rw-r--r--','1 ','david david',' 128','Jun  8 12:00','README.md'     , G   ],
            ['drwxr-xr-x','2 ','david david','4096','Jun  8 12:00','scripts/'      , BL  ],
            ['drwxr-xr-x','8 ','david david','4096','Jun  8 12:00','web-projects/' , BL  ],
          ].forEach(([p,n,u,s,d,name,c]) =>
            ln(`<span style="color:${DIM}">${p} ${n} ${u} ${s} ${d}</span> <span style="color:${c}">${name}</span>`)
          );
        } else {
          ln(` <span style="color:${BL}">networking/</span>   <span style="color:${BL}">scripts/</span>   <span style="color:${BL}">web-projects/</span>   <span style="color:${G}">README.md</span>`);
        }
      } else if (files.length) {
        if (la) {
          ln(`<span style="color:${DIM}">total ${files.length * 4 + 8}</span>`);
          [['drwxr-xr-x','2','david david','4096','Jun  8 12:00','./',BL],
           ['drwxr-xr-x','2','david david','4096','Jun  8 12:00','../',BL]].forEach(([p,n,u,s,d,name,c]) =>
            ln(`<span style="color:${DIM}">${p} ${n} ${u} ${s} ${d}</span> <span style="color:${c}">${name}</span>`)
          );
          files.forEach(f => { const d=f.type==='dir'; ln(`<span style="color:${DIM}">${d?'drwxr-xr-x':'-rw-r--r--'} 1 david david ${String(f.size||4096).padStart(6)} Jun  8 12:00</span> <span style="color:${d?BL:G};">${f.name}${d?'/':''}</span>`); });
        } else {
          const chunks = [];
          files.forEach((f,i) => { if(i%4===0) chunks.push([]); chunks[chunks.length-1].push(f); });
          chunks.forEach(row => ln(row.map(f => { const d=f.type==='dir'; return `<span style="color:${d?BL:G};display:inline-block;min-width:180px;">${f.name}${d?'/':''}</span>`; }).join('')));
        }
      } else {
        ln(`<span style="color:${DIM}">(empty directory)</span>`);
      }

    } else if (c0 === 'cat') {
      const fname = pts[1] || 'README.md';
      if (!repo) {
        if (fname === '.mission') {
          if (_ctfStage < 1) { ln(`<span style="color:${ERR}">cat: .mission: No such file or directory</span>`); }
          else if (_ctfStage === 'done') { ln(`<span style="color:${G}">[✓] Already solved. Well done.</span>`); }
          else {
            if (_ctfStage < 2) _ctfStage = 2;
            gap();
            ln(`<span style="color:${DIM}">[CLASSIFIED - TS//SCI]</span>`);
            ln(`<span style="color:${DIM}">[2024-01-15 03:47:19 UTC]</span>`);
            gap();
            ln(`<span style="color:#e6edf3">Ybbx qrrcre, bcrengbe.</span>`);
            ln(`<span style="color:#e6edf3">Gur genvy yrnqf gb /ine/ybt/nhgu.ybt</span>`);
            gap();
            ln(`<span style="color:${DIM}">Unaqyre: QN_0k1997</span>`);
            ln(`<span style="color:${DIM}">[EOF]</span>`);
            gap();
          }
        } else if (fname === '/var/log/auth.log' || fname === 'auth.log') {
          if (_ctfStage < 3) {
            ln(`<span style="color:${ERR}">cat: /var/log/auth.log: Permission denied</span>`);
          } else {
            if (_ctfStage === 3) _ctfStage = 4;
            [
              `Jan 15 03:47:19 kali sshd[2318]: Failed password for invalid user admin from 192.168.1.10 port 44821 ssh2`,
              `Jan 15 03:47:31 kali sshd[2318]: Accepted publickey for david from 10.10.14.1 port 52413 ssh2`,
              `Jan 15 03:47:45 kali sudo[3091]: david : TTY=pts/1 ; PWD=/home/david ; USER=root ; COMMAND=/bin/bash`,
              `Jan 15 03:48:12 kali audit[4096]: CRED_FRAG credential=aW1kYXZpZGFsdmFyZXpAZ21haWwuY29t`,
              `Jan 15 03:48:13 kali audit[4096]: CRED_FRAG crc32=0xdeadbeef status=CAPTURED`,
            ].forEach(l => ln(`<span style="color:${DIM}">${l}</span>`));
          }
        } else if (fname === '.bashrc') {
          ['# ~/.bashrc — david@kali','export PATH="$HOME/.local/bin:$PATH"','alias ll="ls -la"',
           'alias ports="ss -tulnp"','alias myip="curl -s ifconfig.me"','PS1="\\u@\\h:\\w\\$ "',
          ].forEach(l => ln(`<span style="color:${DIM}">${l}</span>`));
        } else if (fname === 'README.md') {
          ['# ~/projects','','Personal project directory.',''  ,
           '- networking/   : lab configs, packet captures',
           '- scripts/      : automation &amp; tooling',
           '- web-projects/ : portfolio &amp; web apps',
          ].forEach(l => ln(`<span style="color:#e6edf3">${l}</span>`));
        } else {
          ln(`<span style="color:${ERR}">cat: ${esc(fname)}: No such file or directory</span>`);
        }
      } else {
        const f = files.find(x => x.name.toLowerCase() === fname.toLowerCase());
        if (f && f.download_url) {
          ln(`<span style="color:${DIM}">Fetching ${esc(fname)}...</span>`);
          try {
            const r = await fetch(f.download_url);
            const txt = await r.text();
            ln(`<pre style="white-space:pre-wrap;word-break:break-word;color:rgba(230,237,243,.75);font-size:.65rem;border-left:2px solid rgba(54,123,240,.35);padding-left:10px;margin-top:4px;max-height:280px;overflow-y:auto;">${esc(txt.slice(0,2000))}${txt.length>2000?'\n…':''}</pre>`);
          } catch { ln(`<span style="color:${ERR}">cat: ${esc(fname)}: Error fetching file</span>`); }
        } else {
          ln(`<span style="color:${ERR}">cat: ${esc(fname)}: No such file or directory</span>`);
        }
      }

    } else if (c0 === 'git') {
      const sub = (pts[1] || '').toLowerCase();
      const repoLabel = repoName || 'portfolio';

      if (sub === 'log' || sub === 'log') {
        if (commits.length) {
          if (raw.includes('--stat')) {
            commits.forEach(c => {
              ln(`<span style="color:${WARN};">commit ${c.sha}</span>`);
              ln(`Author: ${esc(c.commit.author.name)} &lt;${esc(c.commit.author.email)}&gt;`);
              ln(`Date:   ${new Date(c.commit.author.date).toLocaleString('en-GB')}`);
              ln(`<span style="color:#e6edf3;margin-left:4px;">${esc(c.commit.message.split('\n')[0])}</span>`);
              gap();
            });
          } else {
            commits.forEach(c => ln(`<span style="color:${SHA};font-weight:600;">${c.sha.slice(0,7)}</span> <span style="color:${DIM}">${esc(c.commit.message.split('\n')[0].slice(0,72))}</span>`));
          }
        } else { ln(`<span style="color:${DIM};">fatal: your current branch 'main' does not have any commits yet</span>`); }

      } else if (sub === 'status') {
        const rn = repoName || 'this-directory';
        ln(`On branch <span style="color:${G};">main</span>`);
        ln(`Your branch is up to date with '<span style="color:${BL};">origin/main</span>'.`);
        gap();
        if (commits.length) {
          ln(`<span style="color:${G};">nothing to commit, working tree clean</span>`);
        } else {
          ln(`<span style="color:${WARN};">Untracked files:</span>`);
          ln(`  <span style="color:${DIM};">(use "git add &lt;file&gt;..." to include in what will be committed)</span>`);
          gap();
          files.slice(0,4).forEach(f => ln(`\t<span style="color:${ERR};">${f.name}</span>`));
          gap();
          ln(`<span style="color:${DIM};">nothing added to commit but untracked files present</span>`);
        }

      } else if (sub === 'branch') {
        ln(`<span style="color:${G};">* main</span>`);
        ln(`  <span style="color:${DIM};">develop</span>`);
        ln(`  <span style="color:${DIM};">feature/ui-improvements</span>`);

      } else if (sub === 'remote') {
        ln(`<span style="color:${G};">origin</span>\thttps://github.com/misteralva/${repoLabel}.git (fetch)`);
        ln(`<span style="color:${G};">origin</span>\thttps://github.com/misteralva/${repoLabel}.git (push)`);

      } else if (sub === 'diff') {
        ln(`<span style="color:${DIM};"># no changes — working tree clean</span>`);

      } else if (sub === 'stash') {
        ln(`No local changes to save`);

      } else if (sub === 'pull') {
        ln(`Already up to date.`);

      } else if (sub === 'push') {
        ln(`<span style="color:${DIM};">Everything up-to-date</span>`);

      } else if (sub === '') {
        ['usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]',
         '',
         'These are common Git commands:',
         '   log        Show commit logs',
         '   status     Show the working tree status',
         '   branch     List branches',
         '   diff       Show changes',
         '   remote     Manage remote connections',
         '   pull       Fetch and integrate changes',
         '   push       Update remote refs',
        ].forEach(l => ln(`<span style="color:${l.startsWith('   ')?'#e6edf3':DIM};">${l}</span>`));

      } else {
        ln(`<span style="color:${ERR};">git: '${esc(sub)}' is not a git command.</span>`);
        ln(`<span style="color:${DIM};">Did you mean one of: log, status, branch, diff, remote, pull, push?</span>`);
      }

    } else if (c0 === 'pwd')      { ln(fullDir); }
    else if (c0 === 'whoami')     { ln(`<span style="color:${G};">david</span>`); }
    else if (c0 === 'id')         { ln(`uid=1000(<span style="color:${G};">david</span>) gid=1000(<span style="color:${G};">david</span>) groups=1000(david),4(adm),24(cdrom),27(sudo),1001(kali)`); }
    else if (c0 === 'hostname')   { ln(`<span style="color:${BL};">kali</span>`); }
    else if (c0 === 'uname') {
      const ua = navigator.userAgent;
      const arch = /arm|aarch64/i.test(ua) ? 'aarch64' : 'x86_64';
      ln(`Linux kali 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 ${arch} GNU/Linux`);
    } else if (c0 === 'ifconfig') {
      ln(`<span style="color:${G};">eth0</span>: flags=4163&lt;UP,BROADCAST,RUNNING&gt;  mtu 1500`);
      ln(`        inet <span style="color:${WARN};">192.168.1.105</span>  netmask 255.255.255.0  broadcast 192.168.1.255`);
      ln(`        ether a4:c3:f0:7b:2e:91  txqueuelen 1000`); gap();
      ln(`<span style="color:${G};">lo</span>: flags=73&lt;UP,LOOPBACK&gt;  mtu 65536`);
      ln(`        inet <span style="color:${WARN};">127.0.0.1</span>  netmask 255.0.0.0`);
    } else if (c0 === 'nmap') {
      const target = pts[1] || 'localhost';
      ln(`Starting Nmap 7.94 SVN ( https://nmap.org )`);
      ln(`<span style="color:${DIM};">Nmap scan report for ${esc(target)} (127.0.0.1)</span>`);
      ln(`Host is up (0.000082s latency).`); gap();
      ln(`<span style="color:${DIM};">PORT     STATE SERVICE</span>`);
      [['22/tcp','open','ssh'],['80/tcp','open','http'],['443/tcp','open','https'],['3000/tcp','open','node.js']].forEach(([p,s,srv]) =>
        ln(`<span style="color:${G};">${p.padEnd(9)}</span><span style="color:${G};">${s.padEnd(7)}</span>${srv}`)
      );
      gap();
      ln(`<span style="color:${DIM};">Nmap done: 1 IP address (1 host up) scanned in 0.42s</span>`);
    } else if (c0 === 'ps') {
      ln(`<span style="color:${DIM};">  PID TTY      STAT   TIME COMMAND</span>`);
      [['1042','pts/0','Ss','0:00','bash'],['1337','pts/0','S','0:00','ssh-agent'],['2048','pts/0','S','0:03','node portfolio.js'],['4096','pts/0','R+','0:00','ps aux']].forEach(([p,t,s,tm,cm]) =>
        ln(`<span style="color:${WARN};">${p.padStart(5)}</span> ${t.padEnd(8)} ${s.padEnd(6)} ${tm.padEnd(6)} ${cm}`)
      );
    } else if (c0 === 'history') {
      cmdHistory.slice().reverse().forEach((h, i) => ln(`  <span style="color:${DIM};">${String(i+1).padStart(3)}</span>  ${esc(h)}`));
    } else if (c0 === 'neofetch') {
      const ART = [
        "       _,met$$$$$gg.     ","    ,g$$$$$$$$$$$$$$$P.  ",
        "  ,g$$P\"     \"\"\"Y$$.\".",
        " ,$$P'              `$$$.","',$$P       ,ggs.     `$$b:",
        "`d$$'     ,$P\"'   .    $$$"," $$P      d$'     ,    $$P",
        " $$:      $$.   -    ,d$$'"," $$\\;      Y$b._   _,d$P' ",
        " Y$$.    `.`\"Y$$$$P\"'     "," `$$b      \"-.__          ",
        "  `Y$$                    ","   `Y$$.                  ",
        "     `$$b.                ","       `Y$$b.             ",
        "          `\"Y$b._         ","              `\"\"\"        ",
      ];
      const cores  = navigator.hardwareConcurrency || 4;
      const memGB  = navigator.deviceMemory || 8;
      const memMiB = memGB * 1024;
      const used   = Math.floor(900 + Math.random() * 600);
      const res    = `${screen.width}x${screen.height}`;
      const days_  = Math.floor((Date.now() - new Date('2025-04-15')) / 86400000);
      const G2 = '#30a14e', B2 = '#367bf0';
      const INFO = [
        `<b style="color:${G2}">david</b><span style="color:#e6edf3">@</span><b style="color:${G2}">kali</b>`,
        `<span style="color:#e6edf3">${'─'.repeat(17)}</span>`,
        `<span style="color:${G2}">OS</span>: DA.OS — Kali Linux 2024.3 x86_64`,
        `<span style="color:${G2}">Kernel</span>: 6.6.9-amd64`,
        `<span style="color:${G2}">Uptime</span>: ${days_} days`,
        `<span style="color:${G2}">Shell</span>: bash 5.2.15`,
        `<span style="color:${G2}">Resolution</span>: ${res}`,
        `<span style="color:${G2}">DE</span>: XFCE`,
        `<span style="color:${G2}">WM</span>: xfwm4`,
        `<span style="color:${G2}">Terminal</span>: xfce4-terminal`,
        `<span style="color:${G2}">CPU</span>: Intel Core i5 (${cores}) @ 4.200GHz`,
        `<span style="color:${G2}">Memory</span>: ${used} MiB / ${memMiB} MiB`,
        '',
        `<span style="background:#09090f;color:#09090f">███</span><span style="background:#e34c26;color:#e34c26">███</span><span style="background:#30a14e;color:#30a14e">███</span><span style="background:#367bf0;color:#367bf0">███</span><span style="background:#e8c97e;color:#e8c97e">███</span><span style="background:#ff6b6b;color:#ff6b6b">███</span><span style="background:#e6edf3;color:#e6edf3">███</span>`,
      ];
      gap();
      const rows = Math.max(ART.length, INFO.length);
      let html = '<pre style="margin:0;line-height:1.45;font-family:\'JetBrains Mono\',monospace;">';
      for (let i = 0; i < rows; i++) {
        const a = (ART[i] || '').padEnd(30).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        html += `<span style="color:${B2}">${a}</span>  ${INFO[i] || ''}\n`;
      }
      html += '</pre>';
      ln(html);
      gap();
    } else if (c0 === 'ssh') {
      const target = pts[1] || 'localhost';
      const [sshUser, sshHost] = target.includes('@') ? target.split('@') : ['david', target];
      const refused = ['github.com','google.com','cloudflare.com','kali.org','youtube.com'];
      await wait(500);
      if (refused.includes(sshHost)) {
        ln(`ssh: connect to host ${sshHost} port 22: Connection refused`);
      } else if (sshHost === 'localhost' || sshHost === '127.0.0.1') {
        ln(`${sshUser}@localhost: Permission denied (publickey).`);
      } else {
        const fp = btoa(sshHost + '2024').replace(/[^a-zA-Z0-9]/g,'').slice(0,43);
        ln(`The authenticity of host '${sshHost}' can't be established.`);
        ln(`ED25519 key fingerprint is SHA256:${fp}.`);
        ln(`Are you sure you want to continue connecting (yes/no/[fingerprint])? <span style="color:#e6edf3">yes</span>`);
        await wait(350);
        ln(`Warning: Permanently added '${sshHost}' (ED25519) to the list of known hosts.`);
        await wait(600);
        ln(`${sshUser}@${sshHost}'s password:`);
        await wait(1800);
        ln(`<span style="color:${ERR}">Permission denied, please try again.</span>`);
        await wait(900);
        ln(`${sshUser}@${sshHost}'s password:`);
        await wait(1800);
        ln(`<span style="color:${ERR}">Permission denied (publickey,password).</span>`);
      }
    } else if (c0 === 'uptime') {
      const launched = new Date('2025-04-15');
      const now2 = new Date();
      const days2 = Math.floor((now2 - launched) / 86400000);
      const h2 = now2.getHours(), m2 = now2.getMinutes(), s2 = now2.getSeconds();
      const t2 = `${String(h2).padStart(2,'0')}:${String(m2).padStart(2,'0')}:${String(s2).padStart(2,'0')}`;
      const la1 = (0.1 + Math.random() * 0.5).toFixed(2);
      const la2 = (0.05 + Math.random() * 0.4).toFixed(2);
      const la3 = (0.03 + Math.random() * 0.3).toFixed(2);
      ln(` ${t2} up ${days2} days, 1 user,  load average: ${la1}, ${la2}, ${la3}`);
    } else if (c0 === 'ping') {
      const host = pts[1] || 'localhost';
      const IP = {'google.com':'142.250.185.46','8.8.8.8':'8.8.8.8','1.1.1.1':'1.1.1.1','cloudflare.com':'104.16.132.229','github.com':'140.82.121.4','hackthebox.com':'185.70.40.10','kali.org':'192.99.200.39','localhost':'127.0.0.1','127.0.0.1':'127.0.0.1','10.10.14.1':'10.10.14.1'};
      const ip = IP[host.toLowerCase()] || `${[1,2,3,4].map(()=>Math.floor(Math.random()*220+10)).join('.')}`;
      const isLocal = ip.startsWith('127.');
      const base = isLocal ? 0.05 : 8 + Math.random() * 18;
      const ttl  = isLocal ? 64 : 55;
      ln(`PING ${host} (${ip}) 56(84) bytes of data.`);
      for (let i = 1; i <= 4; i++) {
        await wait(isLocal ? 40 : 220);
        const ms = (base + Math.random() * base * 0.25).toFixed(3);
        ln(`<span style="color:#e6edf3;">64 bytes from ${ip}: icmp_seq=${i} ttl=${ttl} time=${ms} ms</span>`);
      }
      gap();
      await wait(80);
      ln(`--- ${host} ping statistics ---`);
      ln(`4 packets transmitted, 4 received, 0% packet loss, time 3003ms`);
      ln(`<span style="color:${DIM};">rtt min/avg/max/mdev = ${base.toFixed(3)}/${(base*1.12).toFixed(3)}/${(base*1.35).toFixed(3)}/0.234 ms</span>`);
    } else if (c0 === 'echo') {
      const hasRotTr  = (raw.includes('| tr') || raw.includes('|tr')) && (raw.includes('N-ZA') || raw.includes('rot13'));
      const hasBase64 = raw.includes('base64') && raw.includes('-d');
      if (hasRotTr && _ctfStage === 2) {
        _ctfStage = 3;
        gap();
        ln(`<span style="color:#e6edf3">Look deeper, operator.</span>`);
        ln(`<span style="color:#e6edf3">The trail leads to /var/log/auth.log</span>`);
        gap();
        ln(`<span style="color:${DIM}">Handler: DA_0x1997</span>`);
        gap();
      } else if (hasBase64 && _ctfStage === 4) {
        _ctfStage = 'done';
        ln(`<span style="color:#e6edf3">imdavidalvarez@gmail.com</span>`);
        gap();
        ln(`<span style="color:${G}">┌──────────────────────────────────────────────┐</span>`);
        ln(`<span style="color:${G}">│                                              │</span>`);
        ln(`<span style="color:${G}">│  [✓]  Operator identity confirmed.           │</span>`);
        ln(`<span style="color:${G}">│  [✓]  Challenge complete.                    │</span>`);
        ln(`<span style="color:${G}">│                                              │</span>`);
        ln(`<span style="color:#e6edf3">│  You found the Easter egg. Nice work.        │</span>`);
        ln(`<span style="color:${DIM}">│  imdavidalvarez@gmail.com                    │</span>`);
        ln(`<span style="color:${G}">│                                              │</span>`);
        ln(`<span style="color:${G}">└──────────────────────────────────────────────┘</span>`);
        gap();
      } else if (hasBase64 && _ctfStage !== 4 && _ctfStage !== 'done') {
        ln(`<span style="color:${ERR}">base64: invalid input</span>`);
      } else {
        ln(esc(pts.slice(1).join(' ')));
      }
    } else if (c0 === 'man') {
      const mcmd = pts[1];
      if (!mcmd) { ln(`<span style="color:${ERR};">What manual page do you want?</span>`); }
      else {
        const mh = _manPage(mcmd, G, DIM);
        if (mh) ln(mh);
        else ln(`<span style="color:${ERR};">No manual entry for ${esc(mcmd)}</span>`);
      }
    } else if (c0 === 'traceroute') {
      await _runTraceroute(pts[1] || 'localhost', ln, G, DIM, WARN);
    } else if (c0 === 'docker') {
      _runDocker(raw, ln, G, DIM, BL, SHA, WARN, ERR);
    } else if (c0 === 'note') {
      const sub = pts[1];
      if (!sub || sub === 'help') {
        ln(`<span style="color:${G};">note</span> — sticky notes on the Kali desktop`);
        ln(`  <span style="color:${G};">note add</span> <span style="color:${DIM}">"text"</span>    create a sticky note`);
        ln(`  <span style="color:${G};">note ls</span>             list all notes`);
        ln(`  <span style="color:${G};">note rm</span> <span style="color:${DIM}">&lt;id&gt;</span>      remove by id`);
        ln(`  <span style="color:${G};">note clear</span>          remove all notes`);
      } else if (sub === 'add') {
        const text = pts.slice(2).join(' ').replace(/^["']|["']$/g,'');
        if (!text) { ln(`<span style="color:${ERR};">note add: missing text</span>`); }
        else {
          const id = _noteManager.add(text);
          ln(`<span style="color:${G};">✓</span> Created <span style="color:#e6edf3;">note#${id}</span> on desktop`);
        }
      } else if (sub === 'ls') {
        const notes = _noteManager.list();
        if (!notes.length) { ln(`<span style="color:${DIM};">no sticky notes</span>`); }
        else {
          ln(`<span style="color:${G};"> ID   TEXT</span>`);
          ln(`<span style="color:${DIM};">───  ───────────────────────────────────</span>`);
          notes.forEach(n => {
            const preview = n.text.length > 38 ? n.text.slice(0,38)+'…' : n.text;
            ln(`<span style="color:#e6edf3;">${String(n.id).padStart(3)}</span>  ${esc(preview)}`);
          });
        }
      } else if (sub === 'rm') {
        const id = parseInt(pts[2]);
        if (isNaN(id)) { ln(`<span style="color:${ERR};">note rm: missing id — usage: note rm &lt;id&gt;</span>`); }
        else { _noteManager.rm(id); ln(`<span style="color:${G};">✓</span> Removed note#${id}`); }
      } else if (sub === 'clear') {
        _noteManager.clear();
        ln(`<span style="color:${G};">✓</span> All notes cleared`);
      } else {
        ln(`<span style="color:${ERR};">note: unknown subcommand '${esc(sub)}'</span>`);
        ln(`<span style="color:${DIM};">Usage: note [add|ls|rm|clear|help]</span>`);
      }
    } else if (c0 === 'sound') {
      const arg = pts[1];
      if (arg === 'on') {
        _soundEnabled = true; localStorage.setItem('da-kterm-sound','1');
        ln(`<span style="color:${G};">✓</span> Keyboard sound <span style="color:#e6edf3;">enabled</span>`);
      } else if (arg === 'off') {
        _soundEnabled = false; localStorage.setItem('da-kterm-sound','0');
        ln(`<span style="color:${G};">✓</span> Keyboard sound <span style="color:${DIM};">disabled</span>`);
      } else {
        ln(`sound: <span style="color:#e6edf3;">${_soundEnabled ? 'on' : 'off'}</span>`);
        ln(`<span style="color:${DIM};">Usage: sound [on|off]</span>`);
      }
    } else if (c0 === 'sudo') {
      ln(`[sudo] password for david: `);
      ln(`<span style="color:${ERR};">Sorry, try again.</span>`);
      ln(`<span style="color:${DIM};">sudo: 3 incorrect password attempts</span>`);
    } else {
      ln(`<span style="color:${ERR};">bash: ${esc(c0)}: command not found</span>`);
      ln(`<span style="color:${DIM};">Try <span style="color:#e6edf3;">help</span> for available commands.</span>`);
    }

    gap();
    B.scrollTop = B.scrollHeight;
    setPs1(curDir);
  });
}
function initControls() {
  document.getElementById('kfiles-close')?.addEventListener('click', closeFilesWin);
  document.getElementById('khb-back')?.addEventListener('click', goBack);
  document.getElementById('khb-fwd')?.addEventListener('click', goForward);

  
  document.querySelectorAll('.kp-tray[title="Power"]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => window.goToDesktop());
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeFilesWin();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const next = Math.min(selectedIdx + 1, allRepos.length - 1);
      if (next !== selectedIdx) openProject(next);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const prev = Math.max(selectedIdx - 1, 0);
      if (prev !== selectedIdx) openProject(prev);
    }
  });
  document.getElementById('kali-desktop')?.addEventListener('click', e => {
    const win = document.getElementById('kali-files');
    if (win.classList.contains('open') &&
        !win.contains(e.target) &&
        !e.target.closest('.kali-icon')) {
      closeFilesWin();
    }
  });
}

function setPanelTitle(t) {
  const wt = document.getElementById('kp-wintitle');
  if (wt) wt.textContent = t;
}

let _toastTimer = null;
function showKaliToast(icon, title, msg) {
  const el    = document.getElementById('kali-toast');
  const ic    = document.getElementById('kali-toast-icon');
  const tEl   = document.getElementById('kali-toast-title');
  const mEl   = document.getElementById('kali-toast-msg');
  if (!el) return;
  if (ic)  ic.className  = icon;
  if (tEl) tEl.textContent = title + '  ';
  if (mEl) mEl.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function showAboutKali() {
  const panel = document.getElementById('kali-about');
  const box   = document.getElementById('kali-about-box');
  if (!panel || !box) return;
  const ua    = navigator.userAgent;
  const cores = navigator.hardwareConcurrency || '?';
  const mem   = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : '?';
  const conn  = navigator.connection;
  const net   = conn?.effectiveType || 'unknown';
  box.innerHTML =
    `<span style="color:#e34c26;font-weight:700;">       .;;,           </span><span style="color:#e6edf3;">david</span><span style="color:rgba(230,237,243,.4)">@</span><span style="color:#367bf0;">kali</span>\n` +
    `<span style="color:#e34c26;font-weight:700;">    .;MMMM;.          </span><span style="color:rgba(230,237,243,.35)">──────────────────────</span>\n` +
    `<span style="color:#e34c26;font-weight:700;">  .MMMMMMMM;          </span><span style="color:#367bf0;">OS</span>:      Kali Linux Rolling (Portfolio)\n` +
    `<span style="color:#e34c26;font-weight:700;"> ;MMMMMMMMM;          </span><span style="color:#367bf0;">Host</span>:    DAVID-OS v2026\n` +
    `<span style="color:#e34c26;font-weight:700;">  'MMMMMMM;           </span><span style="color:#367bf0;">Kernel</span>:  6.1.0-kali9-amd64\n` +
    `<span style="color:#e34c26;font-weight:700;">    'MMM;             </span><span style="color:#367bf0;">CPU</span>:     ${cores} cores  (real)\n` +
    `<span style="color:#e34c26;font-weight:700;">      ';              </span><span style="color:#367bf0;">RAM</span>:     ${mem}  (real)\n` +
    `<span style="color:#e34c26;font-weight:700;">                      </span><span style="color:#367bf0;">Network</span>: ${net}  (real)\n` +
    `<span style="color:#e34c26;font-weight:700;">                      </span><span style="color:#367bf0;">Shell</span>:   bash 5.2.15\n` +
    `<span style="color:#e34c26;font-weight:700;">                      </span><span style="color:#367bf0;">DE</span>:      XFCE 4.18\n` +
    `<span style="color:#e34c26;font-weight:700;">                      </span><span style="color:#367bf0;">Theme</span>:   Kali-Dark\n` +
    `\n<span style="color:rgba(230,237,243,.35)">  Click anywhere to close</span>`;
  panel.classList.add('show');
  panel.addEventListener('click', () => panel.classList.remove('show'), { once: true });
}

let _ctxIconIdx = -1;

function _placeMenu(menu, x, y) {
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.classList.add('open');
  menu.setAttribute('aria-hidden', 'false');
  const r = menu.getBoundingClientRect();
  if (r.right  > window.innerWidth)  menu.style.left = (x - r.width)  + 'px';
  if (r.bottom > window.innerHeight) menu.style.top  = (y - r.height) + 'px';
}

function hideCtxMenu() {
  ['kali-ctxmenu','kali-icon-ctxmenu'].forEach(id => {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); }
  });
}

function initContextMenu() {
  const desktop = document.getElementById('kali-desktop');
  if (!desktop) return;

  desktop.addEventListener('contextmenu', e => {
    if (e.target.closest('.kali-win, #kali-panel, #kali-appmenu, #kali-about')) return;
    e.preventDefault();
    hideCtxMenu();
    const icon = e.target.closest('.kali-icon');
    if (icon) {
      _ctxIconIdx = [...document.querySelectorAll('.kali-icon')].indexOf(icon);
      _placeMenu(document.getElementById('kali-icon-ctxmenu'), e.clientX, e.clientY);
    } else {
      _placeMenu(document.getElementById('kali-ctxmenu'), e.clientX, e.clientY);
    }
  });

  document.addEventListener('click',   e => { if (!e.target.closest('#kali-ctxmenu,#kali-icon-ctxmenu')) hideCtxMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideCtxMenu(); });

  
  document.getElementById('kcm-term')?.addEventListener('click', () => {
    hideCtxMenu(); openTerminal(selectedIdx);
  });
  document.getElementById('kcm-refresh')?.addEventListener('click', () => {
    hideCtxMenu();
    const container = document.getElementById('kali-icons');
    if (container) { container.style.opacity = '0.3'; container.style.transition = 'opacity .2s'; }
    setTimeout(() => { loadRepos(); if (container) { container.style.opacity = ''; } }, 400);
    showKaliToast('fas fa-rotate-right', 'Refreshing…', 'Fetching latest repositories');
  });
  document.getElementById('kcm-arrange')?.addEventListener('click', () => {
    hideCtxMenu(); arrangeIcons();
  });
  document.getElementById('kcm-newfolder')?.addEventListener('click', () => {
    hideCtxMenu();
    showKaliToast('fas fa-lock', 'Permission denied', "mkdir: cannot create directory: Read-only filesystem");
  });
  document.getElementById('kcm-about')?.addEventListener('click', () => {
    hideCtxMenu(); showAboutKali();
  });

  
  document.getElementById('kicm-open')?.addEventListener('click', () => {
    hideCtxMenu();
    if (_ctxIconIdx >= 0) openProject(_ctxIconIdx);
  });
  document.getElementById('kicm-term')?.addEventListener('click', () => {
    hideCtxMenu(); openTerminal(_ctxIconIdx);
  });
  document.getElementById('kicm-copy-ssh')?.addEventListener('click', () => {
    hideCtxMenu();
    const repo = allRepos[_ctxIconIdx];
    if (!repo) return;
    const url = `git@github.com:misteralva/${repo.name}.git`;
    navigator.clipboard?.writeText(url).catch(() => {});
    showKaliToast('fas fa-code-branch', 'Copied!', url);
  });
  document.getElementById('kicm-github')?.addEventListener('click', () => {
    hideCtxMenu();
    const repo = allRepos[_ctxIconIdx];
    if (repo) window.open(repo.html_url, '_blank');
  });
  document.getElementById('kicm-delete')?.addEventListener('click', () => {
    hideCtxMenu();
    showKaliToast('fas fa-lock', 'Permission denied', "rm: cannot remove: Operation not permitted");
  });
}

let _sfxAC = null;
let _soundEnabled = localStorage.getItem('da-kterm-sound') === '1';

function _playKeyClick() {
  if (!_soundEnabled) return;
  try {
    if (!_sfxAC) _sfxAC = new (window.AudioContext || window.webkitAudioContext)();
    const ac  = _sfxAC;
    if (ac.state === 'suspended') ac.resume();
    const dur = 0.042;
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.09));
    }
    const src  = ac.createBufferSource(); src.buffer = buf;
    const filt = ac.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 1300; filt.Q.value = 0.7;
    const gain = ac.createGain(); gain.gain.value = 0.055;
    src.connect(filt); filt.connect(gain); gain.connect(ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  } catch {}
}

const _noteManager = (() => {
  const STORE = 'da-sticky-notes';
  let _notes = [];
  let _nextId = 1;

  function _save() { localStorage.setItem(STORE, JSON.stringify(_notes)); }

  function _load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || '[]');
      _notes = Array.isArray(d) ? d : [];
      _nextId = _notes.length ? Math.max(..._notes.map(n => n.id)) + 1 : 1;
    } catch { _notes = []; _nextId = 1; }
  }

  function _desktop() { return document.getElementById('kali-desktop'); }

  function _escHtml(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _makeDom(note) {
    const el = document.createElement('div');
    el.className = 'da-sticky';
    el.id = 'sticky-' + note.id;
    el.style.left = note.x + 'px';
    el.style.top  = note.y + 'px';
    el.innerHTML =
      `<div class="da-sticky-head">` +
        `<span class="da-sticky-id">note#${note.id}</span>` +
        `<button class="da-sticky-close" title="note rm ${note.id}">[x]</button>` +
      `</div>` +
      `<div class="da-sticky-body">${_escHtml(note.text)}</div>`;

    el.querySelector('.da-sticky-close').addEventListener('click', () => _rm(note.id));

    const head = el.querySelector('.da-sticky-head');
    let dx = 0, dy = 0;
    head.addEventListener('mousedown', e => {
      if (e.target.classList.contains('da-sticky-close')) return;
      e.preventDefault();
      dx = e.clientX - el.offsetLeft;
      dy = e.clientY - el.offsetTop;
      const onMove = e2 => { el.style.left=(e2.clientX-dx)+'px'; el.style.top=(e2.clientY-dy)+'px'; };
      const onUp   = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        const n = _notes.find(n => n.id === note.id);
        if (n) { n.x = parseInt(el.style.left); n.y = parseInt(el.style.top); _save(); }
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    return el;
  }

  function _rm(id) {
    const el = document.getElementById('sticky-' + id);
    if (el) el.remove();
    _notes = _notes.filter(n => n.id !== id);
    _save();
  }

  return {
    init() {
      _load();
      const desk = _desktop();
      if (!desk) return;
      _notes.forEach(note => desk.appendChild(_makeDom(note)));
    },
    add(text) {
      const id = _nextId++;
      const x = Math.floor(80  + Math.random() * (window.innerWidth  - 320));
      const y = Math.floor(60  + Math.random() * (window.innerHeight - 220));
      const note = { id, text, x, y };
      _notes.push(note);
      _save();
      const desk = _desktop();
      if (desk) desk.appendChild(_makeDom(note));
      return id;
    },
    list() { return [..._notes]; },
    rm(id)  { _rm(id); },
    clear() {
      _notes.forEach(n => { const el = document.getElementById('sticky-' + n.id); if (el) el.remove(); });
      _notes = [];
      _save();
    }
  };
})();

const _MAN = {
  cat:     {s:1,d:'concatenate files and print on the standard output',syn:'cat [OPTION]... [FILE]...',opts:['-n, --number    number all output lines','-v             use ^ and M- notation, except for LFD and TAB'],auth:'Torbjorn Granlund and Richard M. Stallman'},
  echo:    {s:1,d:'display a line of text',syn:'echo [OPTION]... [STRING]...',opts:['-n   do not output the trailing newline','-e   enable interpretation of backslash escapes'],auth:'Brian Fox and Chet Ramey'},
  git:     {s:1,d:'the stupid content tracker',syn:'git [--version] [--help] [-C <path>] <command> [<args>]',opts:['log     show commit logs','status  show the working tree status','branch  list, create, or delete branches','diff    show changes between commits','remote  manage set of tracked repositories'],auth:'Linus Torvalds'},
  grep:    {s:1,d:'print lines that match patterns',syn:'grep [OPTION]... PATTERNS [FILE]...',opts:['-i, --ignore-case    ignore case distinctions','-r, --recursive      read all files under each directory recursively','-n, --line-number    print line number with output lines','-v, --invert-match   select non-matching lines'],auth:'Mike Haertel and others'},
  history: {s:3,d:'GNU History Library',syn:'history [n]\nhistory -c',opts:['n    show only the last n entries','-c   clear the history list'],auth:'Brian Fox and Chet Ramey'},
  hostname:{s:1,d:'show or set the system hostname',syn:'hostname [-I|-i] [-f] [-d]',opts:['-I   display all network addresses of the host','-f   display the FQDN (Fully Qualified Domain Name)','-d   display the DNS domain name'],auth:'Peter Tobias'},
  id:      {s:1,d:'print real and effective user and group IDs',syn:'id [OPTION]... [USER]...',opts:['-u, --user    print only the effective user ID','-g, --group   print only the effective group ID','-G, --groups  print all group IDs'],auth:'Arnold Robbins and David MacKenzie'},
  ifconfig:{s:8,d:'configure a network interface',syn:'ifconfig [interface] [options | [address]]',opts:['up       activate the interface','down     deactivate the interface','inet X   assign IP address X to the interface'],auth:'Fred N. van Kempen'},
  ls:      {s:1,d:'list directory contents',syn:'ls [OPTION]... [FILE]...',opts:['-a, --all    do not ignore entries starting with .','-l           use a long listing format','--color      colorize the output'],auth:'Richard M. Stallman and David MacKenzie'},
  man:     {s:1,d:'an interface to the system reference manuals',syn:'man [SECTION] PAGE...',opts:['-k keyword   search the short descriptions and manual page names','-a           find all matching manual pages and display each in succession','-w           print the location of the manual pages that would be displayed'],auth:'John W. Eaton, Zeyd M. Ben-Halim and others'},
  neofetch:{s:1,d:'A fast, highly customizable system info script',syn:'neofetch [--option "value"]...',opts:['--off              hide the ASCII art logo','--ascii_distro X   use the ASCII art of distro X'],auth:'Dylan Araps'},
  nmap:    {s:1,d:'Network exploration tool and security / port scanner',syn:'nmap [Scan Type] [Options] {target specification}',opts:['-sV    probe open ports to determine service/version info','-sC    scan with default scripts','-p     only scan specified ports','-A     aggressive scan (OS + version + scripts + traceroute)','-O     enable OS detection'],auth:'Gordon "Fyodor" Lyon'},
  ping:    {s:8,d:'send ICMP ECHO_REQUEST to network hosts',syn:'ping [OPTIONS] destination',opts:['-c count      stop after sending count ECHO_REQUEST packets','-i interval   wait interval seconds between sending each packet','-t ttl        define IP time to live','-W timeout    time to wait for a response, in seconds'],auth:'Mike Muuss'},
  ps:      {s:1,d:'report a snapshot of the current processes',syn:'ps [options]',opts:['a    show processes for all users','u    display user-oriented format','x    show processes not attached to a terminal'],auth:'Michael K. Johnson'},
  pwd:     {s:1,d:'print name of current/working directory',syn:'pwd [OPTION]...',opts:['-L   use PWD from environment, even if it contains symlinks','-P   avoid all symlinks'],auth:'Jim Meyering'},
  ssh:     {s:1,d:'OpenSSH remote login client',syn:'ssh [-l login_name] [-p port] [user@]hostname [command]',opts:['-p port   port to connect to on the remote host','-i file   selects the identity (private key) file','-v        verbose mode; multiple -v options increase the verbosity'],auth:'OpenBSD project'},
  sudo:    {s:8,d:'execute a command as another user',syn:'sudo [-AbEHnPS] [-u user] [VAR=value] command',opts:['-l   list the allowed (and forbidden) commands','-s   run shell as the target user','-u   run command as specified user (default: root)','-i   run login shell as the target user'],auth:'Todd C. Miller'},
  uname:   {s:1,d:'print system information',syn:'uname [OPTION]...',opts:['-a, --all            print all information','-s, --kernel-name    print the kernel name','-r, --kernel-release print the kernel release','-m, --machine        print the machine hardware name'],auth:'David MacKenzie'},
  uptime:  {s:1,d:'tell how long the system has been running',syn:'uptime [options]',opts:['Displays current time, how long the system has been running,','how many users are currently logged on, and the load averages.'],auth:'Larry Greenfield'},
  whoami:  {s:1,d:'print effective userid',syn:'whoami [OPTION]...',opts:['Print the user name associated with the current effective user ID.'],auth:'Richard Mlynarik and David MacKenzie'},
  note:    {s:1,d:'create and manage sticky notes on the Kali desktop',syn:'note [add|ls|rm|clear] [args]',opts:['add "text"   create a new sticky note','ls           list all notes','rm <id>      remove note by id','clear        remove all notes'],auth:'DA.OS Project'},
  sound:   {s:1,d:'toggle mechanical keyboard sound in the terminal',syn:'sound [on|off]',opts:['on    enable keyboard click sound','off   disable keyboard click sound','(no arg)   show current status'],auth:'DA.OS Project'},
};
function _manPage(cmd, G, DIM) {
  const p = _MAN[cmd.toLowerCase()];
  if (!p) return null;
  const C = cmd.toUpperCase(), sec = `(${p.s})`;
  const xe = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const hdr = `${C}${sec}                    User Commands                    ${C}${sec}`;
  const ftr = `Kali Linux                       Jun 2024                    ${C}${sec}`;
  let h = `<pre style="margin:2px 0;line-height:1.6;font-size:.72rem;font-family:'JetBrains Mono',monospace;border-left:2px solid rgba(48,161,78,.25);padding-left:10px;">`;
  h += `<span style="color:${DIM}">${xe(hdr)}</span>\n\n`;
  h += `<span style="color:${G};font-weight:600">NAME</span>\n       <span style="color:#e6edf3">${cmd} - ${xe(p.d)}</span>\n\n`;
  h += `<span style="color:${G};font-weight:600">SYNOPSIS</span>\n`;
  p.syn.split('\n').forEach(l => { h += `       <span style="color:#e6edf3">${xe(l)}</span>\n`; });
  h += `\n<span style="color:${G};font-weight:600">DESCRIPTION</span>\n`;
  p.opts.forEach(l => { h += `       <span style="color:#e6edf3">${xe(l)}</span>\n`; });
  h += `\n<span style="color:${G};font-weight:600">AUTHOR</span>\n       <span style="color:#e6edf3">Written by ${xe(p.auth)}.</span>\n\n`;
  h += `<span style="color:${DIM}">${xe(ftr)}</span></pre>`;
  return h;
}

async function _runTraceroute(host, ln, G, DIM, WARN) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const e2 = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const IP = {'google.com':'142.250.185.46','8.8.8.8':'8.8.8.8','1.1.1.1':'1.1.1.1','cloudflare.com':'104.16.132.229','github.com':'140.82.121.4','hackthebox.com':'185.70.40.10','kali.org':'192.99.200.39','localhost':'127.0.0.1','127.0.0.1':'127.0.0.1'};
  const destIP = IP[host.toLowerCase()] || `${[1,2,3,4].map(()=>Math.floor(Math.random()*220+10)).join('.')}`;
  const isLocal = destIP === '127.0.0.1';
  const NHOPS = isLocal ? 1 : (8 + Math.floor(Math.random()*4));
  const rip = () => ['10','172','62','81','195'][Math.floor(Math.random()*5)] + `.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
  const hops = isLocal ? [{ip:'127.0.0.1',name:'localhost'}] : [
    {ip:'192.168.1.1',name:'_gateway'},
    {ip:'10.50.0.1',  name:null},
    ...Array.from({length:NHOPS-3}, () => ({ip:rip(),name:null})),
    {ip:destIP, name:host},
  ];
  ln(`traceroute to ${e2(host)} (${destIP}), 30 hops max, 60 byte packets`);
  let lat = isLocal ? 0.03 : 0.4;
  for (let i = 0; i < hops.length; i++) {
    await wait(isLocal ? 30 : (i < 2 ? 100 : 200));
    const h = hops[i];
    const ms = () => (lat + Math.random()*lat*0.6).toFixed(3);
    const label = h.name ? `${h.name} (${h.ip})` : h.ip;
    const col = i === hops.length-1 ? G : (i < 2 ? WARN : 'rgba(230,237,243,.7)');
    ln(`<span style="color:${DIM}">${String(i+1).padStart(2)}</span>  <span style="color:${col};display:inline-block;min-width:310px">${label}</span>  <span style="color:${DIM}">${ms()} ms  ${ms()} ms  ${ms()} ms</span>`);
    lat += 2 + Math.random()*3;
  }
}

function _runDocker(raw, ln, G, DIM, BL, SHA, WARN, ERR) {
  const e2 = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const pts = raw.split(/\s+/);
  const sub = (pts[1] || '').toLowerCase();
  const CTRS = [
    {id:'a8f3b2c1d4e5',img:'portfolio-web:1.0',cmd:'"node server.js"',       cr:'2 hours ago',st:'Up 2 hours',           ports:'0.0.0.0:3000->3000/tcp',name:'portfolio_web',c:G   },
    {id:'f9e0a1b2c3d4',img:'nginx:alpine',      cmd:'"/docker-entrypoint.…"', cr:'2 days ago', st:'Up 2 days',            ports:'0.0.0.0:80->80/tcp',    name:'nginx_proxy',  c:BL  },
    {id:'2b3c4d5e6f7a',img:'postgres:15',       cmd:'"docker-entrypoint.s…"', cr:'5 days ago', st:'Up 5 days',            ports:'5432/tcp',               name:'db',           c:SHA },
    {id:'7d8e9f0a1b2c',img:'redis:7-alpine',    cmd:'"docker-entrypoint.s…"', cr:'5 days ago', st:'Up 5 days',            ports:'6379/tcp',               name:'cache',        c:WARN},
  ];
  if (!sub || sub === 'help') {
    ['Usage:  docker [OPTIONS] COMMAND','',
     '  ps        List containers','  images    List images',
     '  stop      Stop a running container','  start     Start a stopped container',
     '  rm        Remove a container','  --version Show Docker version',
    ].forEach(l => ln(`<span style="color:${DIM}">${l}</span>`));
    return;
  }
  if (sub === '--version') { ln(`Docker version 24.0.7, build afdd53b`); return; }
  if (sub === 'ps') {
    const showAll = pts[2] === '-a' || pts[2] === '--all';
    if (showAll) CTRS.push({id:'e1f2a3b4c5d6',img:'node:20-alpine',cmd:'"npm run build"',cr:'1 week ago',st:'Exited (0) 1 week ago',ports:'',name:'build_runner',c:ERR});
    let h = `<pre style="margin:2px 0;line-height:1.6;font-size:.72rem;font-family:'JetBrains Mono',monospace;">`;
    h += `<span style="color:${DIM}">CONTAINER ID   IMAGE                  COMMAND               CREATED        STATUS                    PORTS                    NAMES</span>\n`;
    CTRS.forEach(({id,img,cmd,cr,st,ports,name,c}) => {
      h += `<span style="color:${DIM}">${id}</span>   ` +
           `<span style="color:${c}">${img.padEnd(22)}</span>   ` +
           `<span style="color:${DIM}">${cmd.padEnd(21)}</span>   ` +
           `<span style="color:${DIM}">${cr.padEnd(14)}</span>   ` +
           `<span style="color:${st.startsWith('Up')?G:ERR}">${st.padEnd(25)}</span>   ` +
           `<span style="color:${DIM}">${ports.padEnd(24)}</span>   ` +
           `<span style="color:${c}">${name}</span>\n`;
    });
    ln(h + '</pre>');
    return;
  }
  if (sub === 'images') {
    let h = `<pre style="margin:2px 0;line-height:1.6;font-size:.72rem;font-family:'JetBrains Mono',monospace;">`;
    h += `<span style="color:${DIM}">REPOSITORY         TAG         IMAGE ID       CREATED         SIZE</span>\n`;
    [['portfolio-web','1.0',    'a8f3b2c1d4e5','2 hours ago', '285MB', G   ],
     ['nginx',        'alpine', 'f9e0a1b2c3d4','2 weeks ago', '41.1MB',BL  ],
     ['postgres',     '15',     '2b3c4d5e6f7a','1 month ago', '412MB', SHA ],
     ['redis',        '7-alpine','7d8e9f0a1b2c','1 month ago', '34.8MB',WARN],
     ['node',         '20-alpine','e1f2a3b4c5d6','2 months ago','173MB', DIM ],
    ].forEach(([repo,tag,id,cr,size,c]) => {
      h += `<span style="color:${c}">${repo.padEnd(18)}</span>   ` +
           `<span style="color:${DIM}">${tag.padEnd(11)}</span>   ` +
           `<span style="color:${DIM}">${id.padEnd(14)}</span>   ` +
           `<span style="color:${DIM}">${cr.padEnd(15)}</span>   ` +
           `<span style="color:${DIM}">${size}</span>\n`;
    });
    ln(h + '</pre>');
    return;
  }
  if (['stop','start','rm','restart'].includes(sub)) {
    if (!pts[2]) { ln(`<span style="color:${ERR}">docker ${sub}: requires at least 1 argument</span>`); return; }
    ln(e2(pts[2]));
    return;
  }
  ln(`<span style="color:${ERR}">docker: '${e2(sub)}' is not a docker command.</span>`);
  ln(`<span style="color:${DIM}">Run 'docker help' for usage.</span>`);
}

let _ktermOpen    = false;
let _ktermRepo    = null;
let _ktermHistory = [];
let _ktermHistIdx = -1;
let _ctfStage     = 0; // 0=not started, 1=ls-la seen, 2=mission read, 'done'=solved

function initTermPanel() {
  const panel   = document.getElementById('kterm-panel');
  const body    = document.getElementById('kterm-body');
  const inp     = document.getElementById('kterm-inp');
  const ps1Top  = document.getElementById('kterm-ps1-top');
  const ps1Bot  = document.getElementById('kterm-ps1-bot');
  const titleEl = document.getElementById('kterm-bar-title');
  const toggle  = document.getElementById('khb-term-toggle');
  if (!panel || !body || !inp) return;

  const G = '#30a14e', BL = '#367bf0', SHA = '#f0883e', DIM = 'rgba(230,237,243,.3)', ERR = '#e06c75', WARN = '#e8c97e';

  function setPs1(dir) {
    if (ps1Top) ps1Top.innerHTML =
      `<span style="color:${G}">┌──(</span><span style="color:#e34c26">david</span><span style="color:${G}">㉿kali)</span><span style="color:#fff">-</span><span style="color:${BL}">[${dir}]</span>`;
    if (ps1Bot) ps1Bot.textContent = '└─$ ';
    if (titleEl) titleEl.textContent = 'bash — ' + dir;
  }

  function ln(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function gap() {
    const d = document.createElement('div');
    d.style.height = '3px';
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function cmdEcho(cmd, dir) {
    const d = document.createElement('div');
    d.style.marginBottom = '1px';
    d.innerHTML =
      `<div><span style="color:${G}">┌──(</span><span style="color:#e34c26">david</span><span style="color:${G}">㉿kali)</span><span>-</span><span style="color:${BL}">[${dir}]</span></div>` +
      `<div><span style="color:${G}">└─$</span> <span style="color:#e6edf3">${cmd}</span></div>`;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function runRepoSequence(repo) {
    body.innerHTML = '';
    const dir = repo ? `~/projects/${repo.name}` : '~/projects';
    setPs1(dir);
    ln(`<span style="color:${DIM}">Last login: ${new Date().toLocaleString('en-GB')} on pts/1</span>`);
    gap();

    if (!repo) { ln(`<span style="color:${DIM}">No project selected. Click a project icon.</span>`); return; }

    cmdEcho('git log --oneline -5', dir);
    await wait(40);
    try {
      const r = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/commits?per_page=5`);
      if (r.ok) {
        const commits = await r.json();
        if (commits.length) {
          commits.forEach(c => ln(
            `<span style="color:${SHA};font-weight:600">${c.sha.slice(0,7)}</span> ` +
            `<span style="color:${DIM}">${c.commit.message.split('\n')[0].slice(0,68)}</span>`
          ));
        } else ln(`<span style="color:${DIM}">(no commits found)</span>`);
      } else throw 0;
    } catch { ln(`<span style="color:${DIM}">(could not fetch — rate limited)</span>`); }
    gap();

    await wait(60);
    cmdEcho('ls -la', dir);
    await wait(40);
    try {
      const r = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/contents`);
      if (r.ok) {
        const files = await r.json();
        ln(`<span style="color:${DIM}">total ${files.length * 4 + 8}</span>`);
        files.forEach(f => {
          const d = f.type === 'dir';
          ln(`<span style="color:${DIM}">${d ? 'drwxr-xr-x' : '-rw-r--r--'} 1 david david ${String(f.size||4096).padStart(6)}</span> ` +
             `<span style="color:${d ? BL : G}">${f.name}${d ? '/' : ''}</span>`);
        });
      } else throw 0;
    } catch {
      ['README.md','index.html','style.css','main.js'].forEach(f =>
        ln(`<span style="color:${DIM}">-rw-r--r-- 1 david david   1024</span> <span style="color:${G}">${f}</span>`)
      );
    }
    gap();
    ln(`<span style="color:${DIM}">Type <span style="color:#e6edf3">help</span> for commands.</span>`);
    gap();
  }

  function openPanel(repo) {
    _ktermOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.classList.add('khb-on');
    if (repo && repo !== _ktermRepo) {
      _ktermRepo = repo;
      runRepoSequence(repo);
    } else if (!_ktermRepo) {
      runRepoSequence(null);
    }
    setTimeout(() => inp.focus(), 300);
  }

  function closePanel() {
    _ktermOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.classList.remove('khb-on');
  }

  window._ktermProjectOpened = function(repo) {
    _ktermRepo = repo;
    if (_ktermOpen) runRepoSequence(repo);
  };

  toggle?.addEventListener('click', () => {
    if (_ktermOpen) closePanel();
    else openPanel(_ktermRepo || allRepos[selectedIdx >= 0 ? selectedIdx : 0]);
  });
  document.getElementById('kterm-close-btn')?.addEventListener('click', closePanel);
  document.getElementById('kterm-clear-btn')?.addEventListener('click', () => { body.innerHTML = ''; inp.focus(); });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      if (_ktermOpen) closePanel(); else openPanel(_ktermRepo);
    }
  });

  const handle = document.getElementById('kterm-resize');
  if (handle) {
    let resizing = false, startY = 0, startH = 0;
    handle.addEventListener('mousedown', e => {
      resizing = true; startY = e.clientY; startH = panel.offsetHeight;
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (!resizing) return;
      const newH = Math.max(120, Math.min(480, startH - (e.clientY - startY)));
      panel.style.height = newH + 'px';
    });
    document.addEventListener('mouseup', () => { resizing = false; document.body.style.userSelect = ''; });
  }

  inp.addEventListener('keydown', async e => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) _playKeyClick();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (_ktermHistIdx < _ktermHistory.length - 1) inp.value = _ktermHistory[++_ktermHistIdx];
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      inp.value = _ktermHistIdx > 0 ? _ktermHistory[--_ktermHistIdx] : (_ktermHistIdx = -1, '');
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = inp.value.trim(); if (!v) return;
      const CMDS = ['cat','clear','docker','echo','exit','git','help','history','hostname','id','ifconfig','ls','man','neofetch','nmap','note','ping','ps','pwd','sound','ssh','sudo','traceroute','uname','uptime','whoami'];
      const m = CMDS.find(c => c.startsWith(v));
      if (m) inp.value = m + ' ';
      return;
    }
    if (e.key !== 'Enter') return;

    const raw = inp.value.trim(); inp.value = ''; _ktermHistIdx = -1;
    if (!raw) return;
    _ktermHistory.unshift(raw);

    const dir  = _ktermRepo ? `~/projects/${_ktermRepo.name}` : '~/projects';
    const c0   = raw.split(/\s+/)[0].toLowerCase();
    cmdEcho(raw, dir);

    if (c0 === 'clear' || c0 === 'reset') { body.innerHTML = ''; return; }
    if (c0 === 'exit')  { closePanel(); return; }
    if (c0 === 'help')  {
      gap();
      [['ls / ls -la','List files'],['cat <file>','Print file'],
       ['neofetch','System info'],['ping <host>','Ping a host'],
       ['traceroute <host>','Trace route to host'],['docker ps','List containers'],
       ['ssh user@host','Remote connect'],['uptime','System uptime'],
       ['git log','Commit history'],['git status','Repo status'],
       ['man <cmd>','Read the manual page'],['whoami','Current user'],
       ['clear','Clear output'],['exit','Close panel']
      ].forEach(([cmd, desc]) =>
        ln(`  <span style="color:#e6edf3;display:inline-block;min-width:160px">${cmd}</span><span style="color:${DIM}">${desc}</span>`)
      );
      gap(); return;
    }
    if (c0 === 'whoami') { ln(`<span style="color:#e6edf3">david</span>`); return; }
    if (c0 === 'pwd')    { ln(`<span style="color:${G}">/home/${dir.replace('~','david')}</span>`); return; }
    if (c0 === 'git')    { await runRepoSequence(_ktermRepo); return; }

    if (c0 === 'ls') {
      const la = /\s-[la]*a|-la\b|-al\b/.test(raw) || raw === 'ls -la' || raw === 'ls -al' || raw === 'ls -a';
      if (!_ktermRepo) {
        if (la) {
          if (_ctfStage === 0) _ctfStage = 1;
          ln(`<span style="color:${DIM}">total 64</span>`);
          [
            ['drwxr-xr-x','5 ','david david','4096','Jun  8 12:00','./'            , BL  ],
            ['drwxr-xr-x','14','david david','4096','Jun  8 12:00','../'           , BL  ],
            ['-rw-------','1 ','david david',' 220','Jun  8 12:00','.bash_history' , DIM ],
            ['-rw-r--r--','1 ','david david','3526','Jun  8 12:00','.bashrc'       , DIM ],
            ['-rw-------','1 ','david david','  73','Jun  8 12:00','.mission'      , WARN],
            ['drwxr-xr-x','3 ','david david','4096','Jun  8 12:00','networking/'   , BL  ],
            ['-rw-r--r--','1 ','david david',' 128','Jun  8 12:00','README.md'     , G   ],
            ['drwxr-xr-x','2 ','david david','4096','Jun  8 12:00','scripts/'      , BL  ],
            ['drwxr-xr-x','8 ','david david','4096','Jun  8 12:00','web-projects/' , BL  ],
          ].forEach(([p,n,u,s,d,name,c]) =>
            ln(`<span style="color:${DIM}">${p} ${n} ${u} ${s} ${d}</span> <span style="color:${c}">${name}</span>`)
          );
        } else {
          ['networking/', 'scripts/', 'web-projects/', 'README.md'].forEach(n =>
            ln(`<span style="color:${n.endsWith('/')?BL:G}">${n}</span>`)
          );
        }
        return;
      }
      try {
        const r = await fetch(`https://api.github.com/repos/misteralva/${_ktermRepo.name}/contents`);
        if (!r.ok) throw 0;
        const files = await r.json();
        if (la) {
          ln(`<span style="color:${DIM}">total ${files.length * 4 + 8}</span>`);
          [['drwxr-xr-x','2','david david','4096','Jun  8 12:00','./'  ,BL],
           ['drwxr-xr-x','2','david david','4096','Jun  8 12:00','../' ,BL]].forEach(([p,n,u,s,d,name,c]) =>
            ln(`<span style="color:${DIM}">${p} ${n} ${u} ${s} ${d}</span> <span style="color:${c}">${name}</span>`)
          );
        }
        files.forEach(f => {
          const isDir = f.type === 'dir';
          const sz    = String(f.size || 4096).padStart(6);
          if (la) {
            ln(`<span style="color:${DIM}">${isDir?'drwxr-xr-x':'-rw-r--r--'} 1 david david ${sz} Jun  8 12:00</span> <span style="color:${isDir?BL:G}">${f.name}${isDir?'/':''}</span>`);
          } else {
            ln(`<span style="color:${isDir?BL:G}">${f.name}${isDir?'/':''}</span>`);
          }
        });
      } catch { ln(`<span style="color:${ERR}">ls: cannot read directory</span>`); }
      return;
    }

    if (raw.startsWith('cat ')) {
      const file = raw.slice(4).trim();
      if (!_ktermRepo) {
        if (file === '.mission') {
          if (_ctfStage < 1) { ln(`<span style="color:${ERR}">cat: .mission: No such file or directory</span>`); return; }
          if (_ctfStage === 'done') { ln(`<span style="color:${G}">[✓] Already solved. Well done.</span>`); return; }
          if (_ctfStage < 2) _ctfStage = 2;
          gap();
          ln(`<span style="color:${DIM}">[CLASSIFIED - TS//SCI]</span>`);
          ln(`<span style="color:${DIM}">[2024-01-15 03:47:19 UTC]</span>`);
          gap();
          ln(`<span style="color:#e6edf3">Ybbx qrrcre, bcrengbe.</span>`);
          ln(`<span style="color:#e6edf3">Gur genvy yrnqf gb /ine/ybt/nhgu.ybt</span>`);
          gap();
          ln(`<span style="color:${DIM}">Unaqyre: QN_0k1997</span>`);
          ln(`<span style="color:${DIM}">[EOF]</span>`);
          gap();
          return;
        }
        if (file === '/var/log/auth.log' || file === 'auth.log') {
          if (_ctfStage < 3) { ln(`<span style="color:${ERR}">cat: /var/log/auth.log: Permission denied</span>`); return; }
          if (_ctfStage === 3) _ctfStage = 4;
          [
            `Jan 15 03:47:19 kali sshd[2318]: Failed password for invalid user admin from 192.168.1.10 port 44821 ssh2`,
            `Jan 15 03:47:31 kali sshd[2318]: Accepted publickey for david from 10.10.14.1 port 52413 ssh2`,
            `Jan 15 03:47:45 kali sudo[3091]: david : TTY=pts/1 ; PWD=/home/david ; USER=root ; COMMAND=/bin/bash`,
            `Jan 15 03:48:12 kali audit[4096]: CRED_FRAG credential=aW1kYXZpZGFsdmFyZXpAZ21haWwuY29t`,
            `Jan 15 03:48:13 kali audit[4096]: CRED_FRAG crc32=0xdeadbeef status=CAPTURED`,
          ].forEach(l => ln(`<span style="color:${DIM}">${l}</span>`));
          return;
        }
        if (file === '.bashrc') {
          ['# ~/.bashrc — david@kali','export PATH="$HOME/.local/bin:$PATH"','alias ll="ls -la"',
           'alias ports="ss -tulnp"','alias myip="curl -s ifconfig.me"','PS1="\\u@\\h:\\w\\$ "',
          ].forEach(l => ln(`<span style="color:${DIM}">${l}</span>`));
          return;
        }
        if (file === 'README.md') {
          ['# ~/projects', '', 'Personal project directory.', '',
           '- networking/   : lab configs, packet captures',
           '- scripts/      : automation & tooling',
           '- web-projects/ : portfolio & web apps',
          ].forEach(l => ln(`<span style="color:#e6edf3">${l}</span>`));
          return;
        }
        ln(`<span style="color:${ERR}">cat: ${file}: No such file or directory</span>`);
        return;
      }
      if (file === 'README.md') {
        try {
          const r = await fetch(`https://api.github.com/repos/misteralva/${_ktermRepo.name}/readme`);
          if (!r.ok) throw 0;
          const data  = await r.json();
          const bytes = Uint8Array.from(atob(data.content.replace(/\n/g,'')), c => c.charCodeAt(0));
          const text  = new TextDecoder('utf-8').decode(bytes).slice(0, 2000);
          text.split('\n').forEach(l => ln(`<span style="color:#e6edf3">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>`));
        } catch { ln(`<span style="color:${ERR}">cat: README.md: No such file</span>`); }
      } else {
        ln(`<span style="color:${ERR}">cat: ${file}: No such file or directory</span>`);
      }
      return;
    }

    // CTF: echo pipe handlers
    if (c0 === 'echo') {
      const hasRotTr  = (raw.includes('| tr') || raw.includes('|tr')) && (raw.includes('N-ZA') || raw.includes('rot13'));
      const hasBase64 = raw.includes('base64') && raw.includes('-d');
      if (hasRotTr && _ctfStage === 2) {
        _ctfStage = 3;
        gap();
        ln(`<span style="color:#e6edf3">Look deeper, operator.</span>`);
        ln(`<span style="color:#e6edf3">The trail leads to /var/log/auth.log</span>`);
        gap();
        ln(`<span style="color:${DIM}">Handler: DA_0x1997</span>`);
        gap();
      } else if (hasBase64 && _ctfStage === 4) {
        _ctfStage = 'done';
        ln(`<span style="color:#e6edf3">imdavidalvarez@gmail.com</span>`);
        gap();
        ln(`<span style="color:${G}">┌──────────────────────────────────────────────┐</span>`);
        ln(`<span style="color:${G}">│                                              │</span>`);
        ln(`<span style="color:${G}">│  [✓]  Operator identity confirmed.           │</span>`);
        ln(`<span style="color:${G}">│  [✓]  Challenge complete.                    │</span>`);
        ln(`<span style="color:${G}">│                                              │</span>`);
        ln(`<span style="color:#e6edf3">│  You found the Easter egg. Nice work.        │</span>`);
        ln(`<span style="color:${DIM}">│  imdavidalvarez@gmail.com                    │</span>`);
        ln(`<span style="color:${G}">│                                              │</span>`);
        ln(`<span style="color:${G}">└──────────────────────────────────────────────┘</span>`);
        gap();
      } else if (hasBase64 && _ctfStage !== 'done') {
        ln(`<span style="color:${ERR}">base64: invalid input</span>`);
      } else {
        ln(raw.slice(5).trim().replace(/^["']|["']$/g, ''));
      }
      return;
    }

    if (c0 === 'neofetch') {
      const ART = [
        "       _,met$$$$$gg.     ","    ,g$$$$$$$$$$$$$$$P.  ",
        "  ,g$$P\"     \"\"\"Y$$.\".",
        " ,$$P'              `$$$.","',$$P       ,ggs.     `$$b:",
        "`d$$'     ,$P\"'   .    $$$"," $$P      d$'     ,    $$P",
        " $$:      $$.   -    ,d$$'"," $$\\;      Y$b._   _,d$P' ",
        " Y$$.    `.`\"Y$$$$P\"'     "," `$$b      \"-.__          ",
        "  `Y$$                    ","   `Y$$.                  ",
        "     `$$b.                ","       `Y$$b.             ",
        "          `\"Y$b._         ","              `\"\"\"        ",
      ];
      const cores  = navigator.hardwareConcurrency || 4;
      const memMiB = (navigator.deviceMemory || 8) * 1024;
      const used   = Math.floor(900 + Math.random() * 600);
      const days_  = Math.floor((Date.now() - new Date('2025-04-15')) / 86400000);
      const G2 = '#30a14e', B2 = '#367bf0';
      const INFO = [
        `<b style="color:${G2}">david</b><span style="color:#e6edf3">@</span><b style="color:${G2}">kali</b>`,
        `<span style="color:#e6edf3">${'─'.repeat(17)}</span>`,
        `<span style="color:${G2}">OS</span>: DA.OS — Kali Linux 2024.3 x86_64`,
        `<span style="color:${G2}">Kernel</span>: 6.6.9-amd64`,
        `<span style="color:${G2}">Uptime</span>: ${days_} days`,
        `<span style="color:${G2}">Shell</span>: bash 5.2.15`,
        `<span style="color:${G2}">Resolution</span>: ${screen.width}x${screen.height}`,
        `<span style="color:${G2}">DE</span>: XFCE`,
        `<span style="color:${G2}">WM</span>: xfwm4`,
        `<span style="color:${G2}">Terminal</span>: xfce4-terminal`,
        `<span style="color:${G2}">CPU</span>: Intel Core i5 (${cores}) @ 4.200GHz`,
        `<span style="color:${G2}">Memory</span>: ${used} MiB / ${memMiB} MiB`,
        '',
        `<span style="background:#09090f;color:#09090f">███</span><span style="background:#e34c26;color:#e34c26">███</span><span style="background:#30a14e;color:#30a14e">███</span><span style="background:#367bf0;color:#367bf0">███</span><span style="background:#e8c97e;color:#e8c97e">███</span><span style="background:#ff6b6b;color:#ff6b6b">███</span><span style="background:#e6edf3;color:#e6edf3">███</span>`,
      ];
      gap();
      let html = '<pre style="margin:0;line-height:1.45;font-family:\'JetBrains Mono\',monospace;">';
      const rows = Math.max(ART.length, INFO.length);
      for (let i = 0; i < rows; i++) {
        const a = (ART[i] || '').padEnd(30).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        html += `<span style="color:${B2}">${a}</span>  ${INFO[i] || ''}\n`;
      }
      ln(html + '</pre>');
      gap();
      return;
    }
    if (c0 === 'ssh') {
      const target = raw.split(/\s+/)[1] || 'localhost';
      const [sshUser, sshHost] = target.includes('@') ? target.split('@') : ['david', target];
      const refused = ['github.com','google.com','cloudflare.com','kali.org','youtube.com'];
      await new Promise(r => setTimeout(r, 500));
      if (refused.includes(sshHost)) {
        ln(`ssh: connect to host ${sshHost} port 22: Connection refused`);
      } else if (sshHost === 'localhost' || sshHost === '127.0.0.1') {
        ln(`${sshUser}@localhost: Permission denied (publickey).`);
      } else {
        const fp = btoa(sshHost + '2024').replace(/[^a-zA-Z0-9]/g,'').slice(0,43);
        ln(`The authenticity of host '${sshHost}' can't be established.`);
        ln(`ED25519 key fingerprint is SHA256:${fp}.`);
        ln(`Are you sure you want to continue connecting (yes/no/[fingerprint])? <span style="color:#e6edf3">yes</span>`);
        await new Promise(r => setTimeout(r, 350));
        ln(`Warning: Permanently added '${sshHost}' (ED25519) to the list of known hosts.`);
        await new Promise(r => setTimeout(r, 600));
        ln(`${sshUser}@${sshHost}'s password:`);
        await new Promise(r => setTimeout(r, 1800));
        ln(`<span style="color:${ERR}">Permission denied, please try again.</span>`);
        await new Promise(r => setTimeout(r, 900));
        ln(`${sshUser}@${sshHost}'s password:`);
        await new Promise(r => setTimeout(r, 1800));
        ln(`<span style="color:${ERR}">Permission denied (publickey,password).</span>`);
      }
      return;
    }
    if (c0 === 'uptime') {
      const launched = new Date('2025-04-15');
      const now2 = new Date();
      const days2 = Math.floor((now2 - launched) / 86400000);
      const h2 = now2.getHours(), m2 = now2.getMinutes(), s2 = now2.getSeconds();
      const t2 = `${String(h2).padStart(2,'0')}:${String(m2).padStart(2,'0')}:${String(s2).padStart(2,'0')}`;
      const la1 = (0.1 + Math.random() * 0.5).toFixed(2), la2 = (0.05 + Math.random() * 0.4).toFixed(2), la3 = (0.03 + Math.random() * 0.3).toFixed(2);
      ln(` ${t2} up ${days2} days, 1 user,  load average: ${la1}, ${la2}, ${la3}`);
      return;
    }
    if (c0 === 'ping') {
      const host = (raw.split(/\s+/)[1] || 'localhost');
      const IP = {'google.com':'142.250.185.46','8.8.8.8':'8.8.8.8','1.1.1.1':'1.1.1.1','cloudflare.com':'104.16.132.229','github.com':'140.82.121.4','hackthebox.com':'185.70.40.10','kali.org':'192.99.200.39','localhost':'127.0.0.1','127.0.0.1':'127.0.0.1','10.10.14.1':'10.10.14.1'};
      const ip = IP[host.toLowerCase()] || `${[1,2,3,4].map(()=>Math.floor(Math.random()*220+10)).join('.')}`;
      const isLocal = ip.startsWith('127.'); const base = isLocal ? 0.05 : 8 + Math.random() * 18; const ttl = isLocal ? 64 : 55;
      ln(`PING ${host} (${ip}) 56(84) bytes of data.`);
      for (let i = 1; i <= 4; i++) {
        await new Promise(r => setTimeout(r, isLocal ? 40 : 220));
        ln(`<span style="color:#e6edf3">64 bytes from ${ip}: icmp_seq=${i} ttl=${ttl} time=${(base + Math.random()*base*0.25).toFixed(3)} ms</span>`);
      }
      gap();
      ln(`--- ${host} ping statistics ---`);
      ln(`4 packets transmitted, 4 received, 0% packet loss, time 3003ms`);
      ln(`<span style="color:${DIM}">rtt min/avg/max/mdev = ${base.toFixed(3)}/${(base*1.12).toFixed(3)}/${(base*1.35).toFixed(3)}/0.234 ms</span>`);
      return;
    }
    if (c0 === 'man') {
      const mcmd = raw.split(/\s+/)[1];
      if (!mcmd) { ln(`<span style="color:${ERR}">What manual page do you want?</span>`); }
      else {
        const mh = _manPage(mcmd, G, DIM);
        if (mh) ln(mh);
        else ln(`<span style="color:${ERR}">No manual entry for ${mcmd}</span>`);
      }
      return;
    }
    if (c0 === 'traceroute') {
      await _runTraceroute(raw.split(/\s+/)[1] || 'localhost', ln, G, DIM, WARN);
      return;
    }
    if (c0 === 'docker') {
      _runDocker(raw, ln, G, DIM, BL, SHA, WARN, ERR);
      return;
    }
    if (c0 === 'note') {
      const sub = pts[1];
      if (!sub || sub === 'help') {
        ln(`<span style="color:${G};">note</span> — sticky notes on the Kali desktop`);
        ln(`  <span style="color:${G};">note add</span> <span style="color:${DIM}">"text"</span>    create a sticky note`);
        ln(`  <span style="color:${G};">note ls</span>             list all notes`);
        ln(`  <span style="color:${G};">note rm</span> <span style="color:${DIM}">&lt;id&gt;</span>      remove by id`);
        ln(`  <span style="color:${G};">note clear</span>          remove all notes`);
      } else if (sub === 'add') {
        const text = pts.slice(2).join(' ').replace(/^["']|["']$/g,'');
        if (!text) { ln(`<span style="color:${ERR}">note add: missing text</span>`); }
        else {
          const id = _noteManager.add(text);
          ln(`<span style="color:${G};">✓</span> Created <span style="color:#e6edf3;">note#${id}</span> on desktop`);
        }
      } else if (sub === 'ls') {
        const notes = _noteManager.list();
        if (!notes.length) { ln(`<span style="color:${DIM}">no sticky notes</span>`); }
        else {
          ln(`<span style="color:${G};"> ID   TEXT</span>`);
          ln(`<span style="color:${DIM}">───  ───────────────────────────────────</span>`);
          notes.forEach(n => {
            const preview = n.text.length > 38 ? n.text.slice(0,38)+'…' : n.text;
            ln(`<span style="color:#e6edf3;">${String(n.id).padStart(3)}</span>  ${esc(preview)}`);
          });
        }
      } else if (sub === 'rm') {
        const id = parseInt(pts[2]);
        if (isNaN(id)) { ln(`<span style="color:${ERR}">note rm: missing id — usage: note rm &lt;id&gt;</span>`); }
        else { _noteManager.rm(id); ln(`<span style="color:${G};">✓</span> Removed note#${id}`); }
      } else if (sub === 'clear') {
        _noteManager.clear();
        ln(`<span style="color:${G};">✓</span> All notes cleared`);
      } else {
        ln(`<span style="color:${ERR}">note: unknown subcommand '${esc(sub)}'</span>`);
        ln(`<span style="color:${DIM}">Usage: note [add|ls|rm|clear|help]</span>`);
      }
      return;
    }
    if (c0 === 'sound') {
      const arg = pts[1];
      if (arg === 'on') {
        _soundEnabled = true; localStorage.setItem('da-kterm-sound','1');
        ln(`<span style="color:${G};">✓</span> Keyboard sound <span style="color:#e6edf3;">enabled</span>`);
      } else if (arg === 'off') {
        _soundEnabled = false; localStorage.setItem('da-kterm-sound','0');
        ln(`<span style="color:${G};">✓</span> Keyboard sound <span style="color:${DIM};">disabled</span>`);
      } else {
        ln(`sound: <span style="color:#e6edf3;">${_soundEnabled ? 'on' : 'off'}</span>`);
        ln(`<span style="color:${DIM}">Usage: sound [on|off]</span>`);
      }
      return;
    }
    ln(`<span style="color:${ERR}">bash: ${raw.split(' ')[0]}: command not found</span>`);
    ln(`<span style="color:${DIM}">Type <span style="color:#e6edf3">help</span> for available commands.</span>`);
  });
}

startClock();
initDragWin();
initControls();
initAppMenu();
initContextMenu();
_noteManager.init();
initTermPanel();
boot(() => { loadRepos(); });
