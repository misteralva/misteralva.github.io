import { initScene } from './scene.js';

window._bootTime = Date.now();
window._lang     = localStorage.getItem('da-lang') || 'en';

const WIN_W = { about:700, skills:700, certs:680, experience:700, projects:880, contact:700, 'project-detail':640, terminal:680 };
const WIN_H = { about:480, skills:500, certs:420, experience:520, projects:560, contact:520, 'project-detail':440, terminal:440 };

let zTop = 100;
const winState = {};

const cur = document.getElementById('cur');
let cx = 0, cy = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
(function loop() {
  requestAnimationFrame(loop);
  cx += (tx - cx) * .09;
  cy += (ty - cy) * .09;
  cur.style.left = cx + 'px';
  cur.style.top  = cy + 'px';
})();
function addHover(els) {
  els.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-lg'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-lg'));
  });
}
addHover(document.querySelectorAll('a,button,.di,.wb,.mb-item'));

async function openProjectDetail(repo, lc) {
  document.getElementById('pd-win-title').textContent =
    repo.name.toLowerCase().replace(/-/g, ' ') + '.md';
  document.getElementById('pd-stripe').style.background = lc;
  document.getElementById('pd-name').textContent = repo.name.replace(/-/g, ' ');
  document.getElementById('pd-lang-dot').style.background = lc;
  document.getElementById('pd-lang-name').textContent = repo.language || '';
  document.getElementById('pd-stars').textContent =
    repo.stargazers_count ? `★ ${repo.stargazers_count}` : '';
  document.getElementById('pd-desc').textContent =
    repo.description || 'No description available.';

  const topicsEl = document.getElementById('pd-topics');
  topicsEl.innerHTML = (repo.topics || [])
    .map(t => `<span class="pd-topic">${t}</span>`).join('');

  const actionsEl = document.getElementById('pd-actions');
  actionsEl.innerHTML = `
    <a href="${repo.html_url}" target="_blank" rel="noopener" class="pd-gh-btn">
      <i class="fab fa-github"></i> View on GitHub
    </a>
    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="pd-demo-btn">
      <i class="fas fa-arrow-up-right-from-square"></i> Live Demo
    </a>` : ''}`;
  addHover(actionsEl.querySelectorAll('a'));

  
  const previewEl = document.getElementById('pd-preview');
  if (previewEl && repo.html_url && repo.html_url.includes('github.com')) {
    previewEl.innerHTML = `<img src="https://opengraph.githubassets.com/1/misteralva/${repo.name}"
      alt="${repo.name} preview" class="pd-preview-img"
      onerror="this.closest('.pd-preview').style.display='none'">`;
  } else if (previewEl) {
    previewEl.innerHTML = '';
  }

  const readmeEl = document.getElementById('pd-readme');
  if (readmeEl) {
    readmeEl.innerHTML = '';
    try {
      const r = await fetch(`https://api.github.com/repos/misteralva/${repo.name}/readme`);
      if (r.ok) {
        const data = await r.json();
        const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0));
        const text  = new TextDecoder('utf-8').decode(bytes);
        readmeEl.innerHTML = marked.parse(text.length > 4000 ? text.slice(0, 4000) + '\n\n...' : text);
      }
    } catch {  }
  }

  if (winState['project-detail']?.open) {
    bringToFront('project-detail');
    gsap.fromTo(getWin('project-detail'),
      { opacity:.6, scale:.97 }, { opacity:1, scale:1, duration:.2, ease:'power2.out' });
  } else {
    openWindow('project-detail');
  }
}

