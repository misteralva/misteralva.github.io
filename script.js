// ============================================
// DAVID ÁLVAREZ - CYBERSECURITY PORTFOLIO
// ============================================

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ========== DATOS DE PROYECTOS ==========
const projectsData = [
    {
        id: 0,
        title: "Web StarterKit",
        tags: ["HTML", "CSS", "JavaScript"],
        description: "Kit de inicio completo para proyectos web con estructura modular, mejores prácticas de desarrollo frontend y configuración lista para producción.",
        features: ["Estructura de carpetas modular y escalable","Sistema de componentes reutilizables","Optimización de assets y lazy loading","Compatible con diferentes frameworks","Documentación completa incluida"],
        technologies: ["HTML5", "CSS3", "JavaScript ES6", "Webpack", "Git"],
        github: "https://github.com/misteralva/Web-StarterKit", demo: null
    },
    {
        id: 1,
        title: "GSAP Actividad",
        tags: ["GSAP", "JavaScript", "Animaciones"],
        description: "Proyecto académico implementando animaciones avanzadas con GSAP, efectos de scroll interactivos y transiciones fluidas para interfaces web modernas.",
        features: ["Animaciones de scroll con ScrollTrigger","Efectos parallax y reveal dinámicos","Transiciones suaves entre secciones","Optimización de rendimiento","Responsive animations"],
        technologies: ["GSAP 3.x", "ScrollTrigger", "JavaScript", "CSS3"],
        github: "https://github.com/misteralva/GSAP-Actividad", demo: null
    },
    {
        id: 2,
        title: "GSAP Práctica",
        tags: ["GSAP", "ScrollTrigger", "Web Design"],
        description: "Ejercicios prácticos de animación web con GSAP, explorando diferentes técnicas de motion design y efectos visuales para mejorar la experiencia de usuario.",
        features: ["Timeline animations complejas","Morphing de elementos SVG","Efectos de entrada y salida creativos","Integración con eventos del usuario","Código comentado y documentado"],
        technologies: ["GSAP", "TextPlugin", "MorphSVG", "JavaScript", "HTML5"],
        github: "https://github.com/misteralva/GSAP-Practica", demo: null
    },
    {
        id: 3,
        title: "Network Security Scanner",
        tags: ["Python", "Nmap", "Security"],
        description: "Herramienta de escaneo de vulnerabilidades de red con interfaz web interactiva.",
        features: ["Escaneo de puertos y servicios","Detección de vulnerabilidades conocidas","Dashboard web con visualización en tiempo real","Generación de reportes en PDF","Integración con bases de datos CVE"],
        technologies: ["Python", "Nmap", "Flask", "PostgreSQL", "Chart.js"],
        github: "#", demo: null
    },
    {
        id: 4,
        title: "Firewall Monitor Dashboard",
        tags: ["Linux", "iptables", "Monitoring"],
        description: "Sistema de monitorización en tiempo real para reglas de firewall y análisis de tráfico de red.",
        features: ["Monitorización en tiempo real de iptables","Análisis de logs y detección de anomalías","Sistema de alertas por email/Slack","Gráficas de tráfico y estadísticas","Backup automático de configuraciones"],
        technologies: ["Linux", "iptables", "Python", "Node.js", "WebSocket"],
        github: "#", demo: null
    },
    {
        id: 5,
        title: "System Automation Suite",
        tags: ["Python", "Bash", "DevOps"],
        description: "Colección de scripts para automatización de tareas de administración de sistemas Linux y Windows.",
        features: ["Automatización de backups y restauraciones","Scripts de monitorización de recursos","Gestión de usuarios y permisos","Updates y parches automatizados","Documentación completa de cada script"],
        technologies: ["Python", "Bash", "PowerShell", "Cron", "systemd"],
        github: "#", demo: null
    }
];

// ========== SCROLL PROGRESS ==========
const progressBar = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
});

// ========== SCROLL TO TOP ==========
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.classList.add('scroll-to-top');
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.pageYOffset > 500);
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    gsap.fromTo(scrollTopBtn, { scale: 1 }, { scale: 0.8, duration: 0.2, yoyo: true, repeat: 1 });
});

// ========== PARTÍCULAS ==========
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];
const particleCount = 100;
let mouse = { x: null, y: null, radius: 150 };

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(0, 255, 136, ${Math.random() * 0.5 + 0.3})`;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= Math.cos(angle) * force * 2;
            this.y -= Math.sin(angle) * force * 2;
        }
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) particles.push(new Particle());

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 150) {
                ctx.strokeStyle = `rgba(0, 255, 136, ${1 - d / 150})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

