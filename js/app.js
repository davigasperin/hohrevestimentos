document.addEventListener('DOMContentLoaded', () => {
  // Helper para disparar eventos de conversão
  const trackConversion = (eventName, params = {}) => {
    if (typeof fbq === 'function') {
      fbq('track', eventName === 'generate_lead' ? 'Lead' : 'Contact', params);
    }
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  };

  // Rastrear cliques em links do WhatsApp
  const waLinks = document.querySelectorAll('a[href*="wa.me"]');
  waLinks.forEach(link => {
    link.addEventListener('click', () => {
      const urlParams = new URLSearchParams(link.href.split('?')[1] || '');
      const text = urlParams.get('text') || 'Solicitação via WhatsApp';
      trackConversion('contact', { event_label: text, channel: 'WhatsApp' });
    });
  });

  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      const newStatus = !isExpanded;
      menuBtn.setAttribute('aria-expanded', String(newStatus));
      mobileMenu.classList.toggle('hidden');
      
      const svgPath = menuBtn.querySelector('path');
      if (svgPath) {
        svgPath.setAttribute('d', newStatus ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const range = document.getElementById('sliderRange');
  const beforeImg = document.getElementById('sliderBefore');

  if (range && beforeImg) {
    let ticking = false;
    range.addEventListener('input', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          beforeImg.style.width = `${e.target.value}%`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const ambiente = document.getElementById('ambiente').value;

      const text = `Olá! Meu nome é ${encodeURIComponent(name)} e gostaria de um orçamento para aplicação de papel de parede no meu/minha ${encodeURIComponent(ambiente)}.`;
      trackConversion('generate_lead', { ambiente: ambiente, name: name });
      window.open(`https://wa.me/5541992145814?text=${text}`, '_blank');
    });
  }
});
