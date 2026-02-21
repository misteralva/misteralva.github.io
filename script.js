// ============================================
// DAVID ÁLVAREZ - CYBERSECURITY PORTFOLIO
// ============================================

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ========== DATOS DE PROYECTOS ==========
const projectsData = [
    {
        id: 0, title: "Web StarterKit", tags: ["HTML", "CSS", "JavaScript"],
        description: { es: "Kit de inicio completo para proyectos web con estructura modular, mejores prácticas de desarrollo frontend y configuración lista para producción.", en: "Complete starter kit for web projects with modular structure, frontend development best practices and production-ready configuration." },
        features: { es: ["Estructura de carpetas modular y escalable","Sistema de componentes reutilizables","Optimización de assets y lazy loading","Compatible con diferentes frameworks","Documentación completa incluida"], en: ["Modular and scalable folder structure","Reusable component system","Asset optimization and lazy loading","Compatible with different frameworks","Complete documentation included"] },
        technologies: ["HTML5", "CSS3", "JavaScript ES6", "Webpack", "Git"],
        github: "https://github.com/misteralva/Web-StarterKit", demo: null
    },
    {
        id: 1, title: "GSAP Actividad", tags: ["GSAP", "JavaScript", "Animaciones"],
        description: { es: "Proyecto académico implementando animaciones avanzadas con GSAP, efectos de scroll interactivos y transiciones fluidas para interfaces web modernas.", en: "Academic project implementing advanced GSAP animations, interactive scroll effects and smooth transitions for modern web interfaces." },
        features: { es: ["Animaciones de scroll con ScrollTrigger","Efectos parallax y reveal dinámicos","Transiciones suaves entre secciones","Optimización de rendimiento","Responsive animations"], en: ["Scroll animations with ScrollTrigger","Dynamic parallax and reveal effects","Smooth section transitions","Performance optimization","Responsive animations"] },
        technologies: ["GSAP 3.x", "ScrollTrigger", "JavaScript", "CSS3"],
        github: "https://github.com/misteralva/GSAP-Actividad", demo: null
    },
    {
        id: 2, title: "GSAP Práctica", tags: ["GSAP", "ScrollTrigger", "Web Design"],
        description: { es: "Ejercicios prácticos de animación web con GSAP, explorando diferentes técnicas de motion design y efectos visuales para mejorar la experiencia de usuario.", en: "Practical web animation exercises with GSAP, exploring different motion design techniques and visual effects to improve user experience." },
        features: { es: ["Timeline animations complejas","Morphing de elementos SVG","Efectos de entrada y salida creativos","Integración con eventos del usuario","Código comentado y documentado"], en: ["Complex timeline animations","SVG element morphing","Creative entrance and exit effects","User event integration","Commented and documented code"] },
        technologies: ["GSAP", "TextPlugin", "MorphSVG", "JavaScript", "HTML5"],
        github: "https://github.com/misteralva/GSAP-Practica", demo: null
    },
    {
        id: 3, title: "Network Security Scanner", tags: ["Python", "Nmap", "Security"],
        description: { es: "Herramienta de escaneo de vulnerabilidades de red con interfaz web interactiva.", en: "Network vulnerability scanning tool with interactive web interface." },
        features: { es: ["Escaneo de puertos y servicios","Detección de vulnerabilidades conocidas","Dashboard web con visualización en tiempo real","Generación de reportes en PDF","Integración con bases de datos CVE"], en: ["Port and service scanning","Known vulnerability detection","Real-time web dashboard visualization","PDF report generation","CVE database integration"] },
        technologies: ["Python", "Nmap", "Flask", "PostgreSQL", "Chart.js"],
        github: "#", demo: null
    },
    {
        id: 4, title: "Firewall Monitor Dashboard", tags: ["Linux", "iptables", "Monitoring"],
        description: { es: "Sistema de monitorización en tiempo real para reglas de firewall y análisis de tráfico de red.", en: "Real-time monitoring system for firewall rules and network traffic analysis." },
        features: { es: ["Monitorización en tiempo real de iptables","Análisis de logs y detección de anomalías","Sistema de alertas por email/Slack","Gráficas de tráfico y estadísticas","Backup automático de configuraciones"], en: ["Real-time iptables monitoring","Log analysis and anomaly detection","Email/Slack alert system","Traffic graphs and statistics","Automatic configuration backup"] },
        technologies: ["Linux", "iptables", "Python", "Node.js", "WebSocket"],
        github: "#", demo: null
    },
    {
        id: 5, title: "System Automation Suite", tags: ["Python", "Bash", "DevOps"],
        description: { es: "Colección de scripts para automatización de tareas de administración de sistemas Linux y Windows.", en: "Collection of scripts for automating Linux and Windows system administration tasks." },
        features: { es: ["Automatización de backups y restauraciones","Scripts de monitorización de recursos","Gestión de usuarios y permisos","Updates y parches automatizados","Documentación completa de cada script"], en: ["Backup and restore automation","Resource monitoring scripts","User and permission management","Automated updates and patches","Complete documentation per script"] },
        technologies: ["Python", "Bash", "PowerShell", "Cron", "systemd"],
        github: "#", demo: null
    }
];

