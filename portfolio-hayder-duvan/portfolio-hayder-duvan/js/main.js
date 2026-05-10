const audioSummaries = {
  bienvenida: {
    title: 'Presentación',
    sectionLabel: 'Inicio',
    audio: 'assets/audio/bienvenida.mp3',
    text: 'Hola, soy Hayder Duvan Carreño Ramos, estudiante de Ingeniería de Software. Este portafolio presenta mi perfil profesional, mis habilidades, certificaciones y proyectos web, con una experiencia interactiva y responsive.'
  },
  perfil: {
    title: 'Perfil profesional',
    sectionLabel: 'Perfil profesional',
    audio: 'assets/audio/perfil.mp3',
    text: 'En esta sección encontrarás mi perfil profesional, mis objetivos y mis datos de contacto. Mi enfoque está en crear soluciones web organizadas, útiles y fáciles de usar.'
  },
  academia: {
    title: 'Formación y competencias',
    sectionLabel: 'Formación y competencias',
    audio: 'assets/audio/academia.mp3',
    text: 'Aquí se resume mi formación en Ingeniería de Software, las competencias técnicas que estoy fortaleciendo y mi certificación Enterprise Design Thinking Practitioner de IBM SkillsBuild.'
  },
  proyectos: {
    title: 'Proyectos',
    sectionLabel: 'Proyectos',
    audio: 'assets/audio/proyectos.mp3',
    text: 'En proyectos se muestran dos trabajos: una plataforma para gestionar canchas, turnos y pagos en un club de tenis, y un formulario web para registrar estudiantes de forma clara y ordenada.'
  },
  certificaciones: {
    title: 'Certificación',
    sectionLabel: 'Certificación',
    audio: 'assets/audio/certificaciones.mp3',
    text: 'Esta parte destaca el certificado de IBM SkillsBuild en Enterprise Design Thinking Practitioner, relacionado con diseño centrado en las personas, innovación y solución de problemas.'
  },
  contacto: {
    title: 'Contacto',
    sectionLabel: 'Contacto',
    audio: 'assets/audio/contacto.mp3',
    text: 'En la sección de contacto puedes encontrar el correo, el teléfono y los enlaces para comunicarte o revisar los proyectos publicados por Hayder Duvan.'
  }
};

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-link');
const progressBar = document.getElementById('progressBar');
const voiceStatus = document.getElementById('voiceStatus');
const fallbackAudio = document.getElementById('fallbackAudio');
const useBrowserVoice = document.getElementById('useBrowserVoice');
let currentAudioKey = 'bienvenida';
let activeUtterance = null;
let preferredVoice = null;

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const preferredLangs = ['es-CO', 'es-419', 'es-MX', 'es-US', 'es-ES'];
  preferredVoice = voices.find((voice) => preferredLangs.some((lang) => voice.lang.toLowerCase().startsWith(lang.toLowerCase())))
    || voices.find((voice) => voice.lang.toLowerCase().startsWith('es'))
    || null;
}

function setStatus(message) {
  voiceStatus.textContent = message;
}

function stopAllAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
  fallbackAudio.pause();
  fallbackAudio.currentTime = 0;
}

function playFallback(summary) {
  fallbackAudio.src = summary.audio;
  fallbackAudio.currentTime = 0;
  fallbackAudio.play()
    .then(() => setStatus(`Reproduciendo audio: ${summary.sectionLabel}`))
    .catch(() => setStatus('No se pudo reproducir el audio. Revisa permisos del navegador.'));
}

function speakSummary(key) {
  const summary = audioSummaries[key] || audioSummaries.bienvenida;
  currentAudioKey = key;
  stopAllAudio();

  const canUseSpeech = 'speechSynthesis' in window && useBrowserVoice.checked;
  if (!canUseSpeech) {
    playFallback(summary);
    return;
  }

  loadVoices();
  activeUtterance = new SpeechSynthesisUtterance(summary.text);
  activeUtterance.lang = preferredVoice?.lang || 'es-CO';
  activeUtterance.rate = 0.94;
  activeUtterance.pitch = 1;
  activeUtterance.volume = 1;
  if (preferredVoice) activeUtterance.voice = preferredVoice;

  activeUtterance.onstart = () => setStatus(`Reproduciendo resumen: ${summary.sectionLabel}`);
  activeUtterance.onend = () => setStatus(`Sección actual: ${summary.sectionLabel}`);
  activeUtterance.onerror = () => playFallback(summary);

  window.speechSynthesis.speak(activeUtterance);
}

function pauseVoice() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    setStatus('Voz pausada');
  }
  if (!fallbackAudio.paused) {
    fallbackAudio.pause();
    setStatus('Audio pausado');
  }
}

function resumeVoice() {
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    setStatus('Continuando voz');
    return;
  }
  if (fallbackAudio.src && fallbackAudio.paused) {
    fallbackAudio.play();
    setStatus('Continuando audio');
  }
}

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-audio-section]').forEach((button) => {
  button.addEventListener('click', () => speakSummary(button.dataset.audioSection));
});

document.getElementById('playCurrent')?.addEventListener('click', () => speakSummary(currentAudioKey));
document.getElementById('pauseVoice')?.addEventListener('click', pauseVoice);
document.getElementById('resumeVoice')?.addEventListener('click', resumeVoice);
document.getElementById('stopVoice')?.addEventListener('click', () => {
  stopAllAudio();
  setStatus('Voz detenida');
});

window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
});

const sectionMap = {
  inicio: 'bienvenida',
  perfil: 'perfil',
  academia: 'academia',
  proyectos: 'proyectos',
  certificaciones: 'certificaciones',
  contacto: 'contacto'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    currentAudioKey = sectionMap[id] || 'bienvenida';
    const label = entry.target.dataset.sectionTitle || audioSummaries[currentAudioKey].sectionLabel;
    setStatus(`Sección actual: ${label}`);
    navItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-38% 0px -52% 0px', threshold: 0.01 });

document.querySelectorAll('.section').forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.getElementById('year').textContent = new Date().getFullYear();

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

fallbackAudio.addEventListener('ended', () => setStatus(`Sección actual: ${audioSummaries[currentAudioKey].sectionLabel}`));