function initCursorTrail() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  const canvas = document.getElementById('trail');
  if (canvas) canvas.style.display = 'none';

  const POOL = [
    '0xFF','0x1A','0xDE','0xAD','0xC0','0x4E','0x2F','0xB3',
    '01','10','11','00','1010','0110',
    '>_','{}','[]','</>','#!','::','&&','||','>>','<<',
  ];

  let lastT = 0;
  const GAP = 72;

  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastT < GAP) return;
    lastT = now;

    const txt   = POOL[Math.floor(Math.random() * POOL.length)];
    const size  = (.32 + Math.random() * .16).toFixed(2);
    const alpha = (.3  + Math.random() * .45).toFixed(2);
    const ox    = (Math.random() - .5) * 24;
    const oy    = (Math.random() - .5) * 10;
    const dy    = -(20 + Math.random() * 24);

    const rnd = Math.random();
    const col = rnd < .55
      ? `rgba(100,255,218,${alpha})`
      : rnd < .80
        ? `rgba(255,45,120,${alpha})`
        : `rgba(0,255,65,${alpha})`;

    const el = document.createElement('span');
    el.textContent = txt;
    Object.assign(el.style, {
      position:      'fixed',
      left:          `${e.clientX + ox}px`,
      top:           `${e.clientY + oy}px`,
      fontFamily:    "'JetBrains Mono', monospace",
      fontSize:      `${size}rem`,
      color:         col,
      pointerEvents: 'none',
      zIndex:        '9996',
      userSelect:    'none',
      whiteSpace:    'nowrap',
      textShadow:    `0 0 6px ${col}`,
      transition:    'transform .82s cubic-bezier(.2,.8,.4,1), opacity .82s ease-out',
    });
    document.body.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translateY(${dy}px)`;
      el.style.opacity   = '0';
    }));

    setTimeout(() => el.remove(), 900);
  });
}

const REPO_CAT = {
  'pachinko':                     'Frontend',
  'misteralva.github.io':         'Frontend',
  'alwaysontech-red-empresarial': 'Networking',
  'lec-database':                 'Backend',
};
const CAT_ICONS = {
  'Frontend':   'fas fa-code',
  'Networking': 'fas fa-network-wired',
  'Backend':    'fas fa-server',
  'Security':   'fas fa-shield-halved',
};

const SP_APPS = [
  { id:'about',      label:'profile.app',   icon:'fas fa-id-badge',     desc:'Profile · About · Info' },
  { id:'skills',     label:'skills.app',    icon:'fas fa-network-wired',desc:'Technologies · Tools' },
  { id:'certs',      label:'certs.app',     icon:'fas fa-certificate',  desc:'Certifications · CCNA' },
  { id:'experience', label:'experience.app',icon:'fas fa-briefcase',    desc:'Work experience' },
  { id:'projects',   label:'projects.app',  icon:'fas fa-folder-open',  desc:'GitHub Repositories' },
  { id:'contact',    label:'contact.app',   icon:'fas fa-envelope',     desc:'Contact · Form' },
  { id:'terminal',   label:'terminal.app',  icon:'fas fa-terminal',     desc:'Interactive shell · Ctrl+T' },
];

const SP_CONTENT = [
  
  { win:'skills', label:'TCP/IP',           desc:'Networks & Systems',  icon:'fas fa-network-wired', tag:'skill' },
  { win:'skills', label:'Routing & Switching',desc:'Networks & Systems',icon:'fas fa-route',         tag:'skill' },
  { win:'skills', label:'VPN',              desc:'Networks & Systems',  icon:'fas fa-shield-halved', tag:'skill' },
  { win:'skills', label:'Wireshark',        desc:'Networks & Systems',  icon:'fas fa-magnifying-glass-chart', tag:'skill' },
  { win:'skills', label:'Firewalls',        desc:'Networks & Systems',  icon:'fas fa-fire',          tag:'skill' },
  { win:'skills', label:'Linux',            desc:'OS & Admin',          icon:'fab fa-linux',         tag:'skill' },
  { win:'skills', label:'Windows Server',   desc:'OS & Admin',          icon:'fab fa-windows',       tag:'skill' },
  { win:'skills', label:'Active Directory', desc:'OS & Admin',          icon:'fas fa-sitemap',       tag:'skill' },
  { win:'skills', label:'Bash / SSH',       desc:'OS & Admin',          icon:'fas fa-terminal',      tag:'skill' },
  { win:'skills', label:'JavaScript',       desc:'Development',         icon:'fab fa-js',            tag:'skill' },
  { win:'skills', label:'HTML / CSS',       desc:'Development',         icon:'fab fa-html5',         tag:'skill' },
  { win:'skills', label:'PHP',              desc:'Development',         icon:'fab fa-php',           tag:'skill' },
  { win:'skills', label:'SQL',              desc:'Development',         icon:'fas fa-database',      tag:'skill' },
  { win:'skills', label:'SAP ERP',          desc:'Tools',               icon:'fas fa-circle-nodes',  tag:'skill' },
  { win:'skills', label:'Salesforce',       desc:'Tools',               icon:'fab fa-salesforce',    tag:'skill' },
  { win:'skills', label:'Cisco PT',         desc:'Tools',               icon:'fas fa-diagram-project',tag:'skill'},
  { win:'skills', label:'Git',              desc:'Tools',               icon:'fab fa-git-alt',       tag:'skill' },
  { win:'skills', label:'Metasploit',       desc:'Security Tools',      icon:'fas fa-bug',           tag:'skill' },
  { win:'skills', label:'Nmap',             desc:'Security Tools',      icon:'fas fa-network-wired', tag:'skill' },
  { win:'skills', label:'Burp Suite',       desc:'Security Tools',      icon:'fas fa-bug',           tag:'skill' },
  
  { win:'experience', label:'Sthree Spain',      desc:'Operations Specialist · 2023–2025',    icon:'fas fa-briefcase', tag:'exp' },
  { win:'experience', label:'Chronis Elite',     desc:'Player Relations Manager · 2022–2023', icon:'fas fa-briefcase', tag:'exp' },
  { win:'experience', label:'Carolina Esports',  desc:'Operations Trainee · 2022',            icon:'fas fa-briefcase', tag:'exp' },
  { win:'experience', label:'SAP',               desc:'Sthree — contract management',         icon:'fas fa-circle-nodes', tag:'exp' },
  { win:'experience', label:'OBS Studio',        desc:'Carolina Esports — live broadcast',    icon:'fas fa-video',     tag:'exp' },
  
  { win:'about', section:'edu',  label:'CFGS ASIR',         desc:'Network Systems Administration', icon:'fas fa-graduation-cap', tag:'edu' },
  { win:'about', section:'edu',  label:'Cybersecurity',     desc:'ASIR specialisation',            icon:'fas fa-shield-halved',  tag:'edu' },
  { win:'certs',                 label:'CCNA: Intro to Networks', desc:'Cisco Networking Academy', icon:'fas fa-network-wired',  tag:'cert' },
  
  ...Object.entries(REPO_CAT).map(([n, cat]) => ({
    win:'projects', tag:'project',
    icon:  CAT_ICONS[cat] || 'fas fa-folder',
    label: n.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase()),
    desc:  cat + ' · GitHub',
  })),
  
  { win:'contact', label:'imdavidalvarez@gmail.com',       desc:'Send an email',    icon:'fas fa-envelope',  tag:'contact' },
  { win:'contact', label:'linkedin.com/in/davidalvarez1997',desc:'LinkedIn profile', icon:'fab fa-linkedin',  tag:'contact' },
  { win:'contact', label:'github.com/misteralva',          desc:'GitHub profile',   icon:'fab fa-github',    tag:'contact' },
];

function initSpotlight() {
  const sp      = document.getElementById('spotlight');
  const input   = document.getElementById('sp-input');
  const results = document.getElementById('sp-results');
  const spBtn   = document.getElementById('mb-sp-btn');
  if (!sp) return;

  let activeIdx = 0;

  const show = () => {
    sp.classList.add('open');
    sp.setAttribute('aria-hidden','false');
    requestAnimationFrame(() => input.focus());
    render('');
  };
  const hide = () => {
    sp.classList.remove('open');
    sp.setAttribute('aria-hidden','true');
    input.value = '';
  };

  const TAG_LABEL = { skill:'skill', exp:'experience', edu:'education', cert:'cert', project:'project', contact:'contact' };

  const render = query => {
    const q = query.toLowerCase();
    activeIdx = 0;

    const apps    = SP_APPS.filter(a => a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
    const content = q.length >= 2
      ? SP_CONTENT.filter(c => c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)).slice(0, 6)
      : [];

    const allItems = [...apps, ...content];

    if (!allItems.length) {
      results.innerHTML = `<div class="sp-empty mono">No results for "${query}"</div>`;
      return;
    }

    results.innerHTML = allItems.map((a, i) => {
      const isContent = !!a.tag;
      const tagHtml   = isContent ? `<span class="sp-tag">${TAG_LABEL[a.tag] || a.tag}</span>` : '';
      return `
        <div class="sp-item${i===0?' active':''}" data-win="${a.id || a.win}" data-section="${a.section||''}" role="option" aria-selected="${i===0}">
          <div class="sp-item-icon"><i class="${a.icon}"></i></div>
          <div class="sp-item-text">
            <span class="sp-item-label">${a.label}${tagHtml}</span>
            <span class="sp-item-desc mono">${a.desc}</span>
          </div>
          <span class="sp-item-arr" aria-hidden="true">↵</span>
        </div>`;
    }).join('');

    results.querySelectorAll('.sp-item').forEach(el => {
      el.addEventListener('click', () => {
        const win     = el.dataset.win;
        const section = el.dataset.section;
        openWindow(win);
        if (section) setTimeout(() => document.querySelector(`.ws-item[data-section="${section}"]`)?.click(), 120);
        hide();
      });
    });
  };

  const setActive = idx => {
    const items = [...results.querySelectorAll('.sp-item')];
    if (!items.length) return;
    items.forEach(el => { el.classList.remove('active'); el.setAttribute('aria-selected','false'); });
    activeIdx = (idx + items.length) % items.length;
    items[activeIdx]?.classList.add('active');
    items[activeIdx]?.setAttribute('aria-selected','true');
    items[activeIdx]?.scrollIntoView({ block:'nearest' });
  };

  input.addEventListener('input', () => render(input.value));

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); sp.classList.contains('open') ? hide() : show(); return; }
    if (!sp.classList.contains('open')) return;
    if (e.key === 'Escape')   { hide(); return; }
    if (e.key === 'ArrowDown'){ e.preventDefault(); setActive(activeIdx + 1); return; }
    if (e.key === 'ArrowUp')  { e.preventDefault(); setActive(activeIdx - 1); return; }
    if (e.key === 'Enter') {
      const active = results.querySelector('.sp-item.active');
      if (active) { openWindow(active.dataset.win); hide(); }
    }
  });

  sp.querySelector('.sp-backdrop').addEventListener('click', hide);
  spBtn?.addEventListener('click', () => sp.classList.contains('open') ? hide() : show());
  if (spBtn) addHover([spBtn]);
}

function runLoader(cb) {
  // Mobile: skip loader entirely, go straight to desktop
  if (window.matchMedia('(max-width:768px)').matches || window.matchMedia('(pointer:coarse)').matches) {
    const lEl = document.getElementById('loader');
    if (lEl) lEl.style.display = 'none';
    cb();
    return;
  }
  if (sessionStorage.getItem('da-skip-loader')) {
    sessionStorage.removeItem('da-skip-loader');
    const lEl = document.getElementById('loader');
    if (lEl) lEl.style.display = 'none';
    window._fromProjects = true;
    cb();
    return;
  }

  const out = document.getElementById('tl-out');
  const inp = document.getElementById('tl-in');
  const lEl = document.getElementById('loader');

  
  document.addEventListener('click', () => inp && inp.focus());

  function dismiss() {
    if (inp) inp.disabled = true;
    lEl.classList.add('out');
    setTimeout(cb, 800);
  }

  
  function ln(text, cls) {
    const el = document.createElement('span');
    el.className = 'tln' + (cls ? ' ' + cls : '');
    el.textContent = text;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
    return el;
  }
  function lnH(html, cls) {
    const el = document.createElement('span');
    el.className = 'tln' + (cls ? ' ' + cls : '');
    el.innerHTML = html;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
  }
  function gap() {
    const el = document.createElement('span');
    el.className = 'tln-gap';
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
  }
  function bar(pct, w) {
    w = w || 18;
    const f = Math.round(pct / 100 * w);
    return `<span style="color:var(--acc)">${'█'.repeat(f)}</span>` +
           `<span style="color:rgba(100,255,218,.18)">${'░'.repeat(w - f)}</span>`;
  }

  
  const CMDS = {
    help() {
      gap();
      ln('AVAILABLE COMMANDS', 'tln-acc');
      ln('──────────────────────────────────────────────', 'tln-sep');
      [['whoami',     'Identity & current status'],
       ['about',      'Full bio & background'],
       ['skills',     'Technical skills'],
       ['experience', 'Work history'],
       ['certs',      'Certifications & education'],
       ['contact',    'How to reach me'],
       ['──────────', '── System ────────────────────────'],
       ['ls',         'List files and directories'],
       ['cat',        'Read a file  (README.md  cv.txt  .bashrc)'],
       ['vim',        'Open file in editor  (vim cv.txt)'],
       ['pwd',        'Print working directory'],
       ['env',        'Environment variables'],
       ['alias',      'Shell aliases'],
       ['date',       'Current date & time'],
       ['uptime',     'System uptime'],
       ['top',        'Running processes (live)'],
       ['ps',         'Process list'],
       ['df',         'Disk usage'],
       ['uname',      'Kernel & system info'],
       ['──────────', '── Network ───────────────────────'],
       ['ping',       'Test connectivity  (ping 8.8.8.8)'],
       ['nmap',       'Port scan local gateway'],
       ['ifconfig',   'Network interface info'],
       ['netstat',    'Active connections'],
       ['traceroute', 'Trace route to destination'],
       ['ssh',        'SSH session demo'],
       ['curl',       'HTTP request  (curl imdavidalvarez.com)'],
       ['──────────', '── Extras ────────────────────────'],
       ['git',        'Git log / status / branch'],
       ['sudo',       'Escalate privileges (try it)'],
       ['man',        'Manual  —  try: man david'],
       ['hack',       'Initialise shell'],
       ['matrix',     'Matrix rain'],
       ['──────────', '──────────────────────────────────'],
       ['open',       'Launch the portfolio →'],
       ['clear',      'Clear terminal'],
       ['history',    'Command history'],
      ].forEach(([c, d]) => {
        if (c.startsWith('──')) { ln(d, 'tln-dim'); return; }
        lnH(`  <span style="color:var(--acc);display:inline-block;min-width:130px">${c}</span>` +
            `<span style="color:var(--dim)">${d}</span>`);
      });
      gap();
      ln('Type  open  to enter the portfolio.', 'tln-dim');
      gap();
    },
    whoami() {
      gap();
      ln('David Alvarez', 'tln-acc');
      ln('IT Systems & Networks Administrator');
      ln('Hospitalet · Barcelona · Spain', 'tln-dim');
      gap();
      lnH(`<span class="tln-dim">focus  </span>Networks · Infrastructure · Cybersecurity`);
      lnH(`<span class="tln-dim">lang   </span>Spanish (native) · Catalan (native) · EN C1`);
      gap();
    },
    about() {
      gap();
      ln('── ABOUT ──────────────────────────────────────', 'tln-sep');
      gap();
      ln('IT professional with experience in international operational');
      ln('environments. Pursuing CFGS ASIR with Cybersecurity specialisation.');
      gap();
      ln('Managed contracts via SAP, Salesforce and Mercury at Sthree Spain.');
      ln('Six years in the US. C1 English. Multicultural environments.');
      gap();
      ln('Seeking roles in IT, networks and infrastructure.', 'tln-acc');
      gap();
    },
    skills() {
      gap();
      ln('── TECHNICAL SKILLS ───────────────────────────', 'tln-sep');
      gap();
      ln('NETWORKS & SYSTEMS', 'tln-acc');
      ln('  TCP/IP  ·  DNS/DHCP  ·  Routing  ·  VPN  ·  Firewalls  ·  Wireshark');
      gap();
      ln('OS & SYSADMIN', 'tln-acc');
      ln('  Linux  ·  Windows Server  ·  Active Directory  ·  Bash/SSH  ·  MacOS');
      gap();
      ln('TOOLS', 'tln-acc');
      ln('  SAP  ·  Salesforce  ·  Mercury  ·  Cisco Packet Tracer  ·  Git');
      gap();
      ln('DEVELOPMENT', 'tln-acc');
      ln('  HTML5  ·  CSS3  ·  JavaScript  ·  PHP  ·  SQL');
      gap();
    },
    experience() {
      gap();
      ln('── WORK EXPERIENCE ────────────────────────────', 'tln-sep');
      gap();
      [{date:'Jul 2023 – Sep 2025', co:'Sthree Spain · Barcelona', role:'Operations Specialist',
        pts:['Operations, onboarding & incident escalation','Account management via SAP','Contracts: SAP, Salesforce, Mercury']},
       {date:'Sep 2022 – May 2023', co:'Chronis Elite · Long Island', role:'Player Relations Manager',
        pts:['Recruitment for US elite youth soccer academy','Logistics with European academies']},
       {date:'Jan 2022 – May 2022', co:'Carolina Esports · Charlotte', role:'Operations Trainee',
        pts:['Live esports broadcast via OBS & NDI','Multi-camera AV tournament support']}
      ].forEach(j => {
        lnH(`<span class="tln-acc">${j.date}</span>  <span class="tln-dim">${j.co}</span>`);
        ln('  ' + j.role);
        j.pts.forEach(p => ln('  └─ ' + p, 'tln-dim'));
        gap();
      });
    },
    certs() {
      gap();
      ln('── CERTIFICATIONS ─────────────────────────────', 'tln-sep');
      gap();
      lnH(`<span class="tln-warn">[IN PROGRESS]</span> CCNA: Introduction to Networks · Cisco Networking Academy`);
      gap();
    },
    contact() {
      gap();
      ln('── CONTACT ────────────────────────────────────', 'tln-sep');
      gap();
      lnH(`<span class="tln-dim">email    </span>` +
          `<a href="mailto:imdavidalvarez@gmail.com" style="color:var(--acc)">imdavidalvarez@gmail.com</a>`);
      lnH(`<span class="tln-dim">linkedin </span>` +
          `<a href="https://linkedin.com/in/davidalvarez1997" target="_blank" style="color:var(--acc)">linkedin.com/in/davidalvarez1997</a>`);
      lnH(`<span class="tln-dim">github   </span>` +
          `<a href="https://github.com/misteralva" target="_blank" style="color:var(--acc)">github.com/misteralva</a>`);
      gap();
    },
    ping(args) {
      const target = args?.[0] || '8.8.8.8';
      const urlMap = {
        '8.8.8.8': 'https://dns.google/', '8.8.4.4': 'https://dns.google/',
        '1.1.1.1': 'https://1.1.1.1/cdn-cgi/trace', '1.0.0.1': 'https://1.1.1.1/cdn-cgi/trace',
        'google.com': 'https://google.com', 'cloudflare.com': 'https://cloudflare.com/cdn-cgi/trace',
      };
      const url = urlMap[target] || 'https://1.1.1.1/cdn-cgi/trace';
      gap();
      ln(`PING ${target}: measuring real latency…`, 'tln-dim');
      (async () => {
        const times = [];
        for (let i = 0; i < 3; i++) {
          const t0 = performance.now();
          try { await fetch(url, { mode:'no-cors', cache:'no-cache' }); times.push((performance.now()-t0).toFixed(1)); }
          catch { times.push('*'); }
        }
        const valid = times.filter(t => t !== '*').map(Number);
        const avg = valid.length ? (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1) : '*';
        const mn  = valid.length ? Math.min(...valid).toFixed(1) : '*';
        const mx  = valid.length ? Math.max(...valid).toFixed(1) : '*';
        times.forEach((t,i) => ln(`64 bytes from ${target}: icmp_seq=${i} ttl=55 time=${t} ms`, t==='*'?'tln-err':''));
        gap();
        ln(`--- ${target} ping statistics ---`, 'tln-sep');
        ln('3 packets transmitted, 3 received, 0% packet loss', 'tln-ok');
        ln(`round-trip min/avg/max = ${mn}/${avg}/${mx} ms`, 'tln-dim');
        gap();
      })();
    },
    nmap() {
      gap();
      ln('Starting Nmap 7.94 SVN ( https://nmap.org )', 'tln-dim');
      ln('Nmap scan report for 192.168.1.1');
      ln('Host is up (0.0024s latency).', 'tln-dim');
      gap();
      lnH(`<span class="tln-dim">PORT       STATE  SERVICE   VERSION</span>`);
      lnH(`<span class="tln-ok">22/tcp   </span>  open   ssh       OpenSSH 8.9p1`);
      lnH(`<span class="tln-ok">80/tcp   </span>  open   http      nginx 1.24.0`);
      lnH(`<span class="tln-ok">443/tcp  </span>  open   https     nginx 1.24.0`);
      lnH(`<span class="tln-warn">8080/tcp </span>  closed http-proxy`);
      gap();
      ln('Nmap done: 1 IP address (1 host up) scanned in 2.61 seconds', 'tln-dim');
      gap();
    },
    ifconfig() {
      gap();
      ln('Fetching real network info…', 'tln-dim');
      (async () => {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const type = conn?.effectiveType || 'unknown';
        const down = conn?.downlink ? conn.downlink + ' Mbps' : 'unknown';
        let ip = '?.?.?.?';
        try {
          const txt = await fetch('https://cloudflare.com/cdn-cgi/trace').then(r => r.text());
          ip = txt.match(/ip=(.+)/)?.[1]?.trim() || ip;
        } catch {}
        lnH(`<span class="tln-acc">eth0</span>: flags=4163&lt;UP,BROADCAST,RUNNING&gt;  mtu 1500`);
        ln(`      inet ${ip}  (your public IP)`);
        ln(`      connection: ${type}  downlink: ${down}`, 'tln-dim');
        gap();
        lnH(`<span class="tln-acc">lo</span>: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536`);
        ln('    inet 127.0.0.1  netmask 255.0.0.0');
        gap();
      })();
    },
    netstat() {
      gap();
      ln('Active Internet connections (only servers)', 'tln-sep');
      lnH(`<span class="tln-dim">Proto  Local Address           State</span>`);
      lnH(`tcp    <span class="tln-ok">0.0.0.0:22</span>              LISTEN`);
      lnH(`tcp    <span class="tln-ok">0.0.0.0:80</span>              LISTEN`);
      lnH(`tcp    <span class="tln-ok">0.0.0.0:443</span>             LISTEN`);
      lnH(`tcp    192.168.1.105:48214    ESTABLISHED`);
      lnH(`tcp6   :::22                  LISTEN`);
      lnH(`udp    0.0.0.0:68             UNCONN  <span class="tln-dim">(dhcp)</span>`);
      gap();
    },
    traceroute() {
      gap();
      ln('traceroute to google.com (142.250.185.14), 30 hops max', 'tln-dim');
      lnH(` 1  <span class="tln-acc">192.168.1.1</span>      1.234 ms  1.102 ms  1.089 ms`);
      lnH(` 2  10.0.0.1         4.821 ms  4.744 ms  4.912 ms`);
      lnH(` 3  *  *  *  <span class="tln-dim">(no reply)</span>`);
      lnH(` 4  72.14.232.51     8.442 ms  8.381 ms  8.290 ms`);
      lnH(` 5  <span class="tln-ok">142.250.185.14</span>  10.981 ms  11.204 ms`);
      gap();
    },
    ssh() {
      gap();
      ln('Connecting to server.lab.local (192.168.1.10)...', 'tln-dim');
      ln('Warning: permanently added host to known_hosts.', 'tln-warn');
      ln('david@192.168.1.10 — authenticated via key.', 'tln-ok');
      gap();
      ln('  Welcome to Ubuntu Server 22.04.3 LTS (GNU/Linux 6.2.0-36-generic)');
      ln('  Last login: Mon Jun  2 09:22:14 2026 from 192.168.1.105', 'tln-dim');
      gap();
      ln('  [demo mode — interactive session unavailable]', 'tln-warn');
      ln('  Connection closed.', 'tln-dim');
      gap();
    },
    df() {
      gap();
      if (!('storage' in navigator && 'estimate' in navigator.storage)) {
        ln('storage estimate not available in this browser', 'tln-err'); gap(); return;
      }
      navigator.storage.estimate().then(est => {
        const used  = (est.usage  / 1e6).toFixed(0);
        const quota = (est.quota  / 1e6).toFixed(0);
        const avail = ((est.quota - est.usage) / 1e6).toFixed(0);
        const pct   = ((est.usage / est.quota) * 100).toFixed(0);
        lnH(`<span class="tln-dim">Filesystem          Size      Used    Avail   Use%  Mounted on</span>`);
        lnH(`browser-storage     ${quota}MB   ${used}MB   ${avail}MB   <span class="${+pct>80?'tln-warn':'tln-ok'}">${pct}%</span>    /`);
        ln('tmpfs (session)     memory   volatile            —     /tmp', 'tln-dim');
        gap();
      });
    },
    uname() {
      gap();
      const ua    = navigator.userAgent;
      const cores = navigator.hardwareConcurrency || '?';
      const arch  = /arm|aarch64/i.test(ua) ? 'aarch64' : 'x86_64';
      let os = 'Unknown';
      if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
      else if (/Windows NT 6.3/.test(ua)) os = 'Windows 8.1';
      else if (/Mac OS X/.test(ua))  os = 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g,'.') || '');
      else if (/Android/.test(ua))   os = 'Android';
      else if (/Linux/.test(ua))     os = 'Linux';
      ln(`${os}  ${arch}  ${cores} CPU cores  — real data from your browser`);
      gap();
    },
    ps() {
      gap();
      lnH(`<span class="tln-dim">  PID TTY      STAT   TIME COMMAND</span>`);
      lnH(`  <span class="tln-acc">1042</span> pts/0    Ss     0:00 bash`);
      ln('  1847 pts/0    S      0:01 nginx: worker process');
      ln('  2134 pts/0    Sl     0:03 node portfolio.js');
      ln('  3021 pts/0    S      0:00 sshd: david [priv]', 'tln-dim');
      lnH(`  <span class="tln-ok">4402</span> pts/0    R+     0:00 ps aux`);
      gap();
    },
    sudo() {
      gap();
      ln('[sudo] password for david: ', 'tln-dim');
      ln('Sorry, try again.', 'tln-err');
      ln('[sudo] password for david: ', 'tln-dim');
      ln('Sorry, try again.', 'tln-err');
      ln('sudo: 3 incorrect password attempts', 'tln-err');
      gap();
      ln('  (portfolio mode — root access restricted)', 'tln-warn');
      gap();
    },
    open()   { gap(); ln('[  OK  ] Loading portfolio desktop…', 'tln-ok'); gap(); setTimeout(dismiss, 600); },
    launch() { CMDS.open(); },
    start()  { CMDS.open(); },
    clear()  { out.innerHTML = ''; },

    hack() {
      gap();
      const GLITCH = '!@#$%^&*<>[]{}|\\/?01ABCDEFx';
      const logs = [
        ['[>] Initiating connection to 192.168.0.1…',       'tln-dim'],
        ['[>] Port scan: 22 · 80 · 443 · 8080 — open',      'tln-ok' ],
        ['[>] Fingerprinting target OS: Linux 6.1 x86_64',   'tln-dim'],
        ['[!] CVE-2024-4421 — auth bypass detected',         'tln-err'],
        ['[>] Injecting payload → /etc/shadow',              'tln-err'],
        ['[>] SUID escalation → root shell acquired',        'tln-warn'],
        ['[>] Scanning /home/david …',                       'tln-dim'],
        ['[>] Exfiltrating: cv.txt  README.md  .bashrc',     'tln-dim'],
        ['[!] 3 credential files extracted',                 'tln-err'],
        ['[>] Wiping logs: /var/log/auth.log  /var/log/syslog', 'tln-dim'],
        ['[>] Backdoor installed → port 31337',              'tln-warn'],
        ['[✓] Persistence established',                      'tln-ok' ],
      ];
      let i = 0;
      function showLogs() {
        if (i < logs.length) {
          ln(logs[i][0], logs[i][1]);
          out.scrollTop = out.scrollHeight;
          i++;
          setTimeout(showLogs, 90 + Math.random() * 70);
        } else {
          gap();
          const TARGET = '██ ACCESS GRANTED ██';
          const hackEl = ln(
            TARGET.split('').map(() => GLITCH[~~(Math.random() * GLITCH.length)]).join(''),
            'tln-acc'
          );
          let frame = 0;
          const iv = setInterval(() => {
            hackEl.textContent = TARGET.split('').map((c, idx) =>
              frame > idx * 1.3 ? c : GLITCH[~~(Math.random() * GLITCH.length)]
            ).join('');
            if (++frame > TARGET.length * 1.8) {
              clearInterval(iv);
              hackEl.textContent = TARGET;
              gap();
              ln('Shell initialised  ·  user: david  ·  level: root', 'tln-ok');
              ln('All portfolio modules nominal.', 'tln-dim');
              gap();
              ln('> Type  open  to enter the portfolio.', 'tln-acc');
              gap();
            }
            out.scrollTop = out.scrollHeight;
          }, 45);
        }
      }
      setTimeout(showLogs, 80);
    },

    matrix() {
      gap();
      const CHARS = 'ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉｫｬｭｮｯｰ01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
      const COLS = 54;
      const ROWS = 22;
      const BRIGHT_ROW = Math.floor(ROWS * .4);
      let row = 0;
      function addRow() {
        if (row >= ROWS) {
          gap();
          ln('Wake up, Neo…', 'tln-acc');
          ln('The Matrix has you.', 'tln-dim');
          gap();
          return;
        }
        const dist = Math.abs(row - BRIGHT_ROW) / ROWS;
        const op   = (1 - dist * 1.2).toFixed(2);
        const col  = row === BRIGHT_ROW ? '#afffaf' : '#00ff41';
        const line = Array.from({ length: COLS }, () =>
          Math.random() > .32 ? CHARS[~~(Math.random() * CHARS.length)] : ' '
        ).join('');
        lnH(`<span style="color:${col};opacity:${op};font-size:.68em;letter-spacing:.04em">${line}</span>`);
        row++;
        setTimeout(addRow, 38);
        out.scrollTop = out.scrollHeight;
      }
      addRow();
    },

    sudo(args) {
      if (args && args.join(' ').includes('rm') && args.join(' ').includes('-rf')) {
        gap();
        const deletions = [
          '/bin/bash','usr/lib/systemd','etc/passwd','var/log','home/david',
          '/boot/vmlinuz','lib/x86_64-linux-gnu','usr/share/man','dev/null',
        ];
        let i = 0;
        const iv = setInterval(() => {
          if (i < deletions.length) {
            ln(`rm: removed '${deletions[i++]}'`, 'tln-err');
            out.scrollTop = out.scrollHeight;
          } else {
            clearInterval(iv);
            gap();
            ln('just kidding. portfolio intact.', 'tln-warn');
            gap();
            ln('[  OK  ] All systems nominal.', 'tln-ok');
            gap();
          }
        }, 180);
      } else {
        gap();
        ln('[sudo] password for david: ', 'tln-dim');
        ln('Sorry, try again.', 'tln-err');
        ln('[sudo] password for david: ', 'tln-dim');
        ln('Sorry, try again.', 'tln-err');
        ln('sudo: 3 incorrect password attempts', 'tln-err');
        gap();
        ln('  (portfolio mode — root access restricted)', 'tln-warn');
        gap();
      }
    },
    ls(args) {
      const path = (args[0] || '').replace(/\/$/,'');
      gap();
      if (!path || path === '~' || path === '.') {
        lnH(`<span class="tln-acc">total 48</span>`);
        lnH(`drwxr-xr-x  david  4096  Jun 2026  <span class="tln-acc">projects/</span>`);
        lnH(`drwxr-xr-x  david  4096  Jun 2026  <span class="tln-acc">certs/</span>`);
        lnH(`-rw-r--r--  david  2.1K  Jun 2026  README.md`);
        lnH(`-rw-r--r--  david   892  Jun 2026  cv.txt`);
        lnH(`-rw-r--r--  david   445  Jun 2026  contact.txt`);
        lnH(`-rw-r--r--  david    94  Jun 2026  <span class="tln-dim">.bashrc</span>`);
      } else if (path === 'projects') {
        const cats = [...new Set(Object.values(REPO_CAT))];
        lnH(cats.map(c => `<span class="tln-acc">${c}/</span>`).join('     '));
      } else if (path === 'certs') {
        lnH(`ccna-intro-networks.pdf    c1-advanced-english.pdf`);
      } else {
        ln(`ls: cannot access '${path}': No such file or directory`, 'tln-err');
      }
      gap();
    },
    cat(args) {
      const file = args[0] || '';
      gap();
      if (!file) { ln('usage: cat <file>', 'tln-err'); gap(); return; }
      if (file === 'README.md') {
        lnH(`<span class="tln-acc"># David Alvarez — Portfolio OS</span>`);
        ln(''); ln('IT Systems & Networks · Hospitalet · Barcelona');
        ln(''); lnH(`<span class="tln-acc">## Stack</span>`);
        ln('  Three.js · GSAP · HTML/CSS/JS · Kali Linux');
        ln(''); lnH(`<span class="tln-acc">## Links</span>`);
        lnH(`  github   →  <span class="tln-ok">github.com/misteralva</span>`);
        lnH(`  linkedin →  <span class="tln-ok">linkedin.com/in/davidalvarez1997</span>`);
        ln(''); lnH(`<span class="tln-dim">> "Learning never stops."</span>`);
      } else if (file === 'cv.txt') {
        lnH(`<span class="tln-acc">David Alvarez Fernández</span>`);
        ln('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'tln-sep');
        ln('Hospitalet · Barcelona  ·  imdavidalvarez@gmail.com');
        ln(''); lnH(`<span class="tln-acc">EDUCATION</span>`);
        ln('  CFGS ASIR + Cybersecurity  ·  In progress');
        ln(''); lnH(`<span class="tln-acc">EXPERIENCE</span>`);
        ln('  2023–2025  Operations Specialist  ·  Sthree, Barcelona');
        ln('  2022–2023  Player Relations Mgr   ·  Chronis Elite, NY');
        ln('  2022       Operations Trainee     ·  Carolina Esports');
        ln(''); lnH(`<span class="tln-acc">SKILLS</span>`);
        ln('  Networks · Linux · Cybersecurity · SAP · HTML/CSS/JS');
      } else if (file === 'contact.txt') {
        lnH(`email     <span class="tln-ok">imdavidalvarez@gmail.com</span>`);
        lnH(`linkedin  <span class="tln-ok">linkedin.com/in/davidalvarez1997</span>`);
        lnH(`github    <span class="tln-ok">github.com/misteralva</span>`);
        ln('location  Hospitalet · Barcelona · Spain');
      } else if (file === '.bashrc') {
        ln('# ~/.bashrc  —  david@DAVID-OS', 'tln-dim');
        lnH(`<span class="tln-acc">export</span> EDITOR=vim`);
        lnH(`<span class="tln-acc">alias</span> ll="ls -la"   ports="netstat -tuln"`);
        lnH(`<span class="tln-acc">alias</span> kali="cd ~/projects/Frontend"`);
        ln('PS1="\\[green\\]david@DAVID-OS\\[reset\\]:~$ "', 'tln-dim');
      } else {
        ln(`cat: ${file}: No such file or directory`, 'tln-err');
        ln('Available: README.md  cv.txt  contact.txt  .bashrc', 'tln-dim');
      }
      gap();
    },
    man(args) {
      const subject = args[0] || 'david';
      gap();
      if (subject === 'david') {
        lnH(`<span class="tln-acc">DAVID(1)              User Commands              DAVID(1)</span>`);
        ln('');
        lnH(`<span class="tln-acc">NAME</span>`);
        ln('       david — IT Systems & Networks professional · BCN');
        ln('');
        lnH(`<span class="tln-acc">SYNOPSIS</span>`);
        ln('       david [--networks] [--cybersec] [--sysadmin] [--frontend]');
        ln('');
        lnH(`<span class="tln-acc">DESCRIPTION</span>`);
        ln('       CFGS ASIR + Cybersecurity specialisation. CCNA in progress.');
        ln('       2 years international ops at Sthree (SAP, Salesforce, Mercury).');
        ln('       6 years in the US. C1 English. Kali Linux daily driver.');
        ln('');
        lnH(`<span class="tln-acc">OPTIONS</span>`);
        lnH(`       <span class="tln-ok">--networks</span>    TCP/IP · routing · VPN · Wireshark · Firewalls`);
        lnH(`       <span class="tln-ok">--cybersec</span>    Metasploit · Burp Suite · Nmap · Aircrack-ng`);
        lnH(`       <span class="tln-ok">--sysadmin</span>    Linux · Windows Server · Active Directory · Bash`);
        lnH(`       <span class="tln-ok">--frontend</span>    HTML/CSS/JS · Three.js · GSAP · PHP · SQL`);
        ln('');
        lnH(`<span class="tln-acc">AUTHOR</span>`);
        ln('       Written by david himself.   v2026.06');
      } else {
        ln(`No manual entry for ${subject}`, 'tln-err');
        ln('Try:  man david', 'tln-dim');
      }
      gap();
    },
    git(args) {
      const sub = (args[0] || 'log').toLowerCase();
      gap();
      if (sub === 'log') {
        lnH(`<span style="color:#f1e05a">commit a3f9c12</span>  feat: CRT monitor power-on transition`);
        lnH(`<span style="color:#f1e05a">commit b8e4d71</span>  feat: 3D interactive room · Three.js`);
        lnH(`<span style="color:#f1e05a">commit c2a17f9</span>  feat: category folders in projects desktop`);
        lnH(`<span style="color:#f1e05a">commit d5f3e88</span>  feat: boot terminal with real network cmds`);
        lnH(`<span style="color:#f1e05a">commit e9b2c44</span>  style: teal accent · dark OS aesthetic`);
        lnH(`<span style="color:#f1e05a">commit f1d3a08</span>  feat: Kali Linux projects page`);
        lnH(`<span style="color:#f1e05a">commit 07c4b22</span>  init: Portfolio OS concept`);
      } else if (sub === 'status') {
        lnH(`On branch <span class="tln-acc">main</span>`);
        ln("Your branch is up to date with 'origin/main'.");
        ln(''); ln('nothing to commit, working tree clean', 'tln-ok');
      } else if (sub === 'branch') {
        lnH(`* <span class="tln-acc">main</span>`);
        ln('  dev'); ln('  feature/3d-room', 'tln-dim');
      } else {
        ln(`git: '${sub}' is not a git command`, 'tln-err');
        ln('Try: git log · git status · git branch', 'tln-dim');
      }
      gap();
    },
    history() {
      gap();
      if (!_loaderHistory.length) { ln('(no history)', 'tln-dim'); gap(); return; }
      _loaderHistory.forEach((c, i) =>
        lnH(`  <span class="tln-dim">${String(i+1).padStart(3)}</span>  ${c}`)
      );
      gap();
    },

    curl(args) {
      const target = args[0] || 'imdavidalvarez.com';
      gap();
      ln(`> GET https://${target}`, 'tln-dim');
      ln('');
      lnH(`<span class="tln-ok">HTTP/2 200</span>  <span class="tln-dim">content-type: text/html; charset=utf-8</span>`);
      lnH(`<span class="tln-dim">x-powered-by: Three.js · GSAP · pure HTML/CSS/JS</span>`);
      lnH(`<span class="tln-dim">x-author: David Alvarez &lt;imdavidalvarez@gmail.com&gt;</span>`);
      ln('');
      lnH(`<span class="tln-acc">&lt;!-- DA.OS Portfolio --&gt;</span>`);
      lnH(`<span class="tln-dim">&lt;html</span> lang="en"<span class="tln-dim">&gt;</span>`);
      lnH(`  &lt;<span class="tln-ok">meta</span> name="author" content="<span class="tln-acc">David Alvarez</span>"&gt;`);
      lnH(`  &lt;<span class="tln-ok">meta</span> name="role"   content="<span class="tln-acc">IT Systems · Networks · BCN</span>"&gt;`);
      lnH(`  &lt;<span class="tln-ok">meta</span> name="stack"  content="<span class="tln-acc">Three.js GSAP HTML CSS JS</span>"&gt;`);
      lnH(`<span class="tln-dim">&lt;/html&gt;</span>`);
      gap();
    },

    date() {
      gap();
      ln(new Date().toString());
      gap();
    },

    uptime() {
      gap();
      const s = Math.floor((Date.now() - (window._bootTime || Date.now())) / 1000);
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      ln(`up ${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},  1 user,  load average: 0.42, 0.38, 0.31`);
      gap();
    },

    env() {
      gap();
      [
        ['USER',     'david'],
        ['HOME',     '/home/david'],
        ['SHELL',    '/bin/bash'],
        ['EDITOR',   'vim'],
        ['ROLE',     'IT Systems & Networks Administrator'],
        ['LOCATION', 'Hospitalet · Barcelona · Spain'],
        ['LANG',     'es_ES.UTF-8  EN_C1'],
        ['SKILLS',   'TCP/IP:VPN:Linux:Bash:Kali:JS:SQL'],
        ['CCNA',     'in_progress'],
        ['PATH',     '/usr/local/sbin:/usr/local/bin:/usr/bin:/bin'],
      ].forEach(([k, v]) =>
        lnH(`<span class="tln-acc">${k}</span>=<span class="tln-ok">${v}</span>`)
      );
      gap();
    },

    alias() {
      gap();
      [
        ["ll",     "ls -la"],
        ["la",     "ls -A"],
        ["ports",  "netstat -tuln"],
        ["kali",   "cd ~/projects/Security"],
        ["lab",    "sudo systemctl start lab-vm"],
        ["update", "sudo apt update && sudo apt upgrade -y"],
        ["gs",     "git status"],
        ["gl",     "git log --oneline"],
      ].forEach(([a, cmd]) =>
        lnH(`<span class="tln-acc">alias</span> ${a}='<span class="tln-dim">${cmd}</span>'`)
      );
      gap();
    },

    top() {
      const now = new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      gap();
      lnH(`<span class="tln-dim">top - ${now}  up ${Math.floor((Date.now()-(window._bootTime||Date.now()))/60000)}min,  1 user,  load avg: 0.42, 0.38, 0.31</span>`);
      lnH(`<span class="tln-dim">Tasks:  12 total,  1 running,  11 sleeping,  0 stopped</span>`);
      lnH(`<span class="tln-dim">%Cpu(s):  2.4 us,  0.8 sy,  0.0 ni, 96.2 id,  0.0 wa</span>`);
      lnH(`<span class="tln-dim">MiB Mem:  8192.0 total,  4821.3 free,  2341.2 used</span>`);
      ln('');
      lnH(`<span class="tln-dim">  PID  USER     PR  NI    VIRT    RES  %CPU  %MEM  COMMAND</span>`);
      lnH(`  <span class="tln-acc">1042</span>  david    20   0   512M   42M   <span class="tln-ok">2.4</span>   1.2   portfolio.js`);
      lnH(`  1847  www-data 20   0   128M   18M   0.8   0.5   nginx: worker`);
      lnH(`  2134  david    20   0    68M    8M   0.2   0.2   node server.js`);
      lnH(`  3021  root     20   0    12M    4M   0.0   0.1   sshd`);
      lnH(`  <span class="tln-ok">4402</span>  david    20   0     8M    2M   0.0   0.1   top`);
      ln('');
      ln('press q to quit — demo mode only', 'tln-dim');
      gap();
    },

    vim(args) {
      const file = args[0] || 'cv.txt';
      gap();
      lnH(`<span class="tln-dim">  vim — ${file}</span>`);
      ln('──────────────────────────────────────────────', 'tln-sep');
      if (file === 'cv.txt') {
        lnH(`<span class="tln-acc">David Alvarez Fernández</span>`);
        ln('');
        ln('  IT Systems & Networks Administrator');
        ln('  Hospitalet · Barcelona  ·  imdavidalvarez@gmail.com');
        ln('');
        lnH(`  <span class="tln-ok">EDUCATION</span>`);
        ln('  CFGS ASIR + Cybersecurity specialisation  (in progress)');
        ln('  CCNA: Introduction to Networks  (in progress)');
        ln('');
        lnH(`  <span class="tln-ok">EXPERIENCE</span>`);
        ln('  2023–25  Operations Specialist · Sthree Spain · BCN');
        ln('  2022–23  Player Relations Mgr  · Chronis Elite · NY');
        ln('  2022     Operations Trainee    · Carolina Esports');
        ln('');
        lnH(`  <span class="tln-ok">SKILLS</span>  TCP/IP · Linux · Kali · Wireshark · SAP · JS`);
      } else if (file === 'README.md') {
        CMDS.cat(['README.md']); return;
      } else {
        lnH(`<span class="tln-dim">"${file}" [New File]</span>`);
      }
      ln('──────────────────────────────────────────────', 'tln-sep');
      lnH(`<span class="tln-dim">:q  quit · :wq  save&quit · i  insert · /  search</span>`);
      gap();
    },

    nano(args) { CMDS.vim(args); },

    pwd() {
      gap();
      ln('/home/david');
      gap();
    },

    exit() {
      gap();
      ln('logout', 'tln-dim');
      ln('There is no escape from the simulation.', 'tln-warn');
      gap();
    },

  };

  const _loaderHistory = [];
  let _loaderHistIdx = -1;
  const CMD_LIST = Object.keys(CMDS).filter((k,i,a) => a.indexOf(k) === i).sort();

  function exec(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);
    lnH(`<span class="tln-sym">david@DAVID-OS:~$&nbsp;</span>` +
        `<span class="tln-cmd">${raw.trim() || ''}</span>`);
    if (!cmd) return;
    if (raw.trim()) _loaderHistory.push(raw.trim());
    if (CMDS[cmd]) { CMDS[cmd](args); return; }
    gap();
    ln(`bash: ${cmd}: command not found`, 'tln-err');
    ln('Type  help  for commands, or  open  to enter.', 'tln-dim');
    gap();
  }

  
  inp.addEventListener('keydown', e => {
    SFX.keyclick();
    if (e.key === 'Enter' || e.keyCode === 13) {
      const v = inp.value;
      inp.value = '';
      _loaderHistIdx = -1;
      exec(v);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!_loaderHistory.length) return;
      _loaderHistIdx = Math.min(_loaderHistIdx + 1, _loaderHistory.length - 1);
      inp.value = _loaderHistory[_loaderHistory.length - 1 - _loaderHistIdx];
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (_loaderHistIdx <= 0) { _loaderHistIdx = -1; inp.value = ''; return; }
      _loaderHistIdx--;
      inp.value = _loaderHistory[_loaderHistory.length - 1 - _loaderHistIdx];
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const prefix = inp.value.toLowerCase();
      if (!prefix) return;
      const match = CMD_LIST.find(c => c.startsWith(prefix));
      if (match) inp.value = match;
    }
  });

  
  const BOOT = [
    {t:0,   text:'Linux DAVID-OS 6.1.0-amd64 #1 SMP PREEMPT_DYNAMIC', cls:'tln-dim'},
    {t:120, text:'[  OK  ] Starting udev event manager',              cls:'tln-ok'},
    {t:240, text:'[  OK  ] Configuring network interfaces [eth0]',    cls:'tln-ok'},
    {t:360, text:'[  OK  ] Starting OpenSSH daemon',                  cls:'tln-ok'},
    {t:480, text:'[  OK  ] Mounting /dev/portfolio at /desktop',      cls:'tln-ok'},
    {t:600, text:''},
    {t:680, text:'────────────────────────────────────────────────────', cls:'tln-sep'},
    {t:760, text:'  DA. Portfolio Terminal   v1.0.0',                  cls:'tln-acc'},
    {t:840, text:'────────────────────────────────────────────────────', cls:'tln-sep'},
    {t:920, text:''},
    {t:1000,text:'Welcome. Type  help  to explore, or  open  to enter.'},
    {t:1080,text:''},
  ];
  BOOT.forEach(({t, text, cls}) => setTimeout(() => ln(text, cls || ''), t));
  setTimeout(() => inp && inp.focus(), 1100);
}