// ========== TRADUCCIONES ==========
const translations = {
    es: {
        // Nav
        'nav-home':'Inicio','nav-about':'Sobre Mí','nav-skills':'Skills Técnicas',
        'nav-certs':'Certificaciones','nav-projects':'Proyectos','nav-exp':'Experiencia','nav-contact':'Contacto',
        // Hero
        'hero-desc':'Experiencia en operaciones en el sector de consultoría tecnológica, con una sólida base en gestión y mejora de procesos. Actualmente cursando Administración de Sistemas Informáticos en Red (ASIR), ampliando competencias en administración de sistemas y ciberseguridad.',
        'btn-cv':'Descargar CV','btn-contact':'Contactar',
        'badge-1':'Administración en sistemas informáticos en Red - Ciberseguridad',
        'typed-phrases':['Operations Specialist','ASIR - Ciberseguridad','Systems Administrator'],
        // Titles
        'title-about':'Sobre Mí','title-skills':'Habilidades Técnicas','title-certs':'Certificaciones',
        'title-projects':'Proyectos Destacados','title-exp':'Experiencia Profesional','title-contact':'Contacto',
        // About
        'about-p1':'Soy un profesional con experiencia en entornos<span class="highlight"> operativos y empresariales internacionales</span>, actualmente cursando <span class="highlight">CFGS en Administración de Sistemas Informáticos en Red (ASIR)</span> con especialización en <span class="highlight">ciberseguridad</span> (finalización junio 2027).',
        'about-p2':'Compagino mi formación técnica con mi experiencia en <span class="highlight">Sthree Spain</span>, donde trabajé con sistemas empresariales como <span class="highlight">SAP, Salesforce y Mercury,</span> gestionando datos operativos, procesos internos y soporte a equipos, además de colaborar en la formación de nuevas incorporaciones.',
        'about-p3':'Mi experiencia en <span class="highlight"> Estados Unidos </span>me ha permitido desarrollar adaptabilidad, coordinación en entornos multiculturales y mejora de procesos. Mi objetivo es orientar mi carrera hacia el ámbito IT, aportando soluciones tecnológicas eficientes y seguras.',
        'langs-title':'Idiomas','lang-es':'Español','lang-cat':'Catalán','lang-en':'Inglés',
        'lang-native':'Nativo','lang-c1':'Profesional (C1)',
        'stat-exp':'Años de Experiencia','stat-projects':'Proyectos Completados','stat-tech':'Tecnologías Dominadas',
        // Certs
        'cert-70h':'70 horas · En Progreso','cert-progress':'En Progreso',
        'cert-cyber':'Ciberseguridad','cert-threats':'Amenazas','cert-endpoint':'Seguridad Endpoints','cert-protection':'Protección',
        // Projects
        'filter-all':'Todos','filter-web':'Web Development','filter-security':'Ciberseguridad',
        'filter-automation':'Automatización','filter-network':'Redes','tag-animations':'Animaciones',
        'proj-0-desc':'Kit de inicio para proyectos web con estructura modular y mejores prácticas de desarrollo frontend.',
        'proj-1-desc':'Proyecto académico implementando animaciones avanzadas con GSAP y efectos de scroll interactivos.',
        'proj-2-desc':'Ejercicios prácticos de animación web con GSAP, explorando diferentes técnicas y efectos visuales.',
        'proj-3-desc':'Herramienta de escaneo de vulnerabilidades con dashboard interactivo para auditorías de red.',
        'proj-4-desc':'Sistema de monitorización en tiempo real para reglas de firewall y tráfico de red.',
        'proj-5-desc':'Colección de scripts para automatización de tareas de administración de sistemas Linux/Windows.',
        'coming-soon':'Próximamente',
        // Modal
        'modal-desc':'Descripción','modal-feat':'Características','modal-tech':'Tecnologías',
        'modal-github':'Ver en GitHub','modal-demo':'Ver Demo',
        // Experience
        'exp-1-title':'Operations Specialist Spain',
        'exp-1-li1':'Gestión de operaciones: formación de nuevas incorporaciones y soporte ante incidencias',
        'exp-1-li2':'Análisis y mejora de procesos operativos, coordinando con distintos departamentos',
        'exp-1-li3':'Gestión de clientes, pagos y órdenes de compra mediante SAP',
        'exp-1-li4':'Administración de contratos, placements y datos operativos (SAP, Salesforce, Mercury)',
        'exp-1-li5':'Optimización de reporting y automatización de procesos con Excel avanzado',
        'exp-2-title':'Player Relation Manager',
        'exp-2-li1':'Reclutamiento de jugadores de nivel academia',
        'exp-2-li2':'Gestión y coordinación con torneos de élite y academias europeas',
        'exp-2-li3':'Planificación de viajes, entrenamientos y programas de desarrollo',
        'exp-2-li4':'Coordinación logística internacional de eventos deportivos',
        'exp-3-title':'Project Manager Assistant',
        'exp-3-li1':'Implementación y supervisión de la metodología DV7 en la academia de Nueva York',
        'exp-3-li2':'Coordinación institucional con ligas, federaciones y organismos futbolísticos',
        'exp-3-li3':'Gestión de eventos y proyectos especiales: campus internacionales y becas universitarias',
        'exp-4-title':'Internship - Operations Trainee',
        'exp-4-li1':'Soporte en producción de eventos esports y transmisiones en Twitch',
        'exp-4-li2':'Optimización de calidad A/V utilizando OBS Studio, NDI, iluminación y audio profesional',
        'exp-4-li3':'Instalación y configuración de hardware/software: PCs gaming, sistemas anti-cheat',
        'exp-4-li4':'Soporte técnico en eventos en vivo',
        'tag-ops':'Gestión de Operaciones','tag-pm':'Gestión de Proyectos',
        'tag-logistics':'Logística Internacional','tag-coord':'Coordinación',
        'tag-inst':'Coordinación Institucional','tag-events':'Eventos','tag-techsupport':'Soporte Técnico',
        // Contact
        'contact-title':'¿Interesad@?',
        'contact-desc':'Disponible para posiciones junior en IT, soporte técnico o ciberseguridad. Interesado en entornos donde pueda aprender, asumir responsabilidades progresivamente y contribuir a la mejora de sistemas y procesos.',
        'form-name':'Tu nombre','form-email':'Tu email','form-message':'Tu mensaje','form-submit':'Enviar Mensaje',
        // Form feedback
        'sending':'Enviando...','sent':'¡Enviado!',
        'form-ok':'✓ ¡Mensaje enviado! Te responderé pronto.',
        'form-err':'✗ No se pudo enviar. Escríbeme a imdavidalvarez@gmail.com',
        'val-name-min':'Mínimo 2 caracteres.','val-name-max':'Nombre demasiado largo.',
        'val-email-inv':'Email no válido.','val-email-max':'Email demasiado largo.',
        'val-msg-min':'Mínimo 10 caracteres.','val-msg-max':'Máximo 5000 caracteres.',
    },
    en: {
        // Nav
        'nav-home':'Home','nav-about':'About Me','nav-skills':'Technical Skills',
        'nav-certs':'Certifications','nav-projects':'Projects','nav-exp':'Experience','nav-contact':'Contact',
        // Hero
        'hero-desc':'Experience in operations within the technology consulting sector, with a solid foundation in process management and improvement. Currently studying Network Computer Systems Administration (ASIR), expanding expertise in systems administration and cybersecurity.',
        'btn-cv':'Download CV','btn-contact':'Contact Me',
        'badge-1':'Network Computer Systems Administration - Cybersecurity',
        'typed-phrases':['Operations Specialist','ASIR - Cybersecurity','Systems Administrator'],
        // Titles
        'title-about':'About Me','title-skills':'Technical Skills','title-certs':'Certifications',
        'title-projects':'Featured Projects','title-exp':'Professional Experience','title-contact':'Contact',
        // About
        'about-p1':'I am a professional with experience in <span class="highlight">international operational and business environments</span>, currently studying <span class="highlight">CFGS in Network Computer Systems Administration (ASIR)</span> specializing in <span class="highlight">cybersecurity</span> (graduating June 2027).',
        'about-p2':'I combine my technical training with my experience at <span class="highlight">Sthree Spain</span>, where I worked with enterprise systems such as <span class="highlight">SAP, Salesforce and Mercury,</span> managing operational data, internal processes and team support, as well as collaborating in onboarding new hires.',
        'about-p3':'My experience in the <span class="highlight">United States</span> has allowed me to develop adaptability, coordination in multicultural environments and process improvement. My goal is to grow my career in the IT field, delivering efficient and secure technological solutions.',
        'langs-title':'Languages','lang-es':'Spanish','lang-cat':'Catalan','lang-en':'English',
        'lang-native':'Native','lang-c1':'Professional (C1)',
        'stat-exp':'Years of Experience','stat-projects':'Completed Projects','stat-tech':'Technologies Mastered',
        // Certs
        'cert-70h':'70 hours · In Progress','cert-progress':'In Progress',
        'cert-cyber':'Cybersecurity','cert-threats':'Threats','cert-endpoint':'Endpoint Security','cert-protection':'Protection',
        // Projects
        'filter-all':'All','filter-web':'Web Development','filter-security':'Cybersecurity',
        'filter-automation':'Automation','filter-network':'Networks','tag-animations':'Animations',
        'proj-0-desc':'Starter kit for web projects with modular structure and frontend development best practices.',
        'proj-1-desc':'Academic project implementing advanced GSAP animations and interactive scroll effects.',
        'proj-2-desc':'Practical web animation exercises with GSAP, exploring different techniques and visual effects.',
        'proj-3-desc':'Network vulnerability scanning tool with interactive dashboard for network audits.',
        'proj-4-desc':'Real-time monitoring system for firewall rules and network traffic.',
        'proj-5-desc':'Collection of scripts for automating Linux/Windows system administration tasks.',
        'coming-soon':'Coming Soon',
        // Modal
        'modal-desc':'Description','modal-feat':'Features','modal-tech':'Technologies',
        'modal-github':'View on GitHub','modal-demo':'Live Demo',
        // Experience
        'exp-1-title':'Operations Specialist Spain',
        'exp-1-li1':'Operations management: onboarding new hires and providing incident support',
        'exp-1-li2':'Analysis and improvement of operational processes, coordinating across departments',
        'exp-1-li3':'Customer management, payments and purchase orders via SAP',
        'exp-1-li4':'Contract administration, placements and operational data management (SAP, Salesforce, Mercury)',
        'exp-1-li5':'Reporting optimization and process automation with advanced Excel',
        'exp-2-title':'Player Relation Manager',
        'exp-2-li1':'Recruitment of academy-level players',
        'exp-2-li2':'Management and coordination with elite tournaments and European academies',
        'exp-2-li3':'Planning of travel, training and development programs',
        'exp-2-li4':'International logistics coordination for sports events',
        'exp-3-title':'Project Manager Assistant',
        'exp-3-li1':'Implementation and supervision of the DV7 methodology at the New York academy',
        'exp-3-li2':'Institutional coordination with leagues, federations and football organizations',
        'exp-3-li3':'Management of special events and projects: international camps and university scholarships',
        'exp-4-title':'Internship - Operations Trainee',
        'exp-4-li1':'Support in esports event production and Twitch broadcasts',
        'exp-4-li2':'A/V quality optimization using OBS Studio, NDI, professional lighting and audio',
        'exp-4-li3':'Hardware/software installation and configuration: gaming PCs, anti-cheat systems',
        'exp-4-li4':'Technical support at live events',
        'tag-ops':'Operations Management','tag-pm':'Project Management',
        'tag-logistics':'International Logistics','tag-coord':'Coordination',
        'tag-inst':'Institutional Coordination','tag-events':'Events','tag-techsupport':'Technical Support',
        // Contact
        'contact-title':'Interested?',
        'contact-desc':'Available for junior IT positions, technical support or cybersecurity roles. Interested in environments where I can learn, take on responsibilities progressively and contribute to system and process improvement.',
        'form-name':'Your name','form-email':'Your email','form-message':'Your message','form-submit':'Send Message',
        // Form feedback
        'sending':'Sending...','sent':'Sent!',
        'form-ok':'✓ Message sent! I will get back to you soon.',
        'form-err':'✗ Could not send. Email me at imdavidalvarez@gmail.com',
        'val-name-min':'At least 2 characters.','val-name-max':'Name too long.',
        'val-email-inv':'Invalid email.','val-email-max':'Email too long.',
        'val-msg-min':'At least 10 characters.','val-msg-max':'Maximum 5000 characters.',
    }
};