(function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
})();

window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

// ========== MAGNETIC BUTTONS ==========
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
});

// ========== MENÚ MÓVIL ==========
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    gsap.to(menuToggle.children[0], { rotation: isActive ? 45 : 0, y: isActive ? 7 : 0, duration: 0.3 });
    gsap.to(menuToggle.children[1], { opacity: isActive ? 0 : 1, duration: 0.2 });
    gsap.to(menuToggle.children[2], { rotation: isActive ? -45 : 0, y: isActive ? -7 : 0, duration: 0.3 });
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        gsap.to(menuToggle.children, { rotation: 0, y: 0, opacity: 1 });
    });
});

// ========== TYPEWRITER ==========
const typedText = document.querySelector('.typed-text');
const phrases = ['Operations Specialist', 'ASIR - Ciberseguridad', 'Systems Administrator'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
    const current = phrases[phraseIndex];
    if (isDeleting) { typedText.textContent = current.substring(0, charIndex - 1); charIndex--; }
    else { typedText.textContent = current.substring(0, charIndex + 1); charIndex++; }
    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === current.length) { speed = 2000; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; speed = 500; }
    setTimeout(typeEffect, speed);
}

// ========== HERO TITLE — SPLIT CHAR ANIMATION ==========
function splitAndAnimateTitle() {
    const titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;
    const rawText = titleEl.textContent.trim();
    titleEl.innerHTML = '';
    titleEl.style.visibility = 'visible';
    titleEl.style.position = 'relative';
    const words = rawText.split(' ');
    const allChars = [];
    words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        word.split('').forEach(letter => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.textContent = letter;
            gsap.set(charSpan, { opacity: 0, y: 80, rotationX: -90, transformOrigin: '50% 50% -30px' });
            wordSpan.appendChild(charSpan);
            allChars.push(charSpan);
        });
        titleEl.appendChild(wordSpan);
        if (wIdx < words.length - 1) titleEl.appendChild(document.createTextNode(' '));
    });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(allChars, { opacity: 1, y: 0, rotationX: 0, duration: 0.7, ease: 'back.out(1.5)', stagger: { amount: 0.9, from: 'start' } });
    tl.to(allChars, { textShadow: '0 0 30px rgba(0,255,136,0.8)', duration: 0.3, stagger: { amount: 0.4, from: 'start' } }, '+=0.2')
      .to(allChars, { textShadow: '0 0 0px rgba(0,255,136,0)', duration: 0.5, stagger: { amount: 0.4, from: 'start' } });
    return tl;
}