function startClock() {
  const timeEl = document.getElementById('mb-time');
  const dateEl = document.getElementById('mb-date');
  const tick = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
  };
  tick();
  setInterval(tick, 1000);
}

function initTyped() {
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = ['Systems Administrator','Network Infrastructure','IT Operations','Cybersecurity'];
  let pi = 0, ci = 0, del = false;
  function tick() {
    const p = phrases[pi];
    el.textContent = del ? p.slice(0, --ci) : p.slice(0, ++ci);
    if (!del && ci === p.length) { del = true; setTimeout(tick, 2400); return; }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    setTimeout(tick, del ? 36 : 72);
  }
  setTimeout(tick, 1400);
}

function wrapLetters(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(node => {
    const frag = document.createDocumentFragment();
    for (const ch of node.textContent) {
      const s = document.createElement('span');
      s.className = ch.trim() ? 'dhl' : 'dhl-sp';
      s.textContent = ch.trim() ? ch : ' ';
      frag.appendChild(s);
    }
    node.parentNode.replaceChild(frag, node);
  });
}

function desktopEntrance() {
  
  SFX.enterDesktop();
  const bgImg = document.getElementById('desktop-bg-img');

  if (!window._fromProjects) {
    const wipe = document.getElementById('crt-wipe');
    if (wipe) {
      
      if (bgImg) { bgImg.classList.add('on'); bgImg.classList.add('sweeping'); }
      wipe.classList.add('sweep');
      setTimeout(() => {
        wipe.classList.remove('sweep');
        if (bgImg) {
          bgImg.classList.remove('sweeping');
          bgImg.style.clipPath = 'inset(0 0 0% 0)';
        }
      }, 650);
    }
  } else {
    
    if (bgImg) { bgImg.classList.add('on'); bgImg.style.clipPath = 'inset(0 0 0% 0)'; }
  }

  gsap.to('#menubar', { opacity:1, duration:.5, ease:'power2.out' });
  gsap.to('#dock',    { opacity:1, y:0, duration:.7, ease:'power3.out', delay:.25 });

  
  setTimeout(() => {
    document.getElementById('aurora')?.classList.add('on');
    document.getElementById('starfield')?.classList.add('on');
  }, 600);

  gsap.set('.dhn', { opacity:1 });
  const letters = [...document.querySelectorAll('.dhl')];
  gsap.set(letters, { opacity:0, y:'0.65em', rotateX:-22, filter:'blur(10px)' });

  gsap.timeline({ delay:.35 })
    .to(letters, {
      opacity:1, y:0, rotateX:0, filter:'blur(0px)',
      duration:.68,
      stagger:{ amount:.58, from:'start' },
      ease:'power3.out',
      onComplete() {
        const h = document.getElementById('desk-hero');
        if (h) h.style.pointerEvents = 'auto';
      }
    }, '-=.3')
    
    .fromTo('.dh-name', {
      filter: 'drop-shadow(6px 0 rgba(255,55,80,.82)) drop-shadow(-6px 0 rgba(100,255,218,.82))'
    }, {
      filter: 'none',
      duration: .52,
      ease: 'power2.out'
    }, '-=.18')
    .to('.dh-sub', { opacity:1, duration:.55, ease:'power2.out' }, '-=.28');

  setTimeout(() => openWindow('about'), 1600);

  
  setTimeout(() => {
    gsap.to('#desk-hero', {
      top: '14vh',
      scale: 0.72,
      opacity: 0.65,
      duration: 1.8,
      ease: 'power3.inOut',
      onComplete() {
        const h = document.getElementById('desk-hero');
        if (h) h.style.pointerEvents = 'auto';
      }
    });
  }, 2600);

  
  setTimeout(() => window._ssReady?.(), 4600);
}

function getWin(id) { return document.getElementById('win-' + id); }

function bringToFront(id) {
  const win = getWin(id);
  if (!win) return;
  zTop++;
  win.style.zIndex = zTop;
  document.querySelectorAll('.win').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
}

function openWindow(id) {
  const win = getWin(id);
  if (!win) return;
  if (!winState[id]) winState[id] = { open:false };

  if (winState[id].open) { bringToFront(id); return; }

  const w = WIN_W[id] || 700;
  const h = WIN_H[id] || 480;
  const stagger = { about:[0,0], skills:[56,36], certs:[44,22], experience:[28,18], projects:[18,28], contact:[80,8], 'project-detail':[30,30], terminal:[60,42] };
  const [ox, oy] = stagger[id] || [0, 0];
  const x = Math.max(16, (window.innerWidth  - w) / 2 + ox - 30);
  const y = Math.max(40, (window.innerHeight - h) / 2 + oy - 20);

  win.style.left = x + 'px';
  win.style.top  = y + 'px';
  win.classList.add('open');
  winState[id].open = true;

  
  const dockItem = document.querySelector(`.di[data-win="${id}"]`);
  const dr = dockItem ? dockItem.getBoundingClientRect() : null;
  const dockCX = dr ? dr.left + dr.width  / 2 : x + w / 2;
  const dockCY = dr ? dr.top  + dr.height / 2 : window.innerHeight - 50;

  const originX = ((dockCX - x) / w * 100).toFixed(1);
  const originY = ((dockCY - y) / h * 100).toFixed(1);

  gsap.set(win, { transformOrigin: `${originX}% ${originY}%`, scale: 0.06, opacity: 0, y: 18, filter: 'blur(8px)' });
  gsap.to(win, {
    scale: 1, opacity: 1, y: 0, filter: 'blur(0px)',
    duration: 0.52, ease: 'back.out(1.55)',
    onComplete() {
      gsap.set(win, { transformOrigin: '50% 50%', clearProps: 'scale,opacity,y,filter' });
      win.classList.add('opening');
      setTimeout(() => win.classList.remove('opening'), 560);
    }
  });

  bringToFront(id);
  setDockActive(id, true);

  if (id === 'projects' && document.querySelector('.proj-loading')) loadGitHub();

  if (id === 'experience') setTimeout(animateExperience, 180);
  if (id === 'terminal')   setTimeout(startTerminal, 220);
  if (id === 'about') setTimeout(() => {
    const frame = document.querySelector('.profile-pic-frame');
    if (frame) { frame.classList.remove('pic-anim'); void frame.offsetWidth; frame.classList.add('pic-anim'); }
  }, 150);
}