// ========== SISTEMA i18n ==========
let currentLang = localStorage.getItem('da-lang') || 'es';

function applyTranslations(lang) {
    const t = translations[lang];

    // Texto simple
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // HTML (párrafos con spans de color)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Section titles: scramble effect en el span de texto
    document.querySelectorAll('.section-title').forEach(h2 => {
        const span = h2.querySelector('[data-i18n]');
        if (!span) return;
        const key = span.getAttribute('data-i18n');
        if (t[key] === undefined) return;
        const fx = new TextScramble(span);
        fx.setText(t[key]);
        // Actualiza data-scramble para future reloads
        const scrambleAttr = lang === 'en' ? h2.getAttribute('data-scramble-en') : h2.getAttribute('data-scramble');
        if (scrambleAttr) h2.setAttribute('data-scramble', scrambleAttr);
    });

    // Reinicia typewriter con frases del idioma correcto
    currentPhrases = t['typed-phrases'];
    clearTimeout(typewriterTimer);
    phraseIndex = 0; charIndex = 0; isDeleting = false;
    if (typedText) typedText.textContent = '';
    setTimeout(typeEffect, 300);

    // Botón: marca el idioma activo
    document.getElementById('langES').classList.toggle('active', lang === 'es');
    document.getElementById('langEN').classList.toggle('active', lang === 'en');

    document.documentElement.lang = lang;
    currentLang = lang;
    localStorage.setItem('da-lang', lang);
}