// ========== ANIMACIONES HERO ==========
const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
heroTimeline
    .add(splitAndAnimateTitle())
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
    .from('.hero-description', { opacity: 0, y: 30, duration: 0.8 }, '-=0.5')
    .from('.hero-buttons .btn', { opacity: 0, y: 30, stagger: 0.15, duration: 0.6 }, '-=0.5')
    .from('.badge', { opacity: 0, scale: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')
    .add(() => setTimeout(typeEffect, 600), '-=0.5');

document.querySelectorAll('.hero-title .char').forEach(char => {
    char.addEventListener('mouseenter', () => { gsap.to(char, { color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,1)', scale: 1.2, duration: 0.2, ease: 'power2.out' }); });
    char.addEventListener('mouseleave', () => { gsap.to(char, { color: '', textShadow: '', scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }); });
});

// ========== SVG ANIMADO ==========
gsap.to('.svg-circle', { attr: { r: 200 }, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
gsap.to('.svg-path', { attr: { d: 'M 100 300 Q 400 400 700 300 T 100 300' }, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });

// ========== NAVBAR ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.pageYOffset > 100); });

// ========== TEXT SCRAMBLE ==========
class TextScramble {
    constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            this.queue.push({ from: oldText[i] || '', to: newText[i] || '', start: Math.floor(Math.random() * 40), end: Math.floor(Math.random() * 40) + Math.floor(Math.random() * 40) });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0; this.update(); return promise;
    }
    update() {
        let output = '', complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; }
            else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) { char = this.chars[Math.floor(Math.random() * this.chars.length)]; this.queue[i].char = char; }
                output += `<span style="color: var(--secondary);">${char}</span>`;
            } else { output += from; }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) this.resolve();
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
}

document.querySelectorAll('.section-title[data-scramble]').forEach(title => {
    const originalText = title.getAttribute('data-scramble');
    const fx = new TextScramble(title);
    ScrollTrigger.create({ trigger: title, start: 'top 80%', once: true, onEnter: () => fx.setText(originalText) });
});

// ========== ABOUT ==========
gsap.from('.about-text p', { scrollTrigger: { trigger: '.about-text', start: 'top 80%' }, opacity: 0, y: 50, duration: 1, stagger: 0.2, ease: 'power3.out' });

document.querySelectorAll('.language-progress').forEach(bar => {
    const width = bar.getAttribute('data-width');
    ScrollTrigger.create({ trigger: bar, start: 'top 85%', onEnter: () => gsap.to(bar, { width: width + '%', duration: 1.5, ease: 'power2.out' }) });
});

document.querySelectorAll('.stat-number').forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    ScrollTrigger.create({ trigger: stat, start: 'top 80%', onEnter: () => {
        gsap.to(stat, { textContent: target, duration: 2, ease: 'power1.out', snap: { textContent: 1 }, onUpdate() { stat.textContent = Math.ceil(stat.textContent); } });
    }});
});

// ========== SKILLS ==========
(function initSkillRings() {
    const items = document.querySelectorAll('.skill-item');
    const circumference = 2 * Math.PI * 44;
    items.forEach(item => {
        const level = parseInt(item.getAttribute('data-level')) || 0;
        const ring = item.querySelector('circle.ring');
        const percentEl = item.querySelector('.skill-percent');
        if (!ring) return;
        ring.setAttribute('stroke-dasharray', String(circumference));
        ring.setAttribute('stroke-dashoffset', String(circumference));
        if (percentEl) percentEl.textContent = '0%';
        const targetOffset = circumference * (1 - level / 100);
        const iconEl = item.querySelector('.skill-ring i');
        ScrollTrigger.create({ trigger: item, start: 'top 85%', onEnter: () => {
            gsap.to(ring, { attr: { 'stroke-dashoffset': targetOffset }, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
            if (percentEl) gsap.to({ val: 0 }, { val: level, duration: 1.2, ease: 'power2.out', onUpdate: function() { percentEl.textContent = Math.round(this.targets()[0].val) + '%'; } });
            if (iconEl) gsap.to(iconEl, { opacity: 1, delay: 0.3, duration: 0.8 });
        }});
        item.addEventListener('mouseenter', () => { gsap.to(ring, { attr: { 'stroke-dashoffset': Math.max(0, targetOffset - circumference * 0.05) }, duration: 0.35, overwrite: 'auto' }); });
        item.addEventListener('mouseleave', () => { gsap.to(ring, { attr: { 'stroke-dashoffset': targetOffset }, duration: 0.35, overwrite: 'auto' }); });
    });
})();

// ========== CERTIFICACIONES ==========
(function initCertReveal() {
    const cards = document.querySelectorAll('.cert-card');
    cards.forEach(card => { gsap.set(card, { opacity: 0, rotationY: 25, rotationX: 10, scale: 0.88, transformOrigin: 'center center', transformPerspective: 800 }); });
    ScrollTrigger.create({ trigger: '.certifications-grid', start: 'top 80%', once: true, onEnter: () => {
        gsap.to(cards, { opacity: 1, rotationY: 0, rotationX: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)', stagger: { amount: 0.8, grid: 'auto', from: 'start' } });
    }});
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => { gsap.to(card, { rotationY: -4, rotationX: 4, scale: 1.03, duration: 0.35, ease: 'power2.out', transformPerspective: 800 }); });
        card.addEventListener('mouseleave', () => { gsap.to(card, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', transformPerspective: 800 }); });
    });
})();

// ========== PROYECTOS ==========
(function initProjectReveal() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        gsap.set(card, { opacity: 0, x: fromLeft ? -60 : 60, y: 40, rotationZ: fromLeft ? -3 : 3, scale: 0.9, transformOrigin: 'center bottom' });
        ScrollTrigger.create({ trigger: card, start: 'top 88%', once: true, onEnter: () => {
            gsap.to(card, { opacity: 1, x: 0, y: 0, rotationZ: 0, scale: 1, duration: 0.8, delay: (i % 3) * 0.12, ease: 'power3.out' });
        }});
    });
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            gsap.to(card, { rotationX: (y - rect.height / 2) / 15, rotationY: (rect.width / 2 - x) / 15, duration: 0.3, ease: 'power2.out', transformPerspective: 1000, transformOrigin: 'center' });
        });
        card.addEventListener('mouseleave', () => { gsap.to(card, { rotationX: 0, rotationY: 0, rotationZ: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }); });
    });
})();