function closeWindow(id) {
  const win = getWin(id);
  if (!win || !winState[id]?.open) return;
  if (id === 'terminal') stopTerminal();
  if (id === 'skills')   stopSkillsConstellation();
  gsap.to(win, {
    opacity:0, scale:.91, y:8, filter:'blur(3px)', duration:.22, ease:'power2.in',
    onComplete() {
      win.classList.remove('open');
      winState[id].open = false;
      gsap.set(win, { filter:'none', clearProps:'filter' });
    }
  });
  setDockActive(id, false);
}

function minimizeWindow(id) {
  const win = getWin(id);
  if (!win || !winState[id]?.open) return;
  const dock = document.querySelector(`.di[data-win="${id}"]`);
  const dr = dock ? dock.getBoundingClientRect() : { left:window.innerWidth/2, top:window.innerHeight-60, width:50 };
  const wr = win.getBoundingClientRect();

  
  const dockCX2 = dr.left + dr.width  / 2;
  const dockCY2 = dr.top  + dr.height / 2;
  const originX2 = ((dockCX2 - wr.left) / wr.width  * 100).toFixed(1);
  const originY2 = ((dockCY2 - wr.top)  / wr.height * 100).toFixed(1);

  gsap.set(win, { transformOrigin: `${originX2}% ${originY2}%` });
  gsap.to(win, {
    scale: 0, opacity: 0,
    duration: 0.38, ease: 'back.in(1.2)',
    onComplete() {
      win.classList.remove('open');
      winState[id].open = false;
      gsap.set(win, { clearProps: 'all' });
    }
  });

  setDockActive(id, false);
}

function maximizeWindow(id) {
  const win = getWin(id);
  if (!win) return;
  if (win.dataset.maxed) {
    gsap.to(win, {
      left:  parseFloat(win.dataset.ox),
      top:   parseFloat(win.dataset.oy),
      width: parseFloat(win.dataset.ow),
      height:parseFloat(win.dataset.oh),
      duration:.3, ease:'power3.out'
    });
    delete win.dataset.maxed;
  } else {
    win.dataset.ox = win.offsetLeft;
    win.dataset.oy = win.offsetTop;
    win.dataset.ow = win.offsetWidth;
    win.dataset.oh = win.offsetHeight;
    gsap.to(win, {
      left:16, top:40,
      width:  window.innerWidth  - 32,
      height: window.innerHeight - 66,
      duration:.3, ease:'power3.out'
    });
    win.dataset.maxed = '1';
  }
}

function toggleWindow(id) {
  if (winState[id]?.open) closeWindow(id);
  else openWindow(id);
}

function setDockActive(id, active) {
  const di = document.querySelector(`.di[data-win="${id}"]`);
  if (di) di.classList.toggle('active', active);
}

function initMobileOverlay() {
  const overlay = document.getElementById('mobile-overlay');
  if (!overlay) return;
  const wEl = document.getElementById('mob-width');
  if (wEl) wEl.textContent = window.innerWidth;
  document.getElementById('mob-continue')?.addEventListener('click', () => {
    overlay.classList.add('mob-hidden');
  });
}

function initResize() {
  let resizing = null, startX = 0, startY = 0, startW = 0, startH = 0;
  const MIN_W = 320, MIN_H = 200;

  document.querySelectorAll('.win').forEach(win => {
    const h = document.createElement('div');
    h.className = 'win-resize-handle';
    h.setAttribute('aria-hidden', 'true');
    win.appendChild(h);
    h.addEventListener('mousedown', e => {
      e.stopPropagation(); e.preventDefault();
      resizing = win;
      startX = e.clientX; startY = e.clientY;
      startW = win.offsetWidth; startH = win.offsetHeight;
      bringToFront(win.id.replace('win-', ''));
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';
    });
  });

  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    const maxW = window.innerWidth  - resizing.offsetLeft - 8;
    const maxH = window.innerHeight - resizing.offsetTop  - 8;
    resizing.style.width  = Math.max(MIN_W, Math.min(maxW, startW + (e.clientX - startX))) + 'px';
    resizing.style.height = Math.max(MIN_H, Math.min(maxH, startH + (e.clientY - startY))) + 'px';
    delete resizing.dataset.snapped;
  });

  document.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  });
}

function initDragging() {
  let dragging = null, ox = 0, oy = 0;
  let _snapZone = null;
  const SNAP_PX  = 22;
  const MB_H     = 38;
  const DOCK_H   = 72;
  const snapPrev = document.getElementById('snap-prev');

  function showSnap(zone) {
    if (!snapPrev) return;
    const W = window.innerWidth, H = window.innerHeight;
    const h = H - MB_H - DOCK_H;
    const styles = {
      left:  `left:0;top:${MB_H}px;width:${W/2}px;height:${h}px`,
      right: `left:${W/2}px;top:${MB_H}px;width:${W/2}px;height:${h}px`,
      max:   `left:0;top:${MB_H}px;width:${W}px;height:${h}px`,
    };
    snapPrev.style.cssText = `display:block;${styles[zone]}`;
  }
  function hideSnap() { if (snapPrev) snapPrev.style.display = 'none'; }

  document.querySelectorAll('.win-chrome[data-drag]').forEach(chrome => {
    const id  = chrome.dataset.drag;
    const win = getWin(id);
    if (!win) return;

    const startDrag = (cx, cy) => {
      if (win.dataset.snapped) {
        const sw = parseFloat(win.dataset.snapW) || WIN_W[id] || 700;
        const sh = parseFloat(win.dataset.snapH) || WIN_H[id] || 480;
        const nx = Math.max(0, cx - sw / 2);
        win.style.width  = sw + 'px';
        win.style.height = sh + 'px';
        win.style.left   = nx + 'px';
        win.style.top    = MB_H + 'px';
        delete win.dataset.snapped;
        ox = cx - nx;
        oy = 18;
      } else {
        ox = cx - win.offsetLeft;
        oy = cy - win.offsetTop;
      }
      dragging = win;
      bringToFront(id);
      document.body.style.userSelect = 'none';
    };

    chrome.addEventListener('mousedown', e => {
      if (e.target.classList.contains('wb') || e.target.closest('.win-chrome-r')) return;
      startDrag(e.clientX, e.clientY);
    });
    chrome.addEventListener('touchstart', e => {
      if (e.target.classList.contains('wb')) return;
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }, { passive:false });
  });

  const move = (cx, cy) => {
    if (!dragging) return;
    const nx = Math.max(-dragging.offsetWidth + 80, Math.min(window.innerWidth  - 80, cx - ox));
    const ny = Math.max(MB_H, Math.min(window.innerHeight - 50, cy - oy));
    dragging.style.left = nx + 'px';
    dragging.style.top  = ny + 'px';

    if      (cx < SNAP_PX)                         { _snapZone = 'left';  showSnap('left');  }
    else if (cx > window.innerWidth  - SNAP_PX)    { _snapZone = 'right'; showSnap('right'); }
    else if (cy < MB_H + SNAP_PX)                  { _snapZone = 'max';   showSnap('max');   }
    else                                            { _snapZone = null;    hideSnap();        }
  };

  const end = () => {
    hideSnap();
    if (dragging && _snapZone) {
      const W   = window.innerWidth, H = window.innerHeight;
      const h   = H - MB_H - DOCK_H;
      const id  = dragging.id.replace('win-', '');
      dragging.dataset.snapW = dragging.offsetWidth;
      dragging.dataset.snapH = dragging.offsetHeight;
      if (_snapZone === 'max') {
        delete dragging.dataset.snapped;
        maximizeWindow(id);
      } else {
        dragging.dataset.snapped = _snapZone;
        const props = _snapZone === 'left'
          ? { left:0,    top:MB_H, width:W/2, height:h }
          : { left:W/2,  top:MB_H, width:W/2, height:h };
        gsap.to(dragging, { ...props, duration:.2, ease:'power3.out' });
      }
      _snapZone = null;
    }
    dragging = null;
    document.body.style.userSelect = '';
  };

  document.addEventListener('mousemove', e => move(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => { move(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive:false });
  document.addEventListener('mouseup',  end);
  document.addEventListener('touchend', end);

  document.addEventListener('mousedown', e => { if (e.target.closest('.win-chrome')) document.body.dataset.dragging = '1'; });
  document.addEventListener('mouseup',   () => { delete document.body.dataset.dragging; });

  document.querySelectorAll('.win').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win.id.replace('win-', '')));
  });
}

function initControls() {
  document.querySelectorAll('.wb[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.win;
      if (btn.dataset.action === 'close') closeWindow(id);
      if (btn.dataset.action === 'min')   minimizeWindow(id);
      if (btn.dataset.action === 'max')   maximizeWindow(id);
    });
  });

  // Double-click title bar to maximise / restore
  document.querySelectorAll('.win-chrome[data-drag]').forEach(bar => {
    bar.addEventListener('dblclick', e => {
      if (e.target.closest('.win-btns, .wb')) return;
      maximizeWindow(bar.dataset.drag);
    });
  });

  document.querySelectorAll('.di[data-win]').forEach(di => {
    di.addEventListener('click', () => toggleWindow(di.dataset.win));
  });

  document.querySelectorAll('.mb-item[data-win]').forEach(item => {
    item.addEventListener('click', () => openWindow(item.dataset.win));
  });
}

function initSidebarTabs() {
  const sidebar = document.querySelector('#win-about .win-sidebar');
  if (!sidebar) return;
  sidebar.querySelectorAll('.ws-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('.ws-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const current = document.querySelector('#win-about .wc-pane.active');
      const target  = document.getElementById('pane-' + btn.dataset.section);
      if (current === target) return;
      if (current) {
        gsap.to(current, { opacity:0, y:-5, duration:.14, ease:'power2.in', onComplete() {
          current.classList.remove('active');
          if (target) {
            target.classList.add('active');
            gsap.fromTo(target, { opacity:0, y:6 }, { opacity:1, y:0, duration:.2, ease:'power2.out' });
          }
        }});
      } else if (target) {
        document.querySelectorAll('#win-about .wc-pane').forEach(p => p.classList.remove('active'));
        target.classList.add('active');
        gsap.fromTo(target, { opacity:0, y:6 }, { opacity:1, y:0, duration:.2, ease:'power2.out' });
      }
    });
  });
}

function initValidation() {
  const rules = {
    fn: v => v.trim().length >= 2 ? '' : 'Name must be at least 2 characters',
    fe: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Invalid email address',
    fm: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters',
  };
  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    const fg = el?.closest('.fg');
    if (!el || !fg) return;
    const err = fg.querySelector('.ferr');
    el.addEventListener('blur',  () => { const m = rules[id](el.value); err.textContent = m; fg.style.borderBottomColor = m ? '#ff6b6b' : ''; });
    el.addEventListener('input', () => { if (err.textContent) { const m = rules[id](el.value); err.textContent = m; fg.style.borderBottomColor = m ? '#ff6b6b' : ''; } });
  });
}

const SKILL_LEVELS = {
  'TCP/IP':88,'DNS Â· DHCP':82,'VPN':78,'Routing':85,'Wireshark':74,'Firewalls':80,
  'Linux':86,'Win Server':80,'Active Dir.':76,'Bash Â· SSH':80,'MacOS':68,
  'SAP ERP':88,'Salesforce':82,'Mercury':74,'Cisco PT':78,'Git':76,
  'HTML5':72,'CSS3':68,'JavaScript':65,'PHP':58,'SQL':70
};

let _skillsAnimId = null;

function initSkillsConstellation() {
  const canvas = document.getElementById('skills-canvas');
  if (!canvas) return;

  const NODES = [

    { label:'TCP/IP',     x:.13, y:.18, cat:0, r:7 },
    { label:'DNS / DHCP', x:.24, y:.34, cat:0, r:6 },
    { label:'VPN',        x:.08, y:.44, cat:0, r:5 },
    { label:'Routing',    x:.22, y:.20, cat:0, r:6 },
    { label:'Firewalls',  x:.17, y:.56, cat:0, r:6 },
    { label:'Wireshark',  x:.30, y:.46, cat:0, r:5 },

    { label:'Linux',      x:.72, y:.16, cat:1, r:7 },
    { label:'Win Server', x:.82, y:.30, cat:1, r:6 },
    { label:'Active Dir', x:.68, y:.38, cat:1, r:5 },
    { label:'Bash / SSH', x:.78, y:.48, cat:1, r:6 },
    { label:'MacOS',      x:.88, y:.20, cat:1, r:5 },

    { label:'SAP',        x:.15, y:.72, cat:2, r:6 },
    { label:'Salesforce', x:.28, y:.82, cat:2, r:6 },
    { label:'Mercury',    x:.10, y:.87, cat:2, r:5 },
    { label:'Cisco PT',   x:.32, y:.68, cat:2, r:6 },
    { label:'Git',        x:.22, y:.92, cat:2, r:5 },

    { label:'HTML5',      x:.70, y:.72, cat:3, r:6 },
    { label:'CSS3',       x:.80, y:.83, cat:3, r:5 },
    { label:'JavaScript', x:.86, y:.67, cat:3, r:7 },
    { label:'PHP',        x:.73, y:.88, cat:3, r:5 },
    { label:'SQL',        x:.90, y:.80, cat:3, r:5 },
  ];

  const EDGES = [

    [0,1],[0,3],[1,2],[1,4],[3,5],[4,5],

    [6,7],[6,8],[7,9],[8,9],[6,10],

    [11,12],[11,14],[12,13],[13,14],[12,15],

    [16,18],[17,18],[18,19],[16,17],[19,20],

    [9,6],[0,3],[14,18],[11,16],
  ];

  const CAT_COLORS = [
    'rgba(100,255,218,',
    'rgba(100,200,255,',
    'rgba(255,200,100,',
    'rgba(180,120,255,',
  ];

  const CAT_LABELS = [
    { text:'Networks & Systems', cx:.18, cy:.07 },
    { text:'OS & Admin',         cx:.78, cy:.07 },
    { text:'Tools',              cx:.18, cy:.62 },
    { text:'Development',        cx:.78, cy:.62 },
  ];

  let hovered = -1;
  let t = 0;
  let W, H;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
  }

  resize();
  const resObs = new ResizeObserver(resize);
  resObs.observe(canvas);

  const ctx = canvas.getContext('2d');

  function nodeX(n, i) { return (n.x + Math.sin(t * 0.4 + i * 1.2) * 0.012) * W; }
  function nodeY(n, i) { return (n.y + Math.cos(t * 0.35 + i * 0.9) * 0.010) * H; }

  function draw() {
    _skillsAnimId = requestAnimationFrame(draw);
    t += 0.016;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, W, H);

    CAT_LABELS.forEach(function(cl, ci) {
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.letterSpacing = '2px';
      ctx.fillStyle = CAT_COLORS[ci] + '0.35)';
      ctx.fillText(cl.text.toUpperCase(), cl.cx * W, cl.cy * H);
    });

    EDGES.forEach(function(e) {
      var a = NODES[e[0]], b = NODES[e[1]];
      var ax = nodeX(a, e[0]), ay = nodeY(a, e[0]);
      var bx = nodeX(b, e[1]), by = nodeY(b, e[1]);
      var isHot = (e[0] === hovered || e[1] === hovered);
      var alpha = isHot ? (0.5 + Math.sin(t * 2.5) * 0.15) : (0.07 + Math.sin(t * 1.2 + e[0]) * 0.025);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(100,255,218,' + alpha + ')';
      ctx.lineWidth   = isHot ? 1.2 : 0.7;
      ctx.stroke();
    });

    NODES.forEach(function(n, i) {
      var nx  = nodeX(n, i);
      var ny  = nodeY(n, i);
      var hot = (i === hovered);
      var col = CAT_COLORS[n.cat];
      var pulse = 1 + Math.sin(t * 1.8 + i * 0.7) * 0.08;
      var r = n.r * pulse;

      var gA = hot ? 0.22 : 0.08;
      var grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 4);
      grad.addColorStop(0, col + gA + ')');
      grad.addColorStop(1, col + '0)');
      ctx.beginPath();
      ctx.arc(nx, ny, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle   = col + (hot ? '0.9)' : '0.55)');
      ctx.fill();
      ctx.strokeStyle = col + (hot ? '1)' : '0.7)');
      ctx.lineWidth   = hot ? 1.5 : 0.8;
      ctx.stroke();

      ctx.font = hot
        ? 'bold 9.5px "JetBrains Mono", monospace'
        : '9px "JetBrains Mono", monospace';
      ctx.fillStyle = hot
        ? col + '1)'
        : 'rgba(232,230,240,' + (hot ? '0.9' : '0.5') + ')';
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, nx, ny + r + 13);
    });
    ctx.textAlign = 'left';
    ctx.letterSpacing = '0px';
  }

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx   = e.clientX - rect.left;
    var my   = e.clientY - rect.top;
    var prev = hovered;
    hovered  = -1;
    NODES.forEach(function(n, i) {
      var nx = nodeX(n, i), ny = nodeY(n, i);
      var d  = Math.hypot(mx - nx, my - ny);
      if (d < n.r + 14) hovered = i;
    });
    canvas.style.cursor = hovered !== -1 ? 'pointer' : '';
    if (hovered !== prev && hovered !== -1) {
      openWindow(NODES[hovered].cat === 0 ? 'skills' :
                 NODES[hovered].cat === 1 ? 'skills' :
                 NODES[hovered].cat === 2 ? 'skills' : 'skills');
    }
  });
  canvas.addEventListener('mouseleave', function() { hovered = -1; canvas.style.cursor = ''; });

  if (_skillsAnimId) cancelAnimationFrame(_skillsAnimId);
  draw();
}

function stopSkillsConstellation() {
  if (_skillsAnimId) { cancelAnimationFrame(_skillsAnimId); _skillsAnimId = null; }
  const resObs = document.getElementById('skills-canvas')?._resObs;
  if (resObs) resObs.disconnect();
}

function initSkillBars() {
  const SKILL_LEVELS = {
    'TCP/IP':88,'DNS · DHCP':82,'VPN':78,'Routing':85,'Wireshark':74,'Firewalls':80,
    'Linux':86,'Win Server':80,'Active Dir.':76,'Bash · SSH':80,'MacOS':68,
    'SAP ERP':88,'Salesforce':82,'Mercury':74,'Cisco PT':78,'Git':76,
    'HTML5':72,'CSS3':68,'JavaScript':65,'PHP':58,'SQL':70
  };
  document.querySelectorAll('.skill-item').forEach(item => {
    const label = item.querySelector('span:last-child')?.textContent?.trim()
                ?? item.querySelector('.si-text')?.textContent?.trim();
    const level = SKILL_LEVELS[label] ?? 72;
    const bar = document.createElement('div');
    bar.className = 'skill-bar';
    bar.dataset.level = level + '%';
    item.appendChild(bar);
    const pct = document.createElement('span');
    pct.className = 'skill-pct';
    pct.textContent = level + '%';
    item.appendChild(pct);
  });
}

function animateSkillBars() {
  document.querySelectorAll('.skill-bar').forEach((bar, i) => {
    setTimeout(() => { bar.style.width = bar.dataset.level; }, i * 35);
  });
}