// ========== SCROLL PROGRESS ==========
const progressBar = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.pageYOffset / windowHeight * 100) + '%';
});

// ========== SCROLL TO TOP ==========
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.classList.add('scroll-to-top');
document.body.appendChild(scrollTopBtn);
window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('visible', window.pageYOffset > 500));
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
        this.x += this.speedX; this.y += this.speedY;
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < mouse.radius) {
            const a = Math.atan2(dy, dx), f = (mouse.radius - d) / mouse.radius;
            this.x -= Math.cos(a)*f*2; this.y -= Math.sin(a)*f*2;
        }
        if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
    }
    draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill(); }
}

for (let i = 0; i < particleCount; i++) particles.push(new Particle());
function connectParticles() {
    for (let i = 0; i < particles.length; i++) for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 150) { ctx.strokeStyle = `rgba(0,255,136,${1-d/150})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); }
    }
}
(function animateParticles() { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.update();p.draw();}); connectParticles(); requestAnimationFrame(animateParticles); })();
window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

// ========== MAGNETIC BUTTONS ==========
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX-rect.left-rect.width/2)*0.3, y: (e.clientY-rect.top-rect.height/2)*0.3, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.3)' }));
});

// ========== MENÚ MÓVIL ==========
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    gsap.to(menuToggle.children[0], { rotation: isActive?45:0, y: isActive?7:0, duration:0.3 });
    gsap.to(menuToggle.children[1], { opacity: isActive?0:1, duration:0.2 });
    gsap.to(menuToggle.children[2], { rotation: isActive?-45:0, y: isActive?-7:0, duration:0.3 });
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => { navLinks.classList.remove('active'); gsap.to(menuToggle.children, { rotation:0, y:0, opacity:1 }); });
});

// ========== TYPEWRITER ==========
const typedText = document.querySelector('.typed-text');
let currentPhrases = translations[currentLang]['typed-phrases'];
let phraseIndex = 0, charIndex = 0, isDeleting = false, typewriterTimer = null;

function typeEffect() {
    const current = currentPhrases[phraseIndex];
    if (isDeleting) { typedText.textContent = current.substring(0, charIndex-1); charIndex--; }
    else { typedText.textContent = current.substring(0, charIndex+1); charIndex++; }
    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === current.length) { speed = 2000; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex+1) % currentPhrases.length; speed = 500; }
    typewriterTimer = setTimeout(typeEffect, speed);
}

// ========== HERO TITLE — SPLIT CHAR ANIMATION ==========
function splitAndAnimateTitle() {
    const titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;
    const rawText = titleEl.textContent.trim();
    titleEl.innerHTML = ''; titleEl.style.visibility = 'visible'; titleEl.style.position = 'relative';
    const allChars = [];
    rawText.split(' ').forEach((word, wIdx, arr) => {
        const wordSpan = document.createElement('span'); wordSpan.classList.add('word');
        word.split('').forEach(letter => {
            const charSpan = document.createElement('span'); charSpan.classList.add('char'); charSpan.textContent = letter;
            gsap.set(charSpan, { opacity:0, y:80, rotationX:-90, transformOrigin:'50% 50% -30px' });
            wordSpan.appendChild(charSpan); allChars.push(charSpan);
        });
        titleEl.appendChild(wordSpan);
        if (wIdx < arr.length-1) titleEl.appendChild(document.createTextNode(' '));
    });
    const tl = gsap.timeline({ delay:0.3 });
    tl.to(allChars, { opacity:1, y:0, rotationX:0, duration:0.7, ease:'back.out(1.5)', stagger:{amount:0.9,from:'start'} });
    tl.to(allChars, { textShadow:'0 0 30px rgba(0,255,136,0.8)', duration:0.3, stagger:{amount:0.4,from:'start'} }, '+=0.2')
      .to(allChars, { textShadow:'0 0 0px rgba(0,255,136,0)', duration:0.5, stagger:{amount:0.4,from:'start'} });
    return tl;
}

// ========== ANIMACIONES HERO ==========
const heroTimeline = gsap.timeline({ defaults:{ ease:'power3.out' } });
heroTimeline
    .add(splitAndAnimateTitle())
    .from('.hero-subtitle',     { opacity:0, y:30, duration:0.8 }, '-=0.3')
    .from('.hero-description',  { opacity:0, y:30, duration:0.8 }, '-=0.5')
    .from('.hero-buttons .btn', { opacity:0, y:30, stagger:0.15, duration:0.6 }, '-=0.5')
    .from('.badge',             { opacity:0, scale:0, stagger:0.1, duration:0.5, ease:'back.out(1.7)' }, '-=0.3')
    .add(() => setTimeout(typeEffect, 600), '-=0.5');

document.querySelectorAll('.hero-title .char').forEach(char => {
    char.addEventListener('mouseenter', () => gsap.to(char, { color:'#00ff88', textShadow:'0 0 20px rgba(0,255,136,1)', scale:1.2, duration:0.2, ease:'power2.out' }));
    char.addEventListener('mouseleave', () => gsap.to(char, { color:'', textShadow:'', scale:1, duration:0.4, ease:'elastic.out(1,0.5)' }));
});

// ========== SVG ANIMADO ==========
gsap.to('.svg-circle', { attr:{r:200}, duration:3, repeat:-1, yoyo:true, ease:'sine.inOut' });
gsap.to('.svg-path', { attr:{d:'M 100 300 Q 400 400 700 300 T 100 300'}, duration:4, repeat:-1, yoyo:true, ease:'sine.inOut' });

// ========== NAVBAR ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.pageYOffset > 100));

// ========== TEXT SCRAMBLE ==========
class TextScramble {
    constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) this.queue.push({ from:oldText[i]||'', to:newText[i]||'', start:Math.floor(Math.random()*40), end:Math.floor(Math.random()*40)+Math.floor(Math.random()*40) });
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0; this.update(); return promise;
    }
    update() {
        let output = '', complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; }
            else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) { char = this.chars[Math.floor(Math.random()*this.chars.length)]; this.queue[i].char = char; }
                output += `<span style="color:var(--secondary);">${char}</span>`;
            } else output += from;
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) this.resolve();
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
}

document.querySelectorAll('.section-title[data-scramble]').forEach(title => {
    const originalText = title.getAttribute('data-scramble');
    const span = title.querySelector('[data-i18n]');
    const target = span || title;
    const fx = new TextScramble(target);
    ScrollTrigger.create({ trigger: title, start:'top 80%', once:true, onEnter: () => {
        const textToScramble = span ? span.textContent : originalText;
        fx.setText(textToScramble);
    }});
});

// ========== ABOUT ==========
gsap.from('.about-text p', { scrollTrigger:{ trigger:'.about-text', start:'top 80%' }, opacity:0, y:50, duration:1, stagger:0.2, ease:'power3.out' });
document.querySelectorAll('.language-progress').forEach(bar => {
    const width = bar.getAttribute('data-width');
    ScrollTrigger.create({ trigger:bar, start:'top 85%', onEnter:()=>gsap.to(bar,{width:width+'%',duration:1.5,ease:'power2.out'}) });
});
document.querySelectorAll('.stat-number').forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    ScrollTrigger.create({ trigger:stat, start:'top 80%', onEnter:()=>{
        gsap.to(stat, { textContent:target, duration:2, ease:'power1.out', snap:{textContent:1}, onUpdate(){stat.textContent=Math.ceil(stat.textContent);} });
    }});
});

// ========== SKILLS ==========
(function initSkillRings() {
    const circumference = 2*Math.PI*44;
    document.querySelectorAll('.skill-item').forEach(item => {
        const level = parseInt(item.getAttribute('data-level'))||0;
        const ring = item.querySelector('circle.ring');
        const percentEl = item.querySelector('.skill-percent');
        if (!ring) return;
        ring.setAttribute('stroke-dasharray', String(circumference));
        ring.setAttribute('stroke-dashoffset', String(circumference));
        if (percentEl) percentEl.textContent = '0%';
        const targetOffset = circumference*(1-level/100);
        const iconEl = item.querySelector('.skill-ring i');
        ScrollTrigger.create({ trigger:item, start:'top 85%', onEnter:()=>{
            gsap.to(ring, { attr:{'stroke-dashoffset':targetOffset}, duration:1.2, ease:'power2.out', overwrite:'auto' });
            if (percentEl) gsap.to({val:0},{val:level,duration:1.2,ease:'power2.out',onUpdate:function(){percentEl.textContent=Math.round(this.targets()[0].val)+'%';}});
            if (iconEl) gsap.to(iconEl,{opacity:1,delay:0.3,duration:0.8});
        }});
        item.addEventListener('mouseenter',()=>gsap.to(ring,{attr:{'stroke-dashoffset':Math.max(0,targetOffset-circumference*0.05)},duration:0.35,overwrite:'auto'}));
        item.addEventListener('mouseleave',()=>gsap.to(ring,{attr:{'stroke-dashoffset':targetOffset},duration:0.35,overwrite:'auto'}));
    });
})();

// ========== CERTIFICACIONES ==========
(function initCertReveal() {
    const cards = document.querySelectorAll('.cert-card');
    cards.forEach(card=>gsap.set(card,{opacity:0,rotationY:25,rotationX:10,scale:0.88,transformOrigin:'center center',transformPerspective:800}));
    ScrollTrigger.create({ trigger:'.certifications-grid', start:'top 80%', once:true, onEnter:()=>{
        gsap.to(cards,{opacity:1,rotationY:0,rotationX:0,scale:1,duration:0.7,ease:'back.out(1.3)',stagger:{amount:0.8,grid:'auto',from:'start'}});
    }});
    cards.forEach(card=>{
        card.addEventListener('mouseenter',()=>gsap.to(card,{rotationY:-4,rotationX:4,scale:1.03,duration:0.35,ease:'power2.out',transformPerspective:800}));
        card.addEventListener('mouseleave',()=>gsap.to(card,{rotationY:0,rotationX:0,scale:1,duration:0.5,ease:'elastic.out(1,0.5)',transformPerspective:800}));
    });
})();

// ========== PROYECTOS ==========
(function initProjectReveal() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card,i)=>{
        const fromLeft = i%2===0;
        gsap.set(card,{opacity:0,x:fromLeft?-60:60,y:40,rotationZ:fromLeft?-3:3,scale:0.9,transformOrigin:'center bottom'});
        ScrollTrigger.create({ trigger:card, start:'top 88%', once:true, onEnter:()=>{
            gsap.to(card,{opacity:1,x:0,y:0,rotationZ:0,scale:1,duration:0.8,delay:(i%3)*0.12,ease:'power3.out'});
        }});
    });
    cards.forEach(card=>{
        card.addEventListener('mousemove',e=>{
            const rect=card.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
            gsap.to(card,{rotationX:(y-rect.height/2)/15,rotationY:(rect.width/2-x)/15,duration:0.3,ease:'power2.out',transformPerspective:1000,transformOrigin:'center'});
        });
        card.addEventListener('mouseleave',()=>gsap.to(card,{rotationX:0,rotationY:0,rotationZ:0,duration:0.5,ease:'elastic.out(1,0.5)'}));
    });
})();

// ========== FILTER ==========
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
        const filter = btn.getAttribute('data-filter');
        const btnText = btn.querySelector('span');
        const originalText = btnText.textContent;
        let count = 0;
        const interval = setInterval(()=>{
            if (count<5){btnText.textContent=originalText.split('').map(()=>'!<>-_\\/[]{}—=+*^?#'[Math.floor(Math.random()*17)]).join('');count++;}
            else{btnText.textContent=originalText;clearInterval(interval);}
        },50);
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        projectCards.forEach(project=>{
            const cat = project.getAttribute('data-category');
            if (filter==='all'||cat===filter) gsap.to(project,{scale:1,opacity:1,duration:0.5,ease:'back.out(1.4)',onStart:()=>project.style.display='block'});
            else gsap.to(project,{scale:0.8,opacity:0,duration:0.3,onComplete:()=>project.style.display='none'});
        });
    });
});

// ========== MODAL ==========
const modal = document.getElementById('projectModal');
const modalOverlay = modal.querySelector('.modal-overlay');
const modalClose   = modal.querySelector('.modal-close');

function openModal(projectId) {
    const project = projectsData[projectId];
    const lang = currentLang;
    modal.querySelector('.modal-title').textContent = project.title;
    modal.querySelector('.modal-text').textContent = project.description[lang] || project.description.es;
    modal.querySelector('.modal-tags').innerHTML = project.tags.map(t=>`<span>${t}</span>`).join('');
    const feats = project.features[lang] || project.features.es;
    modal.querySelector('.modal-features-list').innerHTML = feats.map(f=>`<li>${f}</li>`).join('');
    modal.querySelector('.modal-tech-list').innerHTML = project.technologies.map(t=>`<span>${t}</span>`).join('');
    const githubLink = modal.querySelector('.github-link');
    const demoLink   = modal.querySelector('.demo-link');
    githubLink.href = project.github;
    demoLink.style.display = project.demo ? 'inline-flex' : 'none';
    if (project.demo) demoLink.href = project.demo;
    const icon = modal.querySelector('.modal-placeholder i');
    icon.className = project.tags[0]==='Python'?'fab fa-python':project.tags[0]==='GSAP'?'fas fa-magic':'fas fa-code';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('.modal-content', { scale:0.8, opacity:0 }, { scale:1, opacity:1, duration:0.3, ease:'back.out(1.4)' });
}

function closeModal() {
    gsap.to('.modal-content',{scale:0.8,opacity:0,duration:0.2,onComplete:()=>{modal.classList.remove('active');document.body.style.overflow='auto';}});
}

document.querySelectorAll('.project-details-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{e.preventDefault();openModal(parseInt(btn.getAttribute('data-project')));});
});
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('active'))closeModal();});

// ========== TIMELINE ==========
gsap.from('.timeline-item',{scrollTrigger:{trigger:'.timeline',start:'top 80%'},opacity:0,x:-100,duration:1,stagger:0.3,ease:'power3.out'});
gsap.from('.timeline-dot', {scrollTrigger:{trigger:'.timeline',start:'top 80%'},scale:0,duration:0.6,stagger:0.3,ease:'back.out(2)'});

// ========== CONTACTO ==========
gsap.from('.contact-info',{scrollTrigger:{trigger:'.contact-content',start:'top 80%'},opacity:0,x:-80,duration:1,ease:'power3.out'});
gsap.from('.contact-form',{scrollTrigger:{trigger:'.contact-content',start:'top 80%'},opacity:0,x:80,duration:1,ease:'power3.out'});
gsap.from('.social-link', {scrollTrigger:{trigger:'.social-links',start:'top 90%'},opacity:0,scale:0,duration:0.5,stagger:0.1,ease:'back.out(2)'});

// ========== FORMULARIO — Formspree ==========
const FORMSPREE_URL = 'https://formspree.io/f/mlgwwwke';

const msgTextarea = document.getElementById('inputMessage');
const charCounter = document.getElementById('charCounter');
if (msgTextarea && charCounter) {
    msgTextarea.addEventListener('input',()=>{
        const len = msgTextarea.value.length;
        charCounter.textContent = `${len} / 5000`;
        charCounter.className = 'char-counter';
        if (len>4250) charCounter.classList.add('warn');
        if (len>=5000) charCounter.classList.add('limit');
    });
}

function getFieldRules(id) {
    const t = translations[currentLang];
    if (id==='inputName')    return [{test:v=>v.length>=2,msg:t['val-name-min']},{test:v=>v.length<=100,msg:t['val-name-max']}];
    if (id==='inputEmail')   return [{test:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),msg:t['val-email-inv']},{test:v=>v.length<=254,msg:t['val-email-max']}];
    if (id==='inputMessage') return [{test:v=>v.length>=10,msg:t['val-msg-min']},{test:v=>v.length<=5000,msg:t['val-msg-max']}];
    return [];
}

function validateField(id, errorId, rules) {
    const field = document.getElementById(id);
    const errEl = document.getElementById(errorId);
    const val = field ? field.value.trim() : '';
    let msg = '';
    for (const rule of rules) { if (!rule.test(val)) { msg = rule.msg; break; } }
    if (errEl) errEl.textContent = msg;
    if (field) gsap.to(field,{borderColor:msg?'#ff0080':'rgba(0,255,136,0.2)',duration:0.3});
    return msg === '';
}

function clientValidate() {
    const v1 = validateField('inputName',    'errName',    getFieldRules('inputName'));
    const v2 = validateField('inputEmail',   'errEmail',   getFieldRules('inputEmail'));
    const v3 = validateField('inputMessage', 'errMessage', getFieldRules('inputMessage'));
    return v1 && v2 && v3;
}

[{id:'inputName',err:'errName'},{id:'inputEmail',err:'errEmail'},{id:'inputMessage',err:'errMessage'}].forEach(({id,err})=>{
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur',()=>validateField(id,err,getFieldRules(id)));
});

const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!clientValidate()) {
            gsap.fromTo(contactForm,{x:-8},{x:8,repeat:3,yoyo:true,duration:0.1,ease:'power1.inOut',onComplete:()=>gsap.set(contactForm,{x:0})});
            return;
        }
        const t = translations[currentLang];
        const originalHTML  = submitBtn.innerHTML;
        submitBtn.disabled  = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t['sending']}`;
        formStatus.className = 'form-status'; formStatus.textContent = '';
        try {
            const response = await fetch(FORMSPREE_URL, { method:'POST', body:new FormData(contactForm), headers:{'Accept':'application/json'} });
            if (response.ok) {
                formStatus.className = 'form-status success'; formStatus.textContent = t['form-ok'];
                gsap.from(formStatus,{opacity:0,y:-10,duration:0.4});
                submitBtn.innerHTML = `<i class="fas fa-check"></i> ${t['sent']}`;
                gsap.to(submitBtn,{backgroundColor:'var(--primary)',color:'var(--darker)',duration:0.3});
                contactForm.reset();
                if (charCounter) { charCounter.textContent = '0 / 5000'; charCounter.className = 'char-counter'; }
                setTimeout(()=>{
                    gsap.to(submitBtn,{backgroundColor:'transparent',color:'var(--primary)',duration:0.3,
                        onComplete:()=>{submitBtn.innerHTML=originalHTML;submitBtn.disabled=false;}});
                },4000);
            } else {
                const data = await response.json();
                throw new Error(data?.errors?.map(e=>e.message).join(', ')||'Error');
            }
        } catch(error) {
            formStatus.className = 'form-status error'; formStatus.textContent = translations[currentLang]['form-err'];
            gsap.from(formStatus,{opacity:0,y:-10,duration:0.4});
            submitBtn.innerHTML = originalHTML; submitBtn.disabled = false;
        }
    });
}