// ========== FILTER ==========
const filterBtns = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        const btnText = btn.querySelector('span');
        const originalText = btnText.textContent;
        let count = 0;
        const interval = setInterval(() => {
            if (count < 5) { btnText.textContent = originalText.split('').map(() => '!<>-_\\/[]{}—=+*^?#'[Math.floor(Math.random() * 17)]).join(''); count++; }
            else { btnText.textContent = originalText; clearInterval(interval); }
        }, 50);
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        projects.forEach(project => {
            const category = project.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                gsap.to(project, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.4)', onStart: () => project.style.display = 'block' });
            } else {
                gsap.to(project, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => project.style.display = 'none' });
            }
        });
    });
});

// ========== MODAL ==========
const modal = document.getElementById('projectModal');
const modalOverlay = modal.querySelector('.modal-overlay');
const modalClose = modal.querySelector('.modal-close');

function openModal(projectId) {
    const project = projectsData[projectId];
    modal.querySelector('.modal-title').textContent = project.title;
    modal.querySelector('.modal-text').textContent = project.description;
    modal.querySelector('.modal-tags').innerHTML = project.tags.map(t => `<span>${t}</span>`).join('');
    modal.querySelector('.modal-features-list').innerHTML = project.features.map(f => `<li>${f}</li>`).join('');
    modal.querySelector('.modal-tech-list').innerHTML = project.technologies.map(t => `<span>${t}</span>`).join('');
    const githubLink = modal.querySelector('.github-link');
    const demoLink = modal.querySelector('.demo-link');
    githubLink.href = project.github;
    demoLink.style.display = project.demo ? 'inline-flex' : 'none';
    if (project.demo) demoLink.href = project.demo;
    const icon = modal.querySelector('.modal-placeholder i');
    icon.className = project.tags[0] === 'Python' ? 'fab fa-python' : project.tags[0] === 'GSAP' ? 'fas fa-magic' : 'fas fa-code';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('.modal-content', 
    { scale: 0.8, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.4)' }
);
}

function closeModal() {
    gsap.to('.modal-content', { scale: 0.8, opacity: 0, duration: 0.2, onComplete: () => { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } });
}