function animateExperience() {
  gsap.fromTo('.exp-item',
    { opacity:0, x:-18 },
    { opacity:1, x:0, duration:.55, stagger:.14, ease:'power2.out' }
  );
}

function initForm() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('imdavidalvarez@gmail.com').then(() => {
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.classList.add('copied');
        showToast('fas fa-envelope', 'Email copied!', 'imdavidalvarez@gmail.com');
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  const form = document.getElementById('c-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = document.getElementById('fbtn');
    const st   = document.getElementById('fstatus');
    const orig = btn.innerHTML;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const r = await fetch('https://formsubmit.co/ajax/imdavidalvarez@gmail.com', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify({
          name:    document.getElementById('fn').value,
          email:   document.getElementById('fe').value,
          message: document.getElementById('fm').value,
          _subject:'Portfolio - New contact message',
        })
      });
      if (r.ok) { st.textContent = 'Message sent!'; st.className = 'fstatus ok'; form.reset(); window._favCheck?.(); }
      else throw 0;
    } catch {
      st.textContent = 'Error - try imdavidalvarez@gmail.com';
      st.className = 'fstatus err';
    }
    btn.innerHTML = orig;
    btn.disabled = false;
    setTimeout(() => { st.textContent = ''; st.className = 'fstatus'; }, 7000);
  });
}

const LC = { JavaScript:'#e8c832', HTML:'#d94020', CSS:'#6a4c9c', Python:'#2e6da4', TypeScript:'#2b6cb0', Shell:'#5aad2e', Vue:'#42b883', React:'#61dafb', PHP:'#7b7fb5', Ruby:'#cc342d', Go:'#00acd7', Rust:'#dea584' };
const FB = [
  { name:'CV-Template',     description:'Personal portfolio/CV template built with HTML, CSS and JavaScript. Based on the misteralva.github.io design.', html_url:'https://github.com/misteralva/CV-Template', language:'JavaScript', stargazers_count:0, topics:['html','css','js','portfolio'], homepage:null },
  { name:'Web-StarterKit',  description:'Modular web starter kit with frontend best practices and clean project structure.',     html_url:'https://github.com/misteralva/Web-StarterKit',  language:'HTML',       stargazers_count:0, topics:['html','css','js'],       homepage:null },
  { name:'GSAP-Actividad',  description:'Advanced GSAP animations, scroll effects, timeline sequences and smooth transitions.', html_url:'https://github.com/misteralva/GSAP-Actividad',  language:'JavaScript', stargazers_count:0, topics:['gsap','scroll'],         homepage:null },
  { name:'GSAP-Practica',   description:'Motion design with GSAP: TextPlugin, morphSVG, staggered animations and visual effects.', html_url:'https://github.com/misteralva/GSAP-Practica', language:'JavaScript', stargazers_count:0, topics:['gsap','animation'],      homepage:null },
];

async function loadGitHub() {
  try {
    const r = await fetch('https://api.github.com/users/misteralva/repos?sort=updated&per_page=100');
    if (!r.ok) throw 0;
    const repos = (await r.json()).filter(r => !r.fork && r.name !== 'misteralva');
    if (!repos.length) throw 0;
    renderCards(repos, true);
  } catch { renderCards(FB, false); }
}

