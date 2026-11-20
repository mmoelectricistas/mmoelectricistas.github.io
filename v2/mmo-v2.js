// MMO 2.0 - Motor de Conversión, Scroll-Reveal, Popup Contextual de Agente por Servicio, Tarjetas Clickeables y Tracking Google Ads / GA4
(function () {
  // 1. Detectar si el cliente entró desde un anuncio de Google Ads (gclid / wbraid / gbraid / utm)
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('gclid') || params.get('gbraid') || params.get('wbraid') || params.get('utm_source') === 'google') {
      sessionStorage.setItem('mmo_from_google_ad', '1');
    }
    var zonaParam = params.get('zona');
    var servParam = params.get('servicio');
    window.addEventListener('DOMContentLoaded', function () {
      if (zonaParam) {
        document.querySelectorAll('input[name="zona"]').forEach(function (el) { el.value = zonaParam; });
        var zTitle = document.getElementById('dynamic-zona-title');
        if (zTitle) zTitle.textContent = zonaParam;
      }
      if (servParam) {
        document.querySelectorAll('select[name="servicio"]').forEach(function (el) {
          for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].value.toLowerCase().indexOf(servParam.toLowerCase()) !== -1) {
              el.selectedIndex = i;
              break;
            }
          }
        });
      }
    });
  } catch (e) {}

  // 2. Función global de conversión de Google Ads + GA4
  window.trackClicSaliente = function (url, target) {
    var finalUrl = url;
    try {
      if (sessionStorage.getItem('mmo_from_google_ad') === '1' && finalUrl && finalUrl.indexOf('wa.me') !== -1 && finalUrl.indexOf('Google') === -1) {
        finalUrl += encodeURIComponent(' (Vi su anuncio en Google)');
      }
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', { 'send_to': 'AW-16953647837/vmkcCISrqZgcEN3FkJQ_' });
        gtag('event', 'clic_whatsapp_contacto', { 'destino': finalUrl || '' });
      }
    } catch (e) {}
    if (finalUrl) {
      setTimeout(function () {
        if (target === '_blank') {
          window.open(finalUrl, '_blank');
        } else {
          window.location.href = finalUrl;
        }
      }, 140);
    }
    return false;
  };

  // 3. Hacer que al tocar CUALQUIER PARTE del cuadrado de un servicio (.service-card) lleve a "Ver qué incluye"
  function initClickableServiceCards() {
    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        // Si tocó específicamente el botón verde de Cotizar o un link directo, respetar ese link
        if (e.target.closest('.service-link-wa') || e.target.closest('a')) return;
        var pageLink = card.querySelector('.service-link-page');
        if (pageLink && pageLink.getAttribute('href')) {
          window.location.href = pageLink.getAttribute('href');
        }
      });
    });
  }

  // 4. Animación Scroll-Reveal progresiva al bajar con la ruedita o el dedo en celular
  function initScrollReveal() {
    var selectors = [
      '.prof-card-standalone',
      '.section-label',
      '.section-title',
      '.section-desc',
      '.problems-budget-box',
      '.problem-card',
      '.service-card',
      '.step-card',
      '.pillar-card',
      '.checklist-items li',
      '.work-photo-card',
      '.review-card',
      '.zcard',
      '.faq-item',
      '.contact-card',
      '.why-points li'
    ];
    var elements = document.querySelectorAll(selectors.join(','));
    elements.forEach(function (el) {
      el.classList.add('rv');
      var parent = el.parentElement;
      if (parent) {
        var siblings = Array.prototype.slice.call(parent.children);
        var pos = siblings.indexOf(el);
        if (pos > 0 && pos <= 5) {
          el.classList.add('rv-d' + (pos % 4 + 1));
        }
      }
    });

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -45px 0px', threshold: 0.08 });

      elements.forEach(function (el) { obs.observe(el); });
    } else {
      elements.forEach(function (el) { el.classList.add('in-view'); });
    }
  }

  // 5. Submódulo / Globo emergente de WhatsApp con Silueta de Agente Técnico Animado
  //    Personalizado según el servicio que está viendo el usuario y activado al bajar a "Qué incluye"
  function initWhatsAppAgentPopup() {
    if (document.getElementById('wa-popup')) return;

    var path = (window.location.pathname || '').toLowerCase();
    var popTitle = 'MMO Electricistas';
    var popRole = '● Matriculado en línea ahora';
    var popQuestion = '¿Necesitás asesoramiento con un tema eléctrico? Estamos para ayudarte. ¿Nos querés comentar?';
    var waMsg = 'Hola MMO 👋, tengo un problema eléctrico y necesito asesoramiento. ¿Me podrían ayudar?';

    if (path.indexOf('tableros-electricos') !== -1) {
      popTitle = 'Asesor de Tableros MMO';
      popQuestion = '¿Necesitás asesoramiento con tu tablero eléctrico, térmicas o disyuntor? Estamos para ayudarte. ¿Nos querés comentar?';
      waMsg = 'Hola MMO 👋, estoy viendo lo que incluye el servicio de Tableros Eléctricos y necesito asesoramiento. ¿Me podrían ayudar?';
    } else if (path.indexOf('apto-electrico-epec') !== -1) {
      popTitle = 'Especialista Apto EPEC';
      popQuestion = '¿Necesitás asesoramiento con tu Certificado de Apto Eléctrico para EPEC (ERSeP)? Estamos para ayudarte. ¿Nos querés comentar?';
      waMsg = 'Hola MMO 👋, estoy viendo lo que incluye el Certificado de Apto Eléctrico para EPEC y necesito asesoramiento. ¿Me podrían ayudar?';
    } else if (path.indexOf('urgencias-electricas') !== -1) {
      popTitle = 'Guardia Eléctrica 24 hs';
      popQuestion = '¿Tenés una urgencia o falla eléctrica en este momento? Estamos de guardia para ayudarte. ¿Nos querés comentar?';
      waMsg = 'Hola MMO 👋, tengo una urgencia eléctrica y necesito asesoramiento inmediato. ¿Me podrían ayudar?';
    } else if (path.indexOf('instalaciones-electricas') !== -1) {
      popTitle = 'Asesor de Instalaciones';
      popQuestion = '¿Necesitás asesoramiento para tu instalación eléctrica o proyecto de iluminación? Estamos para ayudarte. ¿Nos querés comentar?';
      waMsg = 'Hola MMO 👋, estoy viendo el servicio de Instalaciones e Iluminación y necesito asesoramiento. ¿Me podrían ayudar?';
    } else if (path.indexOf('pilares-electricos') !== -1) {
      popTitle = 'Especialista Pilares EPEC';
      popQuestion = '¿Necesitás asesoramiento para colocar o adecuar tu pilar eléctrico homologado por EPEC? Estamos para ayudarte. ¿Nos querés comentar?';
      waMsg = 'Hola MMO 👋, estoy viendo lo que incluye la instalación de Pilares Eléctricos EPEC y necesito asesoramiento. ¿Me podrían ayudar?';
    } else if (path.indexOf('cercos-electricos') !== -1) {
      popTitle = 'Especialista Cercos MMO';
      popQuestion = '¿Necesitás asesoramiento sobre cercos eléctricos o seguridad para tu casa o country? Estamos para ayudarte. ¿Nos querés comentar?';
      waMsg = 'Hola MMO 👋, estoy viendo la instalación de Cercos Eléctricos y Seguridad y necesito asesoramiento. ¿Me podrían ayudar?';
    }

    var waHref = 'https://wa.me/5493512712104?text=' + encodeURIComponent(waMsg);

    var pop = document.createElement('div');
    pop.id = 'wa-popup';
    pop.className = 'wa-popup';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Asesoramiento por WhatsApp');
    pop.innerHTML =
      '<button type="button" class="wa-pop-close" id="wa-pop-close" aria-label="Cerrar aviso">×</button>' +
      '<div class="wa-pop-header">' +
        '<div class="wa-agent-avatar" aria-hidden="true">' +
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M4 11a8 8 0 0 1 16 0"/>' +
            '<path d="M3 11h18"/>' +
            '<path d="M12 3v3"/>' +
            '<circle cx="12" cy="13" r="4"/>' +
            '<path d="M6 21v-1a6 6 0 0 1 12 0v1"/>' +
            '<path d="M19 13v2a2 2 0 0 1-2 2h-2"/>' +
          '</svg>' +
          '<span class="wa-agent-status"></span>' +
        '</div>' +
        '<div>' +
          '<div class="wa-pop-name">' + popTitle + '</div>' +
          '<span class="wa-pop-role">' + popRole + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="wa-pop-msg">' + popQuestion + '</div>' +
      '<a href="' + waHref + '" target="_blank" rel="noopener" class="wa-pop-cta" id="wa-pop-btn">' +
        '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
        'Escribir ahora' +
      '</a>';

    document.body.appendChild(pop);

    var closeBtn = document.getElementById('wa-pop-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        pop.classList.remove('show');
      });
    }
    var ctaBtn = document.getElementById('wa-pop-btn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        window.trackClicSaliente(this.href, '_blank');
      });
    }

    // Mostrar el cuadradito de Agente cuando el usuario baje hasta el apartado "Qué incluye" (en subpáginas) o Servicios (en Home)
    var triggerTarget = document.querySelector('.checklist-split') || document.querySelector('.checklist-items') || document.getElementById('servicios');
    if (triggerTarget && 'IntersectionObserver' in window) {
      var popObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            pop.classList.add('show');
            popObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      popObs.observe(triggerTarget);
    } else {
      setTimeout(function () { pop.classList.add('show'); }, 2500);
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    initClickableServiceCards();
    initScrollReveal();
    initWhatsAppAgentPopup();
  });

  // 6. Barra superior de progreso de lectura
  window.addEventListener('scroll', function () {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    bar.style.width = scrolled + '%';
  }, { passive: true });

  // 7. Menú hamburguesa móvil
  window.toggleMobileDrawer = function () {
    var d = document.getElementById('mobile-drawer');
    if (d) d.classList.toggle('open');
  };

  // 8. Botones [data-quote]: scrollean suave al formulario, pre-seleccionan servicio/zona y enfocan Nombre
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quote]');
    if (!btn) return;
    e.preventDefault();
    var srv = btn.getAttribute('data-service');
    var zn = btn.getAttribute('data-zone');
    var form = document.getElementById('hero-quote-form') || document.getElementById('footer-quote-form');
    if (!form) return;

    if (srv) {
      var sel = form.querySelector('select[name="servicio"]');
      if (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === srv) { sel.selectedIndex = i; break; }
        }
      }
    }
    if (zn) {
      var zIn = form.querySelector('input[name="zona"]');
      if (zIn) zIn.value = zn;
    }

    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      var nIn = form.querySelector('input[name="nombre"]');
      if (nIn) nIn.focus();
    }, 450);
  });

  // 9. Validación real de formularios + Mensaje interactivo con Emojis para WhatsApp (Punto 12)
  window.handleQuoteSubmit = function (e, form) {
    if (e) e.preventDefault();
    var nombreInput = form.querySelector('input[name="nombre"]');
    var telInput = form.querySelector('input[name="telefono"]');
    var servSelect = form.querySelector('select[name="servicio"]');
    var zonaInput = form.querySelector('input[name="zona"]');
    var msgInput = form.querySelector('textarea[name="mensaje"]');

    var nombre = nombreInput ? nombreInput.value.trim() : '';
    var tel = telInput ? telInput.value.trim() : '';
    var digits = tel.replace(/\D/g, '');

    var hasErr = false;
    if (!nombre || nombre.length < 2) {
      if (nombreInput) nombreInput.classList.add('err');
      hasErr = true;
    } else if (nombreInput) {
      nombreInput.classList.remove('err');
    }

    if (!tel || digits.length < 6) {
      if (telInput) telInput.classList.add('err');
      if (!hasErr && telInput) telInput.focus();
      hasErr = true;
    } else if (telInput) {
      telInput.classList.remove('err');
    }

    if (hasErr) {
      if (nombreInput && nombreInput.classList.contains('err')) nombreInput.focus();
      return false;
    }

    var servicio = servSelect ? servSelect.value : 'Trabajo eléctrico';
    var zona = (zonaInput && zonaInput.value.trim()) ? zonaInput.value.trim() : 'Córdoba Capital';
    var detalle = (msgInput && msgInput.value.trim()) ? msgInput.value.trim() : 'Solicito presupuesto';

    var textoWA = 'Hola MMO Electricistas 👋, soy *' + nombre + '* (📱 Tel: ' + tel + ').\n' +
                  '• ☝️ *Necesito:* ' + servicio + '\n' +
                  '• 📍 *Barrio / Localidad:* ' + zona + '\n' +
                  '• 📝 *Detalle:* ' + detalle;

    var waUrl = 'https://wa.me/5493512712104?text=' + encodeURIComponent(textoWA);

    var fieldsWrap = form.querySelector('.qform-fields');
    var thanksWrap = form.querySelector('.qform-thanks');
    if (fieldsWrap && thanksWrap) {
      fieldsWrap.style.display = 'none';
      var nameSpan = thanksWrap.querySelector('.thanks-name');
      if (nameSpan) nameSpan.textContent = nombre;
      var waBtn = thanksWrap.querySelector('.thanks-wa-btn');
      if (waBtn) waBtn.href = waUrl;
      thanksWrap.classList.add('show');
    }

    window.trackClicSaliente(waUrl, '_blank');
    return false;
  };

  document.addEventListener('input', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('err')) {
      e.target.classList.remove('err');
    }
  });

  // 10. Buscador en vivo de Zonas y Barrios
  window.filtrarTarjetasZona = function (q) {
    var query = (q || '').toLowerCase().trim();
    document.querySelectorAll('.zcard').forEach(function (card) {
      var txt = (card.textContent + ' ' + (card.getAttribute('data-barrios') || '')).toLowerCase();
      card.style.display = (!query || txt.indexOf(query) !== -1) ? '' : 'none';
    });
  };

  // 11. Lightbox de fotos de trabajos
  window.openLightbox = function (src, caption) {
    var lb = document.getElementById('mmo-lightbox');
    if (!lb) return;
    var img = lb.querySelector('img');
    var cap = lb.querySelector('.lightbox-cap');
    if (img) img.src = src;
    if (cap) cap.textContent = caption || '';
    lb.classList.add('open');
  };
  window.closeLightbox = function () {
    var lb = document.getElementById('mmo-lightbox');
    if (lb) lb.classList.remove('open');
  };
})();