// ========== LANG TOGGLE ==========
document.getElementById('langToggle').addEventListener('click', () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    const btn = document.getElementById('langToggle');
    gsap.fromTo(btn, { scale:1 }, { scale:0.85, duration:0.1, yoyo:true, repeat:1,
        onComplete: () => applyTranslations(newLang)
    });
});

// Aplica idioma guardado al cargar (si es EN)
if (currentLang === 'en') {
    setTimeout(() => applyTranslations('en'), 150);
} else {
    document.getElementById('langES').classList.add('active');
}

// ========== PARALLAX HERO ==========
gsap.to('.hero-content', {
    scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:1 },
    y:200, opacity:0.3
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click',function(e){
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top:target.getBoundingClientRect().top+window.pageYOffset-80, behavior:'smooth' });
    });
});

// ========== NAV ACTIVA ==========
const sections = document.querySelectorAll('section[id]');
const navItems  = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll',()=>{
    let current = '';
    sections.forEach(s=>{ if (window.pageYOffset>=s.offsetTop-200) current=s.getAttribute('id'); });
    navItems.forEach(item=>item.classList.toggle('active',item.getAttribute('href').slice(1)===current));
});

// ========== SECTION TRANSITIONS ==========
gsap.utils.toArray('section').forEach((section,i)=>{
    if (i===0) return;
    gsap.from(section,{ scrollTrigger:{trigger:section,start:'top 90%'}, opacity:0, y:100, duration:1, ease:'power3.out' });
});

// ========== REDUCED MOTION ==========
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(0);
    ScrollTrigger.getAll().forEach(t=>t.kill());
}

console.log('%c🛡️ David Álvarez - Cybersecurity Portfolio','font-size:20px;font-weight:bold;color:#00ff88;');
console.log('%c📧 imdavidalvarez@gmail.com','font-size:14px;color:#ff0080;font-weight:bold;');