function renderCards(repos, live) {
  const grid = document.getElementById('proj-grid');
  grid.innerHTML = '';
  repos.forEach((repo, i) => {
    const card   = document.createElement('article');
    const lc     = LC[repo.language] || '#6e7a9f';
    const topics = (repo.topics || []).slice(0, 4);

    const codeColors = [lc, 'rgba(255,255,255,.22)', lc + '99', 'rgba(255,255,255,.15)', lc + '55'];
    const codeWidths = ['64%', '42%', '78%', '35%', '54%'];
    const codeLinesHtml = `<div class="proj-code-lines">${
      codeColors.map((c, k) => `<div class="pcl" style="background:${c};width:${codeWidths[k]}"></div>`).join('')
    }</div>`;

    card.className = 'proj-card';
    card.innerHTML = `
      <div class="proj-preview" style="background:${lc}">
        ${codeLinesHtml}
        <span class="proj-lang-mark">${repo.language || 'CODE'}</span>
      </div>
      <div class="proj-inner">
        <h3 class="proj-name">${repo.name.replace(/-/g, ' ')}</h3>
        <p class="proj-desc">${repo.description || 'No description.'}</p>
        ${topics.length ? `<div class="proj-tags">${topics.map(t => `<span class="proj-tag">${t}</span>`).join('')}</div>` : ''}
        <footer class="proj-foot">
          <div class="proj-lang">
            ${repo.language ? `<span class="proj-lang-dot" style="background:${lc}"></span><span class="mono">${repo.language}</span>` : ''}
            ${repo.stargazers_count ? `<span class="proj-stars mono" style="margin-left:10px">★ ${repo.stargazers_count}</span>` : ''}
          </div>
          <div class="proj-icon-btns">
            <a href="${repo.html_url}" target="_blank" rel="noopener" aria-label="View on GitHub" class="proj-icon-btn" title="GitHub"><i class="fab fa-github"></i></a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener" aria-label="Live Demo" class="proj-icon-btn proj-icon-btn-acc" title="Live Demo"><i class="fas fa-arrow-up-right-from-square"></i></a>` : ''}
          </div>
        </footer>
      </div>`;

    grid.appendChild(card);
    addHover(card.querySelectorAll('a'));

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });

    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openProjectDetail(repo, lc);
    });
  });
}

function goToProjects() {
  const mon  = document.getElementById('monitor-on');
  const line = mon?.querySelector('.mon-line');

  SFX.enterProjects();
  const navigate = () => { window.location.href = 'projects.html'; };
  if (!mon || typeof gsap === 'undefined') { navigate(); return; }

  
  const desk = document.getElementById('desktop');
  let gf = 0;
  const GCOLS = ['rgba(0,255,65,.55)', 'rgba(255,0,144,.55)', 'rgba(0,255,65,.35)'];
  const glitchIv = setInterval(() => {
    if (!desk) return;
    const c  = GCOLS[gf % GCOLS.length];
    const ox = ((Math.random() - .5) * 12).toFixed(1);
    gsap.set(desk, {
      filter: `drop-shadow(${ox}px 0 ${c}) drop-shadow(${-ox}px 0 rgba(255,0,144,.45)) saturate(1.9)`,
      skewX:  (Math.random() - .5) * 2.5,
    });
    gf++;
  }, 52);

  setTimeout(() => {
    clearInterval(glitchIv);
    gsap.set(desk, { filter: 'none', skewX: 0 });
  }, 250);

  const tl = gsap.timeline({ onComplete: navigate });

  tl
    
    .to('#desktop', {
      scale: 4.8, duration: 1.55, ease: 'power3.in',
      transformOrigin: '50% 50%'
    }, 0.26)
    .fromTo('#desktop', { filter: 'none' }, {
      filter: 'drop-shadow(10px 0 rgba(255,0,144,.8)) drop-shadow(-10px 0 rgba(0,255,65,.8)) brightness(1.5)',
      duration: 0.9, ease: 'power2.in'
    }, 0.26)

    
    .to('#desktop', { filter: 'brightness(9)', duration: 0.11, ease: 'power3.in' }, 1.58)

    
    .set(mon, { opacity: 1, background: '#000' },                  1.68)
    .to('#desktop', { opacity: 0, duration: 0.06 },                1.68)
    .fromTo(line,
      { scaleY: 0.004, opacity: 0 },
      { opacity: 1,    duration: 0.06 },                           1.74)
    .to(line, { scaleY: 1,    duration: 0.36, ease: 'power2.out' }, 1.80)
    .to(line, { opacity: 0,   duration: 0.18, ease: 'power2.in'  }, 2.17);
}
document.addEventListener('enter-computer', () => goToProjects());

function initFullpageBtn() {
  const btn = document.getElementById('btn-fullpage');
  btn?.addEventListener('click', goToProjects);
  if (btn) addHover([btn]);
}

const TERM_CMDS = [
  { cmd:'ping -c 3 8.8.8.8',
    out:'PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes: icmp_seq=0 ttl=118 time=11.4 ms\n64 bytes: icmp_seq=1 ttl=118 time=12.1 ms\n64 bytes: icmp_seq=2 ttl=118 time=11.8 ms\n\n3 packets transmitted, 3 received, 0% packet loss\nrtt min/avg/max = 11.4/11.7/12.1 ms', cls:'ok' },
  { cmd:'ifconfig en0 | grep -E "inet |ether"',
    out:'\tinet 192.168.1.105 netmask 0xffffff00 broadcast 192.168.1.255\n\tether a4:c3:f0:7b:2e:91', cls:'info' },
  { cmd:'nmap --open -T4 192.168.1.1',
    out:'Starting Nmap 7.94\nNmap scan report for 192.168.1.1\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n\nNmap done: 1 IP address scanned in 2.84s', cls:'warn' },
  { cmd:'systemctl status sshd',
    out:'sshd.service - OpenSSH server daemon\n   Active: active (running) since Wed 2026-05-28 10:14:32 CEST\n  Process: 1042 ExecStart=/usr/sbin/sshd\n Main PID: 1043 (sshd)', cls:'ok' },
  { cmd:'netstat -tuln | head -8',
    out:'Active Internet connections (only servers)\nProto  Local Address       State\ntcp    0.0.0.0:22          LISTEN\ntcp    0.0.0.0:80          LISTEN\ntcp    0.0.0.0:443         LISTEN\ntcp6   :::22               LISTEN\nudp    0.0.0.0:68          UNCONN', cls:'info' },
  { cmd:'df -h | grep -v tmpfs',
    out:'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       237G   84G  141G  38% /\n/dev/sda2       100G   12G   88G  12% /home\n/dev/sdb1       932G  445G  487G  48% /mnt/backup', cls:'info' },
  { cmd:'uname -a',
    out:'Linux DAVID-OS 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27 x86_64 GNU/Linux', cls:'info' },
  { cmd:'git log --oneline -5',
    out:'a3f9c12 feat: add 3D interactive room\nb8e4d71 fix: mobile responsive windows\nc2a17f9 style: retrowave lighting preset\nd5f3e88 feat: terminal.app live commands\ne9b2c44 chore: optimize 3D model loading', cls:'info' },
];

let termActive = false, termIdx = 0, termTimer = null;

function startTerminal() {
  const loginEl = document.getElementById('term-login');
  if (loginEl) loginEl.textContent = new Date().toLocaleString('en-GB', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  stopTerminal();
  const out = document.getElementById('term-output');
  const cmd = document.getElementById('term-cmd');
  if (out) out.innerHTML = '';
  if (cmd) cmd.textContent = '';
  termActive = true;
  termIdx = 0;
  termTimer = setTimeout(runTermCmd, 600);
  _initInteractiveLayer();
}

function stopTerminal() {
  termActive = false;
  clearTimeout(termTimer);
}

function runTermCmd() {
  if (!termActive) return;
  const { cmd, out, cls } = TERM_CMDS[termIdx % TERM_CMDS.length];
  termIdx++;
  typeCmd(cmd, () => {
    termTimer = setTimeout(() => {
      pushOutput(cmd, out, cls);
      termTimer = setTimeout(runTermCmd, 900 + Math.random() * 700);
    }, 280);
  });
}

function typeCmd(cmd, done) {
  const el = document.getElementById('term-cmd');
  if (!el) return;
  el.textContent = '';
  let i = 0;
  function next() {
    if (!termActive) return;
    if (i >= cmd.length) { done(); return; }
    el.textContent += cmd[i++];
    const body = document.getElementById('term-body');
    if (body) body.scrollTop = body.scrollHeight;
    termTimer = setTimeout(next, 48 + Math.random() * 28);
  }
  next();
}

function pushOutput(cmd, out, cls) {
  const outputEl = document.getElementById('term-output');
  const cmdEl    = document.getElementById('term-cmd');
  if (!outputEl || !cmdEl) return;
  const hist = document.createElement('div');
  hist.className = 'term-hist-line';
  hist.innerHTML = '<span class="term-prompt mono">david@DAVID-OS:~$&nbsp;</span><span class="term-cmd-hist">' + cmd + '</span>';
  outputEl.appendChild(hist);
  const pre = document.createElement('pre');
  pre.className = 'term-out' + (cls ? ' ' + cls : '');
  pre.textContent = out;
  outputEl.appendChild(pre);
  cmdEl.textContent = '';
  const body = document.getElementById('term-body');
  if (body) body.scrollTop = body.scrollHeight;
  while (outputEl.children.length > 40) outputEl.removeChild(outputEl.firstChild);
}

let _interactiveMode = false;
let _interactiveBuf  = '';
let _termHistIdx     = -1;

const _TERM_CMD_LIST = [
  'help','whoami','about','skills','experience','certs','contact',
  'ping','nmap','ifconfig','netstat','traceroute','ssh',
  'df','uname','ps','sudo','hack','matrix','ls','cat','man',
  'git','open','history','clear',
].sort();

function _initInteractiveLayer() {
  if (document._termLayerBound) return;
  document._termLayerBound = true;

  document.addEventListener('keydown', e => {

    if (!winState['terminal']?.open) return;

    const tag = document.activeElement?.tagName;
    if ((tag === 'INPUT' || tag === 'TEXTAREA') &&
        !document.activeElement?.closest('#win-terminal')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Escape') {
      if (_interactiveMode) {
        _interactiveMode = false;
        _interactiveBuf  = '';
        _termHistIdx     = -1;
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = '';
        if (!termActive) { termActive = true; termIdx = 0; termTimer = setTimeout(runTermCmd, 400); }
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const prefix = _interactiveBuf.toLowerCase().split(' ')[0];
      if (!prefix) return;
      if (!_interactiveMode) { _interactiveMode = true; stopTerminal(); }
      const match = _TERM_CMD_LIST.find(c => c.startsWith(prefix));
      if (match) {
        _interactiveBuf = match;
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = _interactiveBuf;
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!_interactiveMode) { _interactiveMode = true; stopTerminal(); }
      try {
        const h = JSON.parse(sessionStorage.getItem('da-term-hist') || '[]');
        if (!h.length) return;
        _termHistIdx = Math.min(_termHistIdx + 1, h.length - 1);
        _interactiveBuf = h[h.length - 1 - _termHistIdx];
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = _interactiveBuf;
      } catch {}
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (_termHistIdx <= 0) { _termHistIdx = -1; _interactiveBuf = ''; const cmdEl = document.getElementById('term-cmd'); if (cmdEl) cmdEl.textContent = ''; return; }
      try {
        const h = JSON.parse(sessionStorage.getItem('da-term-hist') || '[]');
        _termHistIdx--;
        _interactiveBuf = h[h.length - 1 - _termHistIdx];
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = _interactiveBuf;
      } catch {}
      return;
    }
    if (e.key === 'Enter') {
      if (_interactiveMode) {
        e.preventDefault();
        const val = _interactiveBuf.trim();
        _interactiveBuf = '';
        _termHistIdx    = -1;
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = '';
        if (val) {
          try {
            const h = JSON.parse(sessionStorage.getItem('da-term-hist') || '[]');
            h.push(val); if (h.length > 50) h.shift();
            sessionStorage.setItem('da-term-hist', JSON.stringify(h));
          } catch {}
          _runInteractiveCmd(val);
        }
      }
      return;
    }
    if (e.key === 'Backspace') {
      if (_interactiveMode) {
        e.preventDefault();
        _interactiveBuf = _interactiveBuf.slice(0, -1);
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = _interactiveBuf;
      }
      return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      if (!_interactiveMode) {
        _interactiveMode = true;
        stopTerminal();
        const cmdEl = document.getElementById('term-cmd');
        if (cmdEl) cmdEl.textContent = '';
        _interactiveBuf = '';
      }
      _interactiveBuf += e.key;
      const cmdEl = document.getElementById('term-cmd');
      if (cmdEl) cmdEl.textContent = _interactiveBuf;
      const b = document.getElementById('term-body');
      if (b) b.scrollTop = b.scrollHeight;
    }
  });
}

function _barStr(pct, w) {
  w = w || 18;
  const f = Math.round(pct / 100 * w);
  return '█'.repeat(f) + '░'.repeat(w - f);
}

function _runInteractiveCmd(raw) {
  _interactiveMode = false;
  const cmd = raw.toLowerCase().split(' ')[0];
  const ICMDS = {
    help() {
      pushOutput(raw,
        'COMMANDS:\n' +
        '  info     whoami · about · skills · experience · certs · contact\n' +
        '  files    ls · cat · man\n' +
        '  network  ping · nmap · ifconfig · netstat · traceroute · ssh\n' +
        '  system   df · uname · ps · sudo · neofetch · clear\n' +
        '  git      git log · git status\n' +
        '  open     open <app>.app\n\n' +
        'Press  Esc  to return to auto-mode.', 'info');
    },
    whoami() {
      pushOutput(raw,
        'David Alvarez\nIT Systems & Networks Administrator\nHospitalet · Barcelona · Spain\n\n' +
        'focus   Networks · Infrastructure · Cybersecurity\n' +
        'lang    Spanish (native) · Catalan (native) · EN C1', '');
    },
    about() {
      pushOutput(raw,
        'IT professional with experience in international operational environments.\n' +
        'Pursuing CFGS ASIR with Cybersecurity specialisation.\n\n' +
        'SAP, Salesforce & Mercury at Sthree Spain.\n' +
        'Six years in the US. C1 English. Multicultural environments.\n\n' +
        'Seeking roles in IT, networks and infrastructure.', '');
    },
    skills() {
      pushOutput(raw,
        'NETWORKS & SYSTEMS\n' +
        '  TCP/IP  ·  DNS/DHCP  ·  Routing  ·  VPN  ·  Firewalls  ·  Wireshark\n' +
        '\nOS & SYSADMIN\n' +
        '  Linux  ·  Windows Server  ·  Active Directory  ·  Bash/SSH  ·  MacOS\n' +
        '\nTOOLS\n' +
        '  SAP  ·  Salesforce  ·  Mercury  ·  Cisco Packet Tracer  ·  Git\n' +
        '\nDEVELOPMENT\n' +
        '  HTML5  ·  CSS3  ·  JavaScript  ·  PHP  ·  SQL', 'info');
    },
    experience() {
      pushOutput(raw,
        'Jul 2023 – Sep 2025  Sthree Spain · Barcelona\n' +
        '  Operations Specialist\n' +
        '  └─ SAP, Salesforce & Mercury contract management\n\n' +
        'Sep 2022 – May 2023  Chronis Elite · Long Island\n' +
        '  Player Relations Manager\n' +
        '  └─ US elite youth soccer academy recruitment\n\n' +
        'Jan 2022 – May 2022  Carolina Esports · Charlotte\n' +
        '  Operations Trainee  ·  OBS Studio & NDI broadcast', '');
    },
    certs() {
      pushOutput(raw,
        '[IN PROGRESS]  CCNA: Introduction to Networks  ·  Cisco Networking Academy', 'info');
    },
    contact() {
      pushOutput(raw,
        'email     imdavidalvarez@gmail.com\n' +
        'linkedin  linkedin.com/in/davidalvarez1997\n' +
        'github    github.com/misteralva', 'info');
    },
    ping() {
      const parts  = raw.trim().split(/\s+/);
      const target = parts[1] || '1.1.1.1';
      
      const urlMap = {
        '8.8.8.8':      'https://dns.google/',
        '8.8.4.4':      'https://dns.google/',
        '1.1.1.1':      'https://1.1.1.1/cdn-cgi/trace',
        '1.0.0.1':      'https://1.1.1.1/cdn-cgi/trace',
        'google.com':   'https://google.com',
        'cloudflare.com':'https://cloudflare.com/cdn-cgi/trace',
      };
      const url = urlMap[target] || 'https://1.1.1.1/cdn-cgi/trace';
      pushOutput(raw, `PING ${target}: measuring real latency via HTTPS…`, 'info');
      (async () => {
        const times = [];
        for (let i = 0; i < 3; i++) {
          const t0 = performance.now();
          try {
            await fetch(url, { mode:'no-cors', cache:'no-cache' });
            times.push((performance.now() - t0).toFixed(1));
          } catch { times.push('*'); }
        }
        const valid = times.filter(t => t !== '*').map(Number);
        const avg   = valid.length ? (valid.reduce((a,b) => a+b,0) / valid.length).toFixed(1) : '*';
        const mn    = valid.length ? Math.min(...valid).toFixed(1) : '*';
        const mx    = valid.length ? Math.max(...valid).toFixed(1) : '*';
        pushOutput('',
          `64 bytes from ${target}: icmp_seq=0 ttl=55 time=${times[0]} ms\n` +
          `64 bytes from ${target}: icmp_seq=1 ttl=55 time=${times[1]} ms\n` +
          `64 bytes from ${target}: icmp_seq=2 ttl=55 time=${times[2]} ms\n\n` +
          `3 packets transmitted, 3 received, 0% packet loss\n` +
          `rtt min/avg/max = ${mn}/${avg}/${mx} ms`, 'ok');
      })();
    },
    nmap() {
      pushOutput(raw,
        'Starting Nmap 7.94 SVN\nHost is up (0.0024s latency).\n\n' +
        'PORT       STATE  SERVICE\n' +
        '22/tcp     open   ssh       OpenSSH 8.9p1\n' +
        '80/tcp     open   http      nginx 1.24.0\n' +
        '443/tcp    open   https     nginx 1.24.0\n' +
        '8080/tcp   closed http-proxy\n\n' +
        'Nmap done: 1 IP address scanned in 2.61 seconds', 'warn');
    },
    ifconfig() {
      pushOutput(raw, 'Fetching real network info…', 'info');
      (async () => {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const type = conn?.effectiveType || 'unknown';
        const down = conn?.downlink     ? conn.downlink + ' Mbps' : 'unknown';
        let ip = '?.?.?.?';
        try {
          const txt = await fetch('https://cloudflare.com/cdn-cgi/trace').then(r => r.text());
          ip = txt.match(/ip=(.+)/)?.[1]?.trim() || ip;
        } catch {}
        pushOutput('',
          `eth0: flags=4163<UP,BROADCAST,RUNNING>  mtu 1500\n` +
          `      inet ${ip}  connection: ${type}  downlink: ${down}\n` +
          `      (public IP via Cloudflare trace)\n\n` +
          `lo: flags=73<UP,LOOPBACK>  mtu 65536\n` +
          `    inet 127.0.0.1  netmask 255.0.0.0`, 'info');
      })();
    },
    netstat() {
      pushOutput(raw,
        'Proto  Local Address           State\n' +
        'tcp    0.0.0.0:22              LISTEN\n' +
        'tcp    0.0.0.0:80              LISTEN\n' +
        'tcp    0.0.0.0:443             LISTEN\n' +
        'tcp    192.168.1.105:48214     ESTABLISHED\n' +
        'udp    0.0.0.0:68              UNCONN', 'info');
    },
    traceroute() {
      pushOutput(raw,
        'traceroute to google.com (142.250.185.14), 30 hops max\n' +
        ' 1  192.168.1.1      1.234 ms  1.102 ms  1.089 ms\n' +
        ' 2  10.0.0.1         4.821 ms  4.744 ms  4.912 ms\n' +
        ' 3  *  *  *  (no reply)\n' +
        ' 5  142.250.185.14   10.981 ms  11.204 ms', '');
    },
    ssh() {
      pushOutput(raw,
        'Connecting to server.lab.local (192.168.1.10)...\n' +
        'david@192.168.1.10 — authenticated via key.\n\n' +
        '  Welcome to Ubuntu Server 22.04.3 LTS (GNU/Linux 6.2.0)\n' +
        '  [demo mode — interactive session unavailable]\n' +
        '  Connection closed.', 'ok');
    },
    df() {
      if (!('storage' in navigator && 'estimate' in navigator.storage)) {
        pushOutput(raw, 'storage estimate not available in this browser', 'err'); return;
      }
      navigator.storage.estimate().then(est => {
        const used  = (est.usage  / 1e6).toFixed(0);
        const quota = (est.quota  / 1e6).toFixed(0);
        const avail = ((est.quota - est.usage) / 1e6).toFixed(0);
        const pct   = ((est.usage / est.quota) * 100).toFixed(0);
        pushOutput('',
          `Filesystem        Size     Used    Avail  Use%  Mounted on\n` +
          `browser-storage   ${quota}MB  ${used}MB  ${avail}MB   ${pct}%    /`, 'info');
      });
    },
    uname() {
      const ua    = navigator.userAgent;
      const cores = navigator.hardwareConcurrency || '?';
      const arch  = /arm|aarch64/i.test(ua) ? 'aarch64' : 'x86_64';
      let os = 'Unknown';
      if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
      else if (/Windows NT 6/.test(ua))  os = 'Windows 7/8';
      else if (/Mac OS X/.test(ua))      os = 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g,'.') || '');
      else if (/Android/.test(ua))       os = 'Android';
      else if (/Linux/.test(ua))         os = 'Linux';
      pushOutput(raw, `${os}  ${arch}  ${cores} cores  —  real data from your browser`, '');
    },
    ps()    { pushOutput(raw, '  PID TTY      STAT   TIME COMMAND\n 1042 pts/0    Ss     0:00 bash\n 2134 pts/0    Sl     0:03 node portfolio.js\n 3021 pts/0    S      0:00 sshd: david [priv]\n 4402 pts/0    R+     0:00 ps aux', ''); },
    sudo() {
      if (/rm\s+-rf/.test(raw)) {
        const dels = ['/bin/bash','usr/lib/systemd','etc/passwd','home/david','/boot/vmlinuz'];
        dels.forEach((d, i) => setTimeout(() => pushOutput('', `rm: removed '${d}'`, 'err'), i * 200));
        setTimeout(() => pushOutput('', 'just kidding. portfolio intact.\n[  OK  ] All systems nominal.', 'ok'), dels.length * 200 + 100);
      } else {
        pushOutput(raw, '[sudo] password for david:\nSorry, try again.\n[sudo] password for david:\nSorry, try again.\nsudo: 3 incorrect password attempts\n\n  (portfolio mode — root access restricted)', 'err');
      }
    },
    hack() {
      const GLITCH = '!@#$%^&*<>[]{}|\\/?01ABCDEFx';
      const termOut = document.getElementById('term-output');
      const b = document.getElementById('term-body');
      const logs = [
        ['[>] Initiating connection to 192.168.0.1…',          'info'],
        ['[>] Port scan: 22 · 80 · 443 · 8080 — open',         'ok'  ],
        ['[>] Fingerprinting OS: Linux 6.1 x86_64',             'info'],
        ['[!] CVE-2024-4421 — auth bypass detected',            'err' ],
        ['[>] Injecting payload → /etc/shadow',                 'err' ],
        ['[>] SUID escalation → root shell acquired',           'warn'],
        ['[>] Scanning /home/david …',                          'info'],
        ['[>] Exfiltrating: cv.txt  README.md  .bashrc',        'info'],
        ['[!] 3 credential files extracted',                    'err' ],
        ['[>] Wiping /var/log/auth.log  /var/log/syslog',       'info'],
        ['[>] Backdoor installed → port 31337',                 'warn'],
        ['[✓] Persistence established',                         'ok'  ],
      ];
      let i = 0;
      function showLogs() {
        if (i < logs.length) {
          const p = document.createElement('pre');
          p.className = `term-out ${logs[i][1]}`;
          p.textContent = logs[i][0];
          termOut?.appendChild(p);
          if (b) b.scrollTop = b.scrollHeight;
          i++;
          setTimeout(showLogs, 90 + Math.random() * 70);
        } else {
          const p = document.createElement('pre');
          p.className = 'term-out ok';
          p.textContent = '';
          termOut?.appendChild(p);
          const TARGET = '██ ACCESS GRANTED ██';
          let frame = 0;
          const iv = setInterval(() => {
            p.textContent = TARGET.split('').map((c, idx) =>
              frame > idx * 1.3 ? c : GLITCH[~~(Math.random() * GLITCH.length)]
            ).join('');
            if (b) b.scrollTop = b.scrollHeight;
            if (++frame > TARGET.length * 1.8) {
              clearInterval(iv);
              p.textContent = TARGET;
              pushOutput('', 'Shell initialised  ·  user: david  ·  level: root\nAll portfolio modules nominal.', 'ok');
            }
          }, 45);
        }
      }
      setTimeout(showLogs, 80);
    },
    matrix() {
      const CHARS = 'ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ01アイウエオカキクケコサシスセソ';
      const COLS = 54, ROWS = 22, BRIGHT = Math.floor(ROWS * .4);
      const lines = Array.from({ length: ROWS }, (_, r) => {
        const dist = Math.abs(r - BRIGHT) / ROWS;
        const op   = Math.max(.08, 1 - dist * 1.2).toFixed(2);
        const col  = r === BRIGHT ? '#afffaf' : '#00ff41';
        const line = Array.from({ length: COLS }, () =>
          Math.random() > .32 ? CHARS[~~(Math.random() * CHARS.length)] : ' '
        ).join('');
        return `<span style="color:${col};opacity:${op};font-size:.68em;letter-spacing:.04em;display:block">${line}</span>`;
      }).join('');
      const el = document.createElement('div');
      el.innerHTML = lines;
      document.getElementById('term-output')?.appendChild(el);
      const outEl = document.getElementById('term-output');
      if (outEl) {
        const p = document.createElement('pre');
        p.className = 'term-out ok';
        p.textContent = '\nWake up, Neo…\nThe Matrix has you.';
        outEl.appendChild(p);
      }
      const b = document.getElementById('term-body');
      if (b) b.scrollTop = b.scrollHeight;
    },
    neofetch() {
      const ua    = navigator.userAgent;
      const cores = navigator.hardwareConcurrency || '?';
      const mem   = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : '?';
      const conn  = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const net   = conn?.effectiveType || 'unknown';
      let os = 'Unknown';
      if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
      else if (/Mac OS X/.test(ua))      os = 'macOS';
      else if (/Android/.test(ua))       os = 'Android';
      else if (/Linux/.test(ua))         os = 'Linux';
      const br = /Edg\//.test(ua)     ? 'Edge'
               : /Chrome\//.test(ua)  ? 'Chrome ' + /Chrome\/([\d]+)/.exec(ua)?.[1]
               : /Firefox\//.test(ua) ? 'Firefox ' + /Firefox\/([\d]+)/.exec(ua)?.[1]
               : /Safari\//.test(ua)  ? 'Safari' : 'Unknown';
      pushOutput(raw,
        `        .....           visitor@DAVID-OS\n` +
        `      .:oooooo:.        OS:      ${os}  (your device)\n` +
        `    .ooooooooooo.       Browser: ${br}\n` +
        `   :ooooooooooooo:      CPU:     ${cores} cores  (real)\n` +
        `   :ooooooooooooo:      RAM:     ${mem}  (real)\n` +
        `    'ooooooooooo'       Network: ${net}  (real)\n` +
        `      ''ooooo''         Host:    David Alvarez · IT & Networks · BCN\n` +
        `          ''            Stack:   Three.js · GSAP · HTML/CSS/JS`, 'info');
    },
    clear() {
      const el = document.getElementById('term-output');
      if (el) el.innerHTML = '';
      document.getElementById('term-cmd').textContent = '';
    },
    ls() {
      const args = raw.trim().split(/\s+/).slice(1).join(' ');
      if (!args || args === '~' || args === '.') {
        pushOutput(raw,
          'total 48\n' +
          'drwxr-xr-x  david  4096  Jun 2026  projects/\n' +
          'drwxr-xr-x  david  4096  Jun 2026  certs/\n' +
          '-rw-r--r--  david  2.1K  Jun 2026  README.md\n' +
          '-rw-r--r--  david   892  Jun 2026  cv.txt\n' +
          '-rw-r--r--  david   445  Jun 2026  contact.txt\n' +
          '-rw-r--r--  david    94  Jun 2026  .bashrc', '');
      } else if (args === 'projects/' || args === 'projects') {
        pushOutput(raw,
          'Frontend/     Networking/     Cybersecurity/\n' +
          'Backend/      Scripting/', '');
      } else if (args === 'certs/' || args === 'certs') {
        pushOutput(raw, 'ccna-intro-networks.pdf    c1-advanced-english.pdf', '');
      } else {
        pushOutput(raw, `ls: cannot access '${args}': No such file or directory`, 'err');
      }
    },
    cat() {
      const file = raw.trim().split(/\s+/)[1] || '';
      if (!file) { pushOutput(raw, 'usage: cat <file>', 'err'); return; }
      if (file === 'README.md') {
        pushOutput(raw,
          '# David Alvarez — Portfolio OS\n\n' +
          'IT Systems & Networks · Hospitalet · Barcelona\n\n' +
          '## Stack\n' +
          '  Three.js · GSAP · HTML/CSS/JS · Kali Linux\n\n' +
          '## Links\n' +
          '  github  →  github.com/misteralva\n' +
          '  linkedin→  linkedin.com/in/davidalvarez1997\n\n' +
          '> "Learning never stops."', '');
      } else if (file === 'cv.txt') {
        pushOutput(raw,
          'David Alvarez Fernández\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          'Hospitalet · Barcelona  ·  imdavidalvarez@gmail.com\n\n' +
          'EDUCATION\n' +
          '  CFGS ASIR + Cybersecurity  ·  In progress\n\n' +
          'CERTIFICATIONS\n' +
          '  CCNA: Introduction to Networks  ·  Cisco\n' +
          '  C1 Advanced English             ·  Cambridge\n\n' +
          'EXPERIENCE\n' +
          '  2023–2025  Operations Specialist  ·  Sthree, Barcelona\n' +
          '  2022–2023  Player Relations Mgr   ·  Chronis Elite, NY\n' +
          '  2022       Operations Trainee     ·  Carolina Esports\n\n' +
          'SKILLS\n' +
          '  Networks · Linux · Cybersecurity · SAP · Salesforce\n' +
          '  HTML/CSS/JS · Three.js · GSAP', '');
      } else if (file === 'contact.txt') {
        pushOutput(raw,
          'email     imdavidalvarez@gmail.com\n' +
          'linkedin  linkedin.com/in/davidalvarez1997\n' +
          'github    github.com/misteralva\n' +
          'location  Hospitalet · Barcelona · Spain', 'info');
      } else if (file === '.bashrc') {
        pushOutput(raw,
          '# ~/.bashrc  —  david@DAVID-OS\n' +
          'export EDITOR=vim\n' +
          'alias ll="ls -la"\n' +
          'alias ports="netstat -tuln"\n' +
          'alias update="sudo apt update && sudo apt upgrade -y"\n' +
          'alias kali="cd /home/david/projects/Cybersecurity"\n' +
          'PS1="\\[\\033[32m\\]david@DAVID-OS\\[\\033[0m\\]:\\[\\033[34m\\]\\w\\[\\033[0m\\]$ "', '');
      } else {
        pushOutput(raw, `cat: ${file}: No such file or directory`, 'err');
      }
    },
    man() {
      const subject = raw.trim().split(/\s+/)[1] || 'david';
      if (subject === 'david') {
        pushOutput(raw,
          'DAVID(1)                  User Commands                  DAVID(1)\n\n' +
          'NAME\n       david — IT Systems & Networks professional · BCN\n\n' +
          'SYNOPSIS\n       david [--networks] [--cybersec] [--sysadmin] [--frontend]\n\n' +
          'DESCRIPTION\n       CFGS ASIR + Cybersecurity specialisation, CCNA in progress.\n       2 years international ops at Sthree (SAP, Salesforce, Mercury).\n       6 years in the US, C1 English, Kali Linux daily driver.\n\n' +
          'OPTIONS\n       --networks    TCP/IP · routing · VPN · Wireshark · Firewalls\n       --cybersec    Metasploit · Burp Suite · Nmap · Aircrack-ng\n       --sysadmin    Linux · Windows Server · Active Directory · Bash\n       --frontend    HTML/CSS/JS · Three.js · GSAP · PHP · SQL\n\n' +
          'FILES\n       ~/cv.txt   ~/README.md   ~/contact.txt\n\n' +
          'AUTHOR\n       Written by david himself.   v2026.06', 'info');
      } else {
        pushOutput(raw, `No manual entry for ${subject}\nTry: man david`, 'err');
      }
    },
    git() {
      const sub  = raw.trim().split(/\s+/)[1];
      const sub2 = raw.trim().split(/\s+/)[2];
      if (!sub || sub === 'log') {
        pushOutput(raw,
          'commit a3f9c12  feat: CRT monitor power-on transition\n' +
          'commit b8e4d71  feat: 3D interactive room · Three.js\n' +
          'commit c2a17f9  feat: category folders in projects desktop\n' +
          'commit d5f3e88  feat: terminal.app with real network commands\n' +
          'commit e9b2c44  style: teal accent · dark OS aesthetic\n' +
          'commit f1d3a08  feat: Kali Linux projects page\n' +
          'commit 07c4b22  init: Portfolio OS concept', '');
      } else if (sub === 'status') {
        pushOutput(raw, 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean', 'ok');
      } else if (sub === 'branch') {
        pushOutput(raw, '* main\n  dev\n  feature/3d-room', '');
      } else {
        pushOutput(raw, `git: '${sub}' is not a git command\nCommands: log · status · branch`, 'err');
      }
    },
    open() {
      const app = raw.trim().split(/\s+/)[1] || '';
      const MAP = {
        'profile.app':'about', 'skills.app':'skills', 'certs.app':'certs',
        'experience.app':'experience', 'projects.app':'projects',
        'contact.app':'contact', 'terminal.app':'terminal',
      };
      const win = MAP[app];
      if (win) {
        openWindow(win);
        pushOutput(raw, `Opening ${app}…`, 'ok');
      } else {
        const list = Object.keys(MAP).join('  ');
        pushOutput(raw, app
          ? `open: ${app}: no such application\nAvailable: ${list}`
          : `usage: open <app>\nAvailable: ${list}`, 'err');
      }
    },
    history() {
      const hist = JSON.parse(sessionStorage.getItem('da-term-hist') || '[]');
      if (!hist.length) { pushOutput(raw, '(no history)', ''); return; }
      pushOutput(raw, hist.map((c,i) => `  ${String(i+1).padStart(3)}  ${c}`).join('\n'), '');
    },
  };

  if (ICMDS[cmd]) { ICMDS[cmd](); }
  else { pushOutput(raw, 'bash: ' + raw + ': command not found\nType  help  to see available commands.', 'err'); }
}

function _termPrint(t,c) {}
function _termPrintH(h) {}
function _termGap() {}
function _termBar(p,w) { return ''; }

function initDockMagnification() {
  const dock  = document.getElementById('dock');
  const items = [...document.querySelectorAll('#dock .di')];
  if (!dock || !items.length) return;

  dock.addEventListener('mousemove', e => {
    items.forEach(item => {
      const r      = item.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const dist   = Math.abs(e.clientX - center);
      const radius = 96;
      const t      = Math.max(0, 1 - dist / radius);
      const eased  = t * t * (3 - 2 * t);
      const scale  = 1 + eased * 0.72;
      const ty     = -eased * 13;
      item.style.transition = 'transform 0.12s cubic-bezier(.16,1,.3,1)';
      item.style.transform  = `translateY(${ty.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    });
  });

  dock.addEventListener('mouseleave', () => {
    items.forEach(item => {
      item.style.transition = 'transform 0.32s cubic-bezier(.16,1,.3,1)';
      item.style.transform  = '';
    });
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.remove('bouncing');
      void item.offsetWidth;
      item.classList.add('bouncing');
      item.addEventListener('animationend', () => item.classList.remove('bouncing'), { once: true });
    });
  });
}

