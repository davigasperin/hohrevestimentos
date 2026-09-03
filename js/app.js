document.addEventListener('DOMContentLoaded', () => {
  // Helper para disparar eventos de conversão
  const trackConversion = (eventName, params = {}) => {
    if (typeof loadTrackingScripts === 'function') loadTrackingScripts();
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

  // Carregar dados salvos (Supabase com fallback para LocalStorage)
  const SUPABASE_URL = 'https://btzvozjeznzjcprockde.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvemplem56amNwcm9ja2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjM3NDcsImV4cCI6MjEwNDAzOTc0N30.FPdbc3WlQP4u6NTW78KhKXN3AWRIbpvruDS8Lz1Q_DM';

  const applyDataToDOM = (data) => {
    if (!data) return;

    // Atualiza Hero
    if (data.hero) {
      if (data.hero.title) {
        const h1 = document.querySelector('h1');
        if (h1) h1.innerText = data.hero.title;
      }
      if (data.hero.subtitle) {
        const sub = document.querySelector('section p.text-brand-muted');
        if (sub) sub.innerText = data.hero.subtitle;
      }
      if (data.hero.image) {
        const heroImg = document.querySelector('img[src*="hero"]');
        if (heroImg) heroImg.src = data.hero.image;
      }
    }

    // Atualiza Impacto Visual
    if (data.impact) {
      if (data.impact.title) {
        const impactTitleEl = document.querySelector('section#comparacao h2');
        if (impactTitleEl) impactTitleEl.innerText = data.impact.title;
      }
      if (data.impact.desc) {
        const impactDescEl = document.querySelector('section#comparacao p.text-brand-muted');
        if (impactDescEl) impactDescEl.innerText = data.impact.desc;
      }

      const sliderContainer = document.getElementById('sliderContainer');
      if (sliderContainer) {
        const afterImg = sliderContainer.querySelector('img[src*="with-wallpaper"], img.absolute.inset-0.w-full.h-full.object-cover:not(.max-w-none)');
        const beforeImg = document.getElementById('sliderBefore')?.querySelector('img');
        
        if (afterImg && data.impact.after) afterImg.src = data.impact.after;
        if (beforeImg && data.impact.before) beforeImg.src = data.impact.before;
      }
    }

    // Atualiza Projetos
    if (data.projects) {
      const projSection = document.getElementById('projetos');
      if (projSection) {
        const subEl = projSection.querySelector('.text-brand-goldDark');
        const titleEl = projSection.querySelector('h2');
        const descEl = projSection.querySelector('p.text-brand-muted');

        if (subEl && data.projects.subtitle) {
          subEl.innerHTML = `<span class="w-6 h-px bg-brand-gold"></span> ${data.projects.subtitle}`;
        }
        if (titleEl && data.projects.title) titleEl.innerText = data.projects.title;
        if (descEl && data.projects.desc) descEl.innerText = data.projects.desc;

        const cardImgs = projSection.querySelectorAll('img');
        for (let i = 1; i <= 8; i++) {
          if (cardImgs[i - 1] && data.projects[`img${i}`]) {
            cardImgs[i - 1].src = data.projects[`img${i}`];
          }
        }
      }
    }
  };

  // 1. Aplicação imediata do cache local
  const localCache = JSON.parse(localStorage.getItem('hoh_data'));
  if (localCache) applyDataToDOM(localCache);

  // 2. Busca no Supabase para dados atualizados
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseClient
      .from('site_content')
      .select('data')
      .eq('id', 'homepage')
      .single()
      .then(({ data, error }) => {
        if (!error && data && data.data) {
          applyDataToDOM(data.data);
          localStorage.setItem('hoh_data', JSON.stringify(data.data));
        }
      })
      .catch(console.error);
  }
});