document.querySelectorAll('.project-details-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); openModal(parseInt(btn.getAttribute('data-project'))); });
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

// ========== TIMELINE ==========
gsap.from('.timeline-item', { scrollTrigger: { trigger: '.timeline', start: 'top 80%' }, opacity: 0, x: -100, duration: 1, stagger: 0.3, ease: 'power3.out' });
gsap.from('.timeline-dot', { scrollTrigger: { trigger: '.timeline', start: 'top 80%' }, scale: 0, duration: 0.6, stagger: 0.3, ease: 'back.out(2)' });

// ========== CONTACTO ==========
gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-content', start: 'top 80%' }, opacity: 0, x: -80, duration: 1, ease: 'power3.out' });
gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-content', start: 'top 80%' }, opacity: 0, x: 80, duration: 1, ease: 'power3.out' });
gsap.from('.social-link', { scrollTrigger: { trigger: '.social-links', start: 'top 90%' }, opacity: 0, scale: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(2)' });

// ========== FORMULARIO — Formspree (funciona en GitHub Pages sin servidor) ==========

const FORMSPREE_URL = 'https://formspree.io/f/mlgwwwke';

// Contador de caracteres
const msgTextarea = document.getElementById('inputMessage');
const charCounter  = document.getElementById('charCounter');

if (msgTextarea && charCounter) {
    msgTextarea.addEventListener('input', () => {
        const len = msgTextarea.value.length;
        charCounter.textContent = `${len} / 5000`;
        charCounter.className = 'char-counter';
        if (len > 4250) charCounter.classList.add('warn');
        if (len >= 5000) charCounter.classList.add('limit');
    });
}

// Reglas de validación por campo
function getFieldRules(id) {
    if (id === 'inputName')    return [
        { test: v => v.length >= 2,   message: 'Mínimo 2 caracteres.' },
        { test: v => v.length <= 100, message: 'Nombre demasiado largo.' }
    ];
    if (id === 'inputEmail')   return [
        { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Email no válido.' },
        { test: v => v.length <= 254, message: 'Email demasiado largo.' }
    ];
    if (id === 'inputMessage') return [
        { test: v => v.length >= 10,  message: 'Mínimo 10 caracteres.' },
        { test: v => v.length <= 5000, message: 'Máximo 5000 caracteres.' }
    ];
    return [];
}

// Valida un campo individual y pinta su estado
function validateField(id, errorId, rules) {
    const field = document.getElementById(id);
    const errEl = document.getElementById(errorId);
    const val   = field ? field.value.trim() : '';
    let   msg   = '';
    for (const rule of rules) { if (!rule.test(val)) { msg = rule.message; break; } }
    if (errEl) errEl.textContent = msg;
    if (field) gsap.to(field, { borderColor: msg ? '#ff0080' : 'rgba(0,255,136,0.2)', duration: 0.3 });
    return msg === '';
}

// Validación completa
function clientValidate() {
    const v1 = validateField('inputName',    'errName',    getFieldRules('inputName'));
    const v2 = validateField('inputEmail',   'errEmail',   getFieldRules('inputEmail'));
    const v3 = validateField('inputMessage', 'errMessage', getFieldRules('inputMessage'));
    return v1 && v2 && v3;
}

// Validación en tiempo real al salir de cada campo
[
    { id: 'inputName',    err: 'errName'    },
    { id: 'inputEmail',   err: 'errEmail'   },
    { id: 'inputMessage', err: 'errMessage' }
].forEach(({ id, err }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id, err, getFieldRules(id)));
});

// Envío con Formspree (AJAX — sin recargar la página)
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!clientValidate()) {
            gsap.fromTo(contactForm,
                { x: -8 },
                { x: 8, repeat: 3, yoyo: true, duration: 0.1, ease: 'power1.inOut',
                  onComplete: () => gsap.set(contactForm, { x: 0 }) }
            );
            return;
        }

        const originalHTML  = submitBtn.innerHTML;
        submitBtn.disabled  = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        formStatus.className   = 'form-status';
        formStatus.textContent = '';

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.className   = 'form-status success';
                formStatus.textContent = '✓ ¡Mensaje enviado! Te responderé pronto.';
                gsap.from(formStatus, { opacity: 0, y: -10, duration: 0.4 });

                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
                gsap.to(submitBtn, { backgroundColor: 'var(--primary)', color: 'var(--darker)', duration: 0.3 });

                contactForm.reset();
                if (charCounter) { charCounter.textContent = '0 / 5000'; charCounter.className = 'char-counter'; }

                setTimeout(() => {
                    gsap.to(submitBtn, {
                        backgroundColor: 'transparent', color: 'var(--primary)', duration: 0.3,
                        onComplete: () => { submitBtn.innerHTML = originalHTML; submitBtn.disabled = false; }
                    });
                }, 4000);

            } else {
                const data = await response.json();
                throw new Error(data?.errors?.map(e => e.message).join(', ') || 'Error al enviar.');
            }

        } catch (error) {
            formStatus.className   = 'form-status error';
            formStatus.textContent = '✗ No se pudo enviar. Escríbeme a imdavidalvarez@gmail.com';
            gsap.from(formStatus, { opacity: 0, y: -10, duration: 0.4 });
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled  = false;
        }
    });
}

// ========== PARALLAX HERO ==========
gsap.to('.hero-content', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    y: 200, opacity: 0.3
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    });
});

// ========== NAV ACTIVA ==========
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => { if (window.pageYOffset >= section.offsetTop - 200) current = section.getAttribute('id'); });
    navItems.forEach(item => { item.classList.toggle('active', item.getAttribute('href').slice(1) === current); });
});

// ========== SECTION TRANSITIONS ==========
gsap.utils.toArray('section').forEach((section, i) => {
    if (i === 0) return;
    gsap.from(section, { scrollTrigger: { trigger: section, start: 'top 90%' }, opacity: 0, y: 100, duration: 1, ease: 'power3.out' });
});

// ========== REDUCED MOTION ==========
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(0);
    ScrollTrigger.getAll().forEach(t => t.kill());
}

// ========== CONSOLE ==========
console.log('%c🛡️ David Álvarez - Cybersecurity Portfolio', 'font-size: 20px; font-weight: bold; color: #00ff88;');
console.log('%c📧 imdavidalvarez@gmail.com', 'font-size: 14px; color: #ff0080; font-weight: bold;');