function initTitleScramble() {
  const hero = document.getElementById('desk-hero');
  const name = hero?.querySelector('.dh-name');
  if (!hero || !name) return;

  hero.addEventListener('mouseenter', () => {
    const spans = [...document.querySelectorAll('.dh-name .dhl')];
    if (!spans.length) return;

    
    gsap.to(spans, {
      color: '#64ffda',
      stagger: 0.038,
      duration: 0.12,
      ease: 'none'
    });

    
    gsap.to(name, { letterSpacing: '0.16em', duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  });

  hero.addEventListener('mouseleave', () => {
    const spans = [...document.querySelectorAll('.dh-name .dhl')];

    
    gsap.to(spans, {
      color: '#e8e6f0',
      stagger: { each: 0.028, from: 'end' },
      duration: 0.15,
      ease: 'none'
    });

    
    gsap.to(name, { letterSpacing: '-0.04em', duration: 0.45, ease: 'power3.out' });
  });
}

document.addEventListener('model-switching', e => {
  const el = document.getElementById('mb-model-name');
  if (!el) return;
  el.style.color = 'var(--acc)';
  el.textContent = e.detail.name;
  setTimeout(() => { el.style.color = ''; }, 800);
});

document.addEventListener('model-section-click', e => {
  openWindow(e.detail.section);
});

function initHeroGlitch() {
  const CHARS = '!<>-_\\/[]{}=+*^?#01';
  const G = '#00ff41';
  const P = '#ff0090';

  const spans = [...document.querySelectorAll('.dh-name .dhl')];
  if (!spans.length) return;
  const ORIG = spans.map(el => el.textContent);

  let busy = false;

  function glitch() {
    if (busy) { setTimeout(glitch, 7000); return; }
    busy = true;
    let frame = 0;
    const TOTAL = 16;

    const iv = setInterval(() => {
      const t = frame / TOTAL;
      spans.forEach(el => {
        if (Math.random() < (1 - t * 0.55)) {
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        const c = t < 0.4 ? G : t < 0.72 ? P : (Math.random() < .5 ? G : P);
        el.style.color      = c;
        el.style.textShadow = `0 0 10px ${c}`;
        el.style.transform  = Math.random() < 0.18
          ? `translateX(${(Math.random() - .5) * 9}px)` : '';
      });

      if (++frame >= TOTAL) {
        clearInterval(iv);
        spans.forEach((el, i) => {
          setTimeout(() => {
            el.textContent      = ORIG[i];
            el.style.color      = '';
            el.style.textShadow = '';
            el.style.transform  = '';
            if (i === spans.length - 1) busy = false;
          }, i * 28);
        });
      }
    }, 40);

    setTimeout(glitch, 7000);
  }

  setTimeout(glitch, 6000);
}

function initClickRipple() {
  document.getElementById('desktop')?.addEventListener('click', e => {
    if (e.target.closest('.win,.di,a,button,#dock')) return;
    const size = 110 + Math.random() * 70;
    [0, 1].forEach(i => {
      const d = document.createElement('div');
      d.className = 'desk-ripple' + (i ? ' desk-ripple-2' : '');
      d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${size * (1 + i * .4)}px;height:${size * (1 + i * .4)}px`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 1000);
    });
  });

  
  const curEl = document.getElementById('cur');
  if (curEl) {
    document.addEventListener('mousedown', () => curEl.classList.add('clicking'));
    document.addEventListener('mouseup',   () => curEl.classList.remove('clicking'));
  }
}

function initWindowTilt() {
  document.querySelectorAll('.win').forEach(win => {
    win.addEventListener('mousemove', e => {
      if (document.body.dataset.dragging) return;
      const r  = win.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / r.width;
      const dy = (e.clientY - r.top  - r.height / 2) / r.height;
      gsap.to(win, {
        rotationX: dy * -5,
        rotationY: dx *  5,
        transformPerspective: 900,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    win.addEventListener('mouseleave', () => {
      gsap.to(win, {
        rotationX: 0, rotationY: 0,
        duration: 0.7,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  });
}

function initWinTitleScramble() {
  const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  document.querySelectorAll('.win-title').forEach(el => {
    const orig = el.textContent;
    let busy = false;
    el.closest('.win-chrome')?.addEventListener('mouseenter', () => {
      if (busy) return;
      busy = true;
      let frame = 0;
      const total = orig.length + 5;
      el.classList.add('scrambling');
      const iv = setInterval(() => {
        el.textContent = orig.split('').map((c, i) => {
          if (c === ' ' || c === '.') return c;
          return frame > i + 2 ? c : CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++frame >= total) {
          clearInterval(iv);
          el.textContent = orig;
          el.classList.remove('scrambling');
          busy = false;
        }
      }, 36);
    });
  });
}

function showToast(icon, title, msg) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const time = new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const el   = document.createElement('div');
  el.className = 'toast';
  el.innerHTML =
    '<div class="toast-icon"><i class="' + icon + '"></i></div>' +
    '<div class="toast-body"><div class="toast-title">' + title + '</div>' +
    '<div class="toast-msg">' + msg + '</div></div>' +
    '<div class="toast-time">' + time + '</div>';
  stack.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  setTimeout(() => {
    el.classList.remove('in'); el.classList.add('out');
    setTimeout(() => el.remove(), 500);
  }, 3800);
}

function showBootToasts() {
  const TOASTS = [
    { icon:'fas fa-certificate', title:'CCNA — In progress', msg:'Cisco Networking Academy',          delay:0    },
    { icon:'fab fa-linkedin',    title:"Let's connect",       msg:'linkedin.com/in/davidalvarez1997', delay:1600 },
  ];
  TOASTS.forEach(t => setTimeout(() => showToast(t.icon, t.title, t.msg), t.delay));
}

const SFX = (() => {
  let _ctx  = null;
  let muted = false;

  function ctx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  function noise(duration, gain, pitch = 1) {
    if (muted) return;
    try {
      const c   = ctx();
      const len = Math.ceil(c.sampleRate * duration);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = pitch;
      const g = c.createGain();
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
      src.connect(g); g.connect(c.destination); src.start();
    } catch {}
  }

  function tone(freq, endFreq, duration, gain, type = 'sine') {
    if (muted) return;
    try {
      const c   = ctx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + duration);
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
      osc.connect(g); g.connect(c.destination);
      osc.start(); osc.stop(c.currentTime + duration);
    } catch {}
  }

  return {

    keyclick() { noise(0.018, 0.045, 1.4 + Math.random() * .6); },

    enterDesktop() {
      if (muted) return;
      try {
        const c   = ctx();
        const now = c.currentTime;
        [[660, now], [880, now + 0.14]].forEach(([freq, t]) => {
          const osc = c.createOscillator();
          const g   = c.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.055, t + 0.018);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
          osc.connect(g); g.connect(c.destination);
          osc.start(t); osc.stop(t + 0.35);
        });
      } catch {}
    },

    enterProjects() {
      if (muted) return;
      try {
        const c   = ctx();
        const now = c.currentTime;

        let t = 0;
        while (t < 1.42) {

          const gap   = 0.09 + Math.random() * 0.12;
          const pause = Math.random() < 0.18 ? (0.10 + Math.random() * 0.14) : 0;

          const dur   = 0.011 + Math.random() * 0.010;
          const gain  = 0.035 + Math.random() * 0.040;
          const pitch = 0.75  + Math.random() * 0.55;

          const len = Math.ceil(c.sampleRate * dur);
          const buf = c.createBuffer(1, len, c.sampleRate);
          const d   = buf.getChannelData(0);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);

          const src = c.createBufferSource();
          src.buffer = buf;
          src.playbackRate.value = pitch;
          const g = c.createGain();
          g.gain.setValueAtTime(gain, now + t);
          g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
          src.connect(g); g.connect(c.destination);
          src.start(now + t);

          t += gap + pause;
        }

        const osc = c.createOscillator();
        const gp  = c.createGain();
        osc.type  = 'sine';
        osc.frequency.value = 880;
        gp.gain.setValueAtTime(0, now + t + 0.06);
        gp.gain.linearRampToValueAtTime(0.048, now + t + 0.078);
        gp.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.34);
        osc.connect(gp); gp.connect(c.destination);
        osc.start(now + t + 0.06); osc.stop(now + t + 0.38);
      } catch {}
    },

    get muted() { return muted; },
    toggle() { muted = !muted; return muted; },
  };
})();

function shutDown() {
  const overlay  = document.getElementById('shutdown-overlay');
  const terminal = document.getElementById('shutdown-terminal-idx');
  const line     = document.getElementById('idx-mon-line');
  if (!overlay) return;

  overlay.classList.add('active');

  const MSGS = [
    { t:0,    cls:'sd-ok',   txt:'[ OK ] Stopping portfolio.service — DA.OS Desktop' },
    { t:180,  cls:'sd-ok',   txt:'[ OK ] Closing active connections' },
    { t:340,  cls:'sd-ok',   txt:'[ OK ] Unmounting /dev/portfolio' },
    { t:500,  cls:'sd-ok',   txt:'[ OK ] Reached target Shutdown' },
    { t:680,  cls:'sd-dim',  txt:'       Goodbye.' },
  ];

  MSGS.forEach(({ t, cls, txt }) => {
    setTimeout(() => {
      if (!terminal) return;
      const el = document.createElement('div');
      el.className = cls;
      el.textContent = txt;
      terminal.appendChild(el);
    }, t);
  });

  setTimeout(() => { if (line) { line.style.transition = 'none'; line.style.opacity = '1'; line.style.transform = 'scaleY(1)'; } }, 900);
  setTimeout(() => { if (line) { line.style.transition = 'transform .38s cubic-bezier(.4,0,.2,1), opacity .18s'; line.style.transform = 'scaleY(0.003)'; } }, 960);
  setTimeout(() => { if (line) line.style.opacity = '0'; }, 1340);

  
  setTimeout(() => {
    if (!terminal) return;
    terminal.innerHTML = '';
    if (line) line.style.display = 'none';

    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-power-off"></i>';
    btn.title = 'Power on';
    btn.style.cssText = [
      'position:absolute', 'top:50%', 'left:50%',
      'transform:translate(-50%,-50%)',
      'width:64px', 'height:64px', 'border-radius:50%',
      'background:transparent',
      'border:2px solid rgba(100,255,218,.35)',
      'color:rgba(100,255,218,.5)',
      'font-size:1.4rem',
      'cursor:pointer',
      'transition:border-color .3s, color .3s, box-shadow .3s',
      'animation:sd-power-pulse 2.4s ease-in-out infinite',
    ].join(';');
    btn.addEventListener('mouseenter', () => {
      btn.style.borderColor = 'rgba(100,255,218,.9)';
      btn.style.color = '#64ffda';
      btn.style.boxShadow = '0 0 28px rgba(100,255,218,.35)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.borderColor = 'rgba(100,255,218,.35)';
      btn.style.color = 'rgba(100,255,218,.5)';
      btn.style.boxShadow = '';
    });
    btn.addEventListener('click', () => location.reload());
    overlay.appendChild(btn);
  }, 1560);
}

function initSFX() {
  const btn  = document.getElementById('mb-sound-btn');
  const icon = document.getElementById('mb-sound-icon');
  if (btn) {
    addHover([btn]);
    btn.addEventListener('click', () => {
      const m = SFX.toggle();
      btn.classList.toggle('muted', m);
      btn.title = m ? 'Sound off' : 'Sound on';
      icon.className = m ? 'fas fa-volume-xmark' : 'fas fa-volume-low';
    });
  }

  const powerBtn = document.getElementById('mb-power-btn');
  if (powerBtn) {
    addHover([powerBtn]);
    powerBtn.addEventListener('click', shutDown);
  }
}

function initScreensaver() {
  const el    = document.getElementById('screensaver');
  const tEl   = document.getElementById('ss-time');
  const dEl   = document.getElementById('ss-date');
  const inner = document.getElementById('ss-inner');
  if (!el || !tEl) return;

  
  const ssCanvas = document.createElement('canvas');
  ssCanvas.id = 'ss-canvas';
  el.insertBefore(ssCanvas, el.firstChild);

  let _ssRainId = null;

  function startRain() {
    ssCanvas.width  = ssCanvas.offsetWidth  || window.innerWidth;
    ssCanvas.height = ssCanvas.offsetHeight || window.innerHeight;
    const ctx  = ssCanvas.getContext('2d');
    const W    = ssCanvas.width, H = ssCanvas.height;
    const SIZE = 16;
    const COLS = Math.floor(W / SIZE);
    const drops = Array.from({ length: COLS }, () => Math.floor(Math.random() * -(H / SIZE)));
    const CHARS = 'ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ01アイウエオカキクケ!@#$%^&*<>[]{}|/?';

    function draw() {
      _ssRainId = requestAnimationFrame(draw);
      ctx.fillStyle = 'rgba(4,4,10,0.055)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = SIZE + 'px "JetBrains Mono", monospace';
      drops.forEach((y, x) => {
        const isPink = Math.random() < 0.12;
        const a = (.28 + Math.random() * .55).toFixed(2);
        ctx.fillStyle = isPink ? `rgba(255,0,144,${a})` : `rgba(0,255,65,${a})`;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x * SIZE, y * SIZE);
        drops[x] = y * SIZE > H + Math.random() * 5000 ? 0 : y + 1;
      });
    }
    draw();
  }

  function stopRain() {
    if (_ssRainId) { cancelAnimationFrame(_ssRainId); _ssRainId = null; }
    const ctx = ssCanvas.getContext('2d');
    ctx.clearRect(0, 0, ssCanvas.width, ssCanvas.height);
  }

  const IDLE_MS = 45000;
  let idleTimer  = null;
  let clockTick  = null;
  let driftTimer = null;
  let active     = false;
  let ready      = false;

  function clock() {
    const n = new Date();
    tEl.textContent = n.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    if (dEl) dEl.textContent = n.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }

  function show() {
    if (active) return;
    active = true;
    clock();
    el.classList.add('ss-on');
    el.setAttribute('aria-hidden', 'false');
    clockTick  = setInterval(clock, 30000);
    startRain();
    driftTimer = setInterval(() => {
      if (!inner) return;
      const dx = (Math.random() - .5) * 60;
      const dy = (Math.random() - .5) * 28;
      inner.style.transform = `translate(${dx.toFixed(0)}px,${dy.toFixed(0)}px)`;
    }, 18000);
  }

  function hide() {
    if (!active) return;
    active = false;
    el.classList.remove('ss-on');
    el.setAttribute('aria-hidden', 'true');
    clearInterval(clockTick);
    clearInterval(driftTimer);
    stopRain();
    if (inner) inner.style.transform = '';
    reset();
  }

  function reset() {
    clearTimeout(idleTimer);
    if (!ready) return;
    idleTimer = setTimeout(show, IDLE_MS);
  }

  window._ssReady = () => { ready = true; reset(); };

  ['mousemove','mousedown','keydown','touchstart','scroll','wheel'].forEach(ev =>
    document.addEventListener(ev, () => { if (active) hide(); else reset(); }, { passive: true })
  );
}

function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, chars = [];

  const POOL   = '{}[]<>/\\;:#$%01&|!=+-~.,?@abcdef';
  const TOTAL  = 55;
  const SIZE   = 11;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildChars();
  }

  function rndChar() { return POOL[Math.floor(Math.random() * POOL.length)]; }

  function buildChars() {
    chars = Array.from({ length: TOTAL }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      char:  rndChar(),
      speed: .12 + Math.random() * .3,
      
      alpha: Math.random() * .12,
      teal:  Math.random() < .14,
      
      ttl:   Math.floor(Math.random() * 180),
    }));
  }

  ctx.font = `${SIZE}px 'JetBrains Mono', monospace`;

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${SIZE}px 'JetBrains Mono', monospace`;

    for (const c of chars) {
      
      c.y -= c.speed;

      
      const progress = 1 - c.y / H;  
      const fade = progress < .15
        ? progress / .15             
        : progress > .75
          ? 1 - (progress - .75) / .25
          : 1;

      ctx.globalAlpha = Math.max(0, c.alpha * fade);
      ctx.fillStyle = c.teal ? '#64ffda' : '#ffffff';
      ctx.fillText(c.char, c.x, c.y);

      
      if (c.y < -SIZE) {
        c.y     = H + SIZE;
        c.x     = Math.random() * W;
        c.alpha = .04 + Math.random() * .10;
        c.speed = .12 + Math.random() * .3;
        c.teal  = Math.random() < .14;
      }

      
      c.ttl--;
      if (c.ttl <= 0) {
        c.char = rndChar();
        c.ttl  = Math.floor(60 + Math.random() * 240);
      }
    }
    ctx.globalAlpha = 1;
  }

  window.addEventListener('resize', resize);

  resize();
  draw();
}

function setWallpaper(idx) {
  const el = document.getElementById('desktop-bg-img');
  if (!el || !window._bgImages?.length) return;
  idx = ((idx % window._bgImages.length) + window._bgImages.length) % window._bgImages.length;
  window._bgIdx = idx;
  localStorage.setItem('da-bg-idx', idx);
  el.style.backgroundImage = `url('assets/${window._bgImages[idx]}')`;
}

(async function loadBgImage() {
  const el = document.getElementById('desktop-bg-img');
  if (!el) return;

  const EXTS = ['jpg','jpeg','png','webp','avif'];

  function findSlot(n) {
    return new Promise(resolve => {
      let ei = 0;
      function tryExt() {
        if (ei >= EXTS.length) { resolve(null); return; }
        const name = `bg${n}.${EXTS[ei]}`;
        const img = new Image();
        img.onload  = () => resolve(name);
        img.onerror = () => { ei++; tryExt(); };
        img.src = `assets/${name}`;
      }
      tryExt();
    });
  }

  const found = [];
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => findSlot(i + 1)));
  results.forEach(r => { if (r) found.push(r); });

  if (!found.length) {
    for (const name of ['barcelonaneon.jpg','nebula2.jpg','bg.jpg','bg.jpeg','bg.png','bg.avif','bg.webp']) {
      const exists = await new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `assets/${name}`;
      });
      if (exists) { found.push(name); break; }
    }
  }

  if (!found.length) return;
  window._bgImages = found;
  const saved = parseInt(localStorage.getItem('da-bg-idx') || '0', 10);
  setWallpaper(Math.min(saved, found.length - 1));
})();

const TRANSLATIONS = {
  en: {
    'nav.profile':'Profile','nav.skills':'Skills','nav.certs':'Certifications',
    'nav.experience':'Experience','nav.contact':'Contact',
    'side.about':'About','side.info':'Info','side.langs':'Languages','side.edu':'Education',
    'certs.title':'Certifi<em>cations</em>',
    'cert.ccna':'CCNA: Introduction to Networks',
    'bio.p1':'IT professional with experience in international operational environments, currently pursuing a Higher Degree in <strong>Network Systems Administration</strong> with a Cybersecurity specialisation.',
    'bio.p2':'Managed contracts, clients and data using <strong>SAP, Salesforce and Mercury</strong> over 2 years at Sthree Spain. Six years in the US · C1 English · Multicultural environments.',
    'bio.p3':'Seeking roles in <strong>IT, networks and infrastructure</strong>.',
    'info.title':'Personal <em>info</em>','info.location.lbl':'Location',
    'info.edu.lbl':'Education','info.langs.lbl':'Languages',
    'langs.title':'Languages <em>&amp; Soft skills</em>',
    'soft.teamwork':'Teamwork','soft.problem':'Problem solving','soft.comm':'Communication',
    'soft.adapt':'Adaptability','soft.detail':'Attention to detail','soft.incident':'Incident management',
    'setup.title':'My <em>Setup</em>','setup.os':'Operating System','setup.editor':'Editor',
    'setup.terminal':'Terminal','setup.browser':'Browser',
    'skills.tools':'Tools',
    'setup.sectools':'Security Tools','setup.studying':'Currently studying',
    'skills.net':'Networks &amp; Systems','skills.os':'OS &amp; Admin','skills.tools':'Tools',
    'cert.inprogress':'In progress',
    'exp1.role':'Operations Specialist <em>Spain</em>',
    'exp1.li1':'Operations management, including onboarding training for new hires and incident support for internal teams and clients',
    'exp1.li2':'Analysis and improvement of operational processes, coordinating across different departments',
    'exp1.li3':'Management of clients, payments, and purchase orders using SAP, in collaboration with the Billing team',
    'exp1.li4':'Administration of contracts, placements, and operational data using SAP and Salesforce, and later Mercury',
    'exp2.role':'Player Relation <em>Manager</em>',
    'exp2.li1':'Recruitment of academy-level players',
    'exp2.li2':'Management and coordination with elite tournaments and European academies for international experiences',
    'exp2.li3':'Planning of travel, training sessions, and development programs for players',
    'exp3.role':'Player Developmental / <em>Project Manager Assistant</em>',
    'exp3.li1':'Implementation and oversight of the DV7 methodology at the New York academy',
    'exp3.li2':'Institutional coordination with leagues, federations, and local football organizations',
    'exp3.li3':'Management of events and special projects, including DV7 experiences, international camps, and university scholarship programs',
    'exp4.role':'Internship — Operations <em>Trainee</em>',
    'exp4.li1':'Support in esports event production and live streams on Twitch',
    'exp4.li2':'A/V quality optimisation: OBS Studio, NDI, lighting and audio',
    'exp4.li3':'Installation and configuration of hardware/software including PCs, games, anti-cheat and firmware',
    'contact.title':'Contact <em>me.</em>','contact.name.lbl':'Name *',
    'contact.email.lbl':'Email *','contact.msg.lbl':'Message *','contact.send':'Send message',
    'dock.profile':'Profile','dock.skills':'Skills','dock.certs':'Certs',
    'dock.experience':'Experience','dock.contact':'Contact',
  },
  es: {
    'nav.profile':'Perfil','nav.skills':'Habilidades','nav.certs':'Certificaciones',
    'nav.experience':'Experiencia','nav.contact':'Contacto',
    'side.about':'Sobre mí','side.info':'Info','side.langs':'Idiomas','side.edu':'Educación',
    'certs.title':'Certificaci<em>ones</em>',
    'cert.ccna':'CCNA: Introducción a las Redes',
    'bio.p1':'Profesional IT con experiencia en entornos operacionales internacionales, actualmente cursando un CFGS en <strong>Administración de Sistemas en Red</strong> con especialización en Ciberseguridad.',
    'bio.p2':'Gestioné contratos, clientes y datos usando <strong>SAP, Salesforce y Mercury</strong> durante 2 años en Sthree Spain. Seis años en EE.UU. · Inglés C1 · Entornos multiculturales.',
    'bio.p3':'En búsqueda de empleo en <strong>IT, redes e infraestructura</strong>.',
    'info.title':'Información <em>personal</em>','info.location.lbl':'Ubicación',
    'info.edu.lbl':'Educación','info.langs.lbl':'Idiomas',
    'langs.title':'Idiomas <em>y soft skills</em>',
    'soft.teamwork':'Trabajo en equipo','soft.problem':'Resolución de problemas',
    'soft.comm':'Comunicación','soft.adapt':'Adaptabilidad',
    'soft.detail':'Atención al detalle','soft.incident':'Gestión de incidencias',
    'setup.title':'Mi <em>Setup</em>','setup.os':'Sistema operativo','setup.editor':'Editor',
    'setup.terminal':'Terminal','setup.browser':'Navegador',
    'skills.tools':'Herramientas',
    'setup.sectools':'Herramientas de seguridad','setup.studying':'Estudiando ahora',
    'skills.net':'Redes y Sistemas','skills.os':'SO y Administración','skills.tools':'Herramientas',
    'cert.inprogress':'En curso',
    'exp1.role':'Operations Specialist <em>Spain</em>',
    'exp1.li1':'Gestión operacional, incluyendo formación de incorporaciones y soporte de incidencias para equipos internos y clientes',
    'exp1.li2':'Análisis y mejora de procesos operacionales, coordinando entre diferentes departamentos',
    'exp1.li3':'Gestión de clientes, pagos y órdenes de compra mediante SAP, en colaboración con el equipo de Billing',
    'exp1.li4':'Administración de contratos, colocaciones y datos operacionales con SAP, Salesforce y Mercury',
    'exp2.role':'Player Relation <em>Manager</em>',
    'exp2.li1':'Captación de jugadores para academias de alto rendimiento',
    'exp2.li2':'Gestión y coordinación con torneos de élite y academias europeas para experiencias internacionales',
    'exp2.li3':'Planificación de viajes, sesiones de entrenamiento y programas de desarrollo de jugadores',
    'exp3.role':'Player Developmental / <em>Project Manager Assistant</em>',
    'exp3.li1':'Implementación y supervisión de la metodología DV7 en la academia de Nueva York',
    'exp3.li2':'Coordinación institucional con ligas, federaciones y organizaciones de fútbol locales',
    'exp3.li3':'Gestión de eventos y proyectos especiales: experiencias DV7, campus internacionales y becas universitarias',
    'exp4.role':'Prácticas — Operations <em>Trainee</em>',
    'exp4.li1':'Apoyo en producción de eventos esports y retransmisiones en directo por Twitch',
    'exp4.li2':'Optimización de calidad A/V: OBS Studio, NDI, iluminación y audio',
    'exp4.li3':'Instalación y configuración de hardware/software: PCs, videojuegos, anti-cheat y firmware',
    'contact.title':'Contáct<em>ame.</em>','contact.name.lbl':'Nombre *',
    'contact.email.lbl':'Email *','contact.msg.lbl':'Mensaje *','contact.send':'Enviar mensaje',
    'dock.profile':'Perfil','dock.skills':'Skills','dock.certs':'Certs',
    'dock.experience':'Experiencia','dock.contact':'Contacto',
  }
};

function applyLang(lang) {
  window._lang = lang;
  localStorage.setItem('da-lang', lang);
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (T[el.dataset.i18n] !== undefined) el.textContent = T[el.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    if (T[el.dataset.i18nHtml] !== undefined) el.innerHTML = T[el.dataset.i18nHtml];
  });
  const btn = document.getElementById('mb-lang-btn');
  if (btn) btn.textContent = lang === 'en' ? 'ES' : 'EN';
  document.documentElement.lang = lang;
}

document.getElementById('mb-lang-btn')?.addEventListener('click', () => {
  applyLang(window._lang === 'en' ? 'es' : 'en');
});

document.querySelectorAll('.dhn').forEach(wrapLetters);
if (!window.matchMedia('(max-width:768px)').matches) {
  try { initScene(); } catch (e) { console.error('[Scene init]', e); }
} else {
  const glLoad = document.getElementById('gl-load');
  if (glLoad) glLoad.style.display = 'none';
}
initCursorTrail();
initStarfield();

function initContextMenu() {
  const menu    = document.getElementById('ctx-menu');
  const desktop = document.getElementById('desktop');
  if (!menu || !desktop) return;

  function open(x, y) {
    menu.style.left = Math.min(x, window.innerWidth  - menu.offsetWidth  - 12) + 'px';
    menu.style.top  = Math.min(y, window.innerHeight - menu.offsetHeight - 12) + 'px';
    menu.classList.add('open');
  }
  function close() { menu.classList.remove('open'); }

  desktop.addEventListener('contextmenu', e => {
    if (e.target.closest('.win,.di,#dock,#menubar,button,a,input,textarea')) return;
    e.preventDefault();
    close();
    requestAnimationFrame(() => open(e.clientX, e.clientY));
  });

  document.addEventListener('click',    e => { if (!menu.contains(e.target)) close(); });
  document.addEventListener('keydown',  e => { if (e.key === 'Escape') close(); });
  document.addEventListener('contextmenu', e => { if (!desktop.contains(e.target)) close(); });

  menu.querySelectorAll('.ctx-item[data-action]').forEach(item => {
    item.addEventListener('click', () => {
      close();
      const action = item.dataset.action;
      if (action === 'terminal')  { openWindow('terminal'); return; }
      if (action === 'spotlight') { document.getElementById('mb-sp-btn')?.click(); return; }
      if (action === 'about')     { openWindow('about');    return; }
      if (action === 'skills')    { openWindow('skills');   return; }
      if (action === 'projects')  { openWindow('projects'); return; }
      if (action === 'wallpaper') {
        if (!window._bgImages?.length) {
          showToast('fas fa-image', 'No wallpapers found', 'Add bg1.jpg, bg2.jpg… to assets/');
          return;
        }
        close();
        window._openWpPicker?.();
        return;
      }
      if (action === 'sysinfo') {
        const ua    = navigator.userAgent;
        const cores = navigator.hardwareConcurrency || '?';
        const arch  = /arm|aarch64/i.test(ua) ? 'arm64' : 'x86_64';
        let os = 'Unknown';
        if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
        else if (/Mac OS X/.test(ua))      os = 'macOS';
        else if (/Android/.test(ua))       os = 'Android';
        else if (/Linux/.test(ua))         os = 'Linux';
        showToast('fas fa-microchip', 'DA.OS — v2026.06',
          `${os} · ${arch} · ${cores} cores`);
        return;
      }
    });
  });

  // ── Dock icon right-click ─────────────────────────────────
  const dockMenu = document.getElementById('dock-ctx-menu');
  let _dockCtxDi = null;
  const DOCK_INFO = {
    about:      'Personal background, tools and introduction',
    skills:     'Technical stack: networking, dev, cloud & security',
    certs:      'Professional certifications and achievements',
    experience: 'Work history and key professional roles',
    contact:    'Email, LinkedIn and direct contact options',
  };

  function openDockMenu(di, x, y) {
    _dockCtxDi = di;
    close(); // close desktop ctx menu if open
    dockMenu.setAttribute('aria-hidden', 'false');
    dockMenu.style.left = Math.min(x, window.innerWidth  - 180) + 'px';
    dockMenu.style.top  = Math.min(y, window.innerHeight - 80)  + 'px';
    dockMenu.classList.add('open');
  }
  function closeDockMenu() {
    dockMenu.classList.remove('open');
    dockMenu.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('dock')?.addEventListener('contextmenu', e => {
    const di = e.target.closest('.di[data-win]');
    if (!di) return;
    e.preventDefault();
    closeDockMenu();
    requestAnimationFrame(() => openDockMenu(di, e.clientX, e.clientY));
  });

  document.addEventListener('click', e => {
    if (!dockMenu.contains(e.target)) closeDockMenu();
  });

  document.getElementById('dctx-open')?.addEventListener('click', () => {
    const win = _dockCtxDi?.dataset.win;
    closeDockMenu();
    if (win) openWindow(win);
  });

  document.getElementById('dctx-info')?.addEventListener('click', () => {
    const win = _dockCtxDi?.dataset.win;
    closeDockMenu();
    if (!win) return;
    const label = _dockCtxDi.querySelector('.di-label')?.textContent?.trim() || win;
    showToast('fas fa-circle-info', label, DOCK_INFO[win] || win);
  });
}

function initWeather() {
  const el = document.getElementById('mb-weather');
  if (!el) return;

  const WMO = {
    0:'fa-sun',1:'fa-sun',2:'fa-cloud-sun',3:'fa-cloud',
    45:'fa-smog',48:'fa-smog',
    51:'fa-cloud-drizzle',53:'fa-cloud-drizzle',55:'fa-cloud-drizzle',
    61:'fa-cloud-rain',63:'fa-cloud-rain',65:'fa-cloud-showers-heavy',
    71:'fa-snowflake',73:'fa-snowflake',75:'fa-snowflake',77:'fa-snowflake',
    80:'fa-cloud-rain',81:'fa-cloud-showers-heavy',82:'fa-cloud-showers-heavy',
    85:'fa-snowflake',86:'fa-snowflake',
    95:'fa-cloud-bolt',96:'fa-cloud-bolt',99:'fa-cloud-bolt',
  };

  async function fetch_weather() {
    try {
      const r = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=41.38&longitude=2.17&current_weather=true&temperature_unit=celsius'
      );
      if (!r.ok) return;
      const d = await r.json();
      const cw   = d.current_weather;
      const temp = Math.round(cw.temperature);
      const icon = WMO[cw.weathercode] || 'fa-cloud';
      el.innerHTML = `<i class="fas ${icon}"></i>${temp}°C`;
      el.classList.add('loaded');
    } catch (_) {}
  }

  fetch_weather();
  setInterval(fetch_weather, 30 * 60 * 1000);
}

function initFavicon() {
  const fav  = document.querySelector('link[rel="icon"]');
  if (!fav) return;
  const ORIG = fav.getAttribute('href');
  const cv   = document.createElement('canvas');
  cv.width   = cv.height = 32;
  const ctx  = cv.getContext('2d');
  let rafId  = null, angle = 0;

  function _bg(fill) {
    ctx.clearRect(0, 0, 32, 32);
    ctx.beginPath();
    ctx.moveTo(7, 0); ctx.lineTo(25, 0);
    ctx.arcTo(32, 0, 32, 7, 7); ctx.lineTo(32, 25);
    ctx.arcTo(32, 32, 25, 32, 7); ctx.lineTo(7, 32);
    ctx.arcTo(0, 32, 0, 25, 7); ctx.lineTo(0, 7);
    ctx.arcTo(0, 0, 7, 0, 7); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }

  function _spin(a) {
    _bg('#09090f');
    ctx.beginPath(); ctx.arc(16, 16, 11, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,255,218,.14)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(16, 16, 11, a, a + Math.PI * 0.75);
    ctx.strokeStyle = '#64ffda'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
    fav.href = cv.toDataURL();
  }

  function _start() {
    if (rafId) return;
    function tick() { angle += 0.12; _spin(angle); rafId = requestAnimationFrame(tick); }
    tick();
  }

  function _stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    fav.href = ORIG;
  }

  window._favStop  = _stop;
  window._favCheck = function() {
    _stop();
    _bg('#0d2b1e');
    ctx.strokeStyle = '#30a14e'; ctx.lineWidth = 3;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(8, 16); ctx.lineTo(13, 22); ctx.lineTo(24, 10); ctx.stroke();
    fav.href = cv.toDataURL();
    setTimeout(_stop, 3000);
  };

  _start();
}

initFavicon();

runLoader(() => {
  window._favStop?.();
  startClock();
  desktopEntrance();
  initTyped();
  initMobileOverlay();
  requestAnimationFrame(() => {
    initDragging();
    initResize();
    initControls();
    initSidebarTabs();
    initSpotlight();
    initValidation();
    initForm();
    initFullpageBtn();

    initDockMagnification();
    initHeroGlitch();
    initClickRipple();
    initWinTitleScramble();
    initScreensaver();
    initSFX();
    initContextMenu();
    initWeather();
    initCalendar();
    initWallpaperPicker();
    if (window._lang === 'es') applyLang('es');
  });
});

function initCalendar() {
  const cal    = document.getElementById('mb-calendar');
  const timeEl = document.getElementById('mb-time');
  const dateEl = document.getElementById('mb-date');
  const title  = document.getElementById('mb-cal-title');
  const days   = document.getElementById('mb-cal-days');
  if (!cal || !timeEl || !days) return;

  let viewDate = new Date();

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function render() {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const today = new Date();
    title.textContent = `${MONTHS[m]} ${y}`;
    days.innerHTML = '';

    const firstDay   = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'mb-cal-day empty';
      days.appendChild(el);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      el.className = 'mb-cal-day';
      const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
      if (isToday) el.classList.add('today');
      el.textContent = d;
      days.appendChild(el);
    }
  }

  function open() {
    viewDate = new Date();
    render();
    cal.classList.add('open');
    cal.setAttribute('aria-hidden', 'false');
  }
  function close() {
    cal.classList.remove('open');
    cal.setAttribute('aria-hidden', 'true');
  }
  function toggle() { cal.classList.contains('open') ? close() : open(); }

  [timeEl, dateEl].forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); toggle(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  document.getElementById('mb-cal-prev')?.addEventListener('click', e => {
    e.stopPropagation();
    viewDate.setMonth(viewDate.getMonth() - 1);
    render();
  });
  document.getElementById('mb-cal-next')?.addEventListener('click', e => {
    e.stopPropagation();
    viewDate.setMonth(viewDate.getMonth() + 1);
    render();
  });

  document.addEventListener('click', e => {
    if (!cal.contains(e.target) && e.target !== timeEl && e.target !== dateEl) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function initWallpaperPicker() {
  const picker = document.getElementById('wp-picker');
  const grid   = document.getElementById('wp-picker-grid');
  if (!picker || !grid) return;

  let _skipNext = false;

  function closePicker() {
    picker.classList.remove('open');
    picker.setAttribute('aria-hidden', 'true');
  }

  window._openWpPicker = function() {
    const imgs = window._bgImages;
    if (!imgs?.length) return;
    grid.innerHTML = '';
    imgs.forEach((img, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'wp-thumb' + (i === (window._bgIdx ?? 0) ? ' active' : '');
      thumb.style.backgroundImage = `url('assets/${img}')`;
      const num = document.createElement('span');
      num.className = 'wp-thumb-num';
      num.textContent = img.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
      thumb.appendChild(num);
      thumb.addEventListener('click', e => {
        e.stopPropagation();
        setWallpaper(i);
        grid.querySelectorAll('.wp-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
        setTimeout(closePicker, 300);
      });
      grid.appendChild(thumb);
    });
    _skipNext = true;
    picker.classList.add('open');
    picker.setAttribute('aria-hidden', 'false');
  };

  document.getElementById('wp-picker-close')?.addEventListener('click', e => {
    e.stopPropagation();
    closePicker();
  });
  document.addEventListener('click', e => {
    if (_skipNext) { _skipNext = false; return; }
    if (!picker.contains(e.target)) closePicker();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePicker(); });
}

