// MMO 2.0 - Motor de Conversión, Validación, Tracking Google Ads / GA4 y UX
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

  // 3. Barra superior de progreso de lectura
  window.addEventListener('scroll', function () {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    bar.style.width = scrolled + '%';
  }, { passive: true });

  // 4. Menú hamburguesa móvil
  window.toggleMobileDrawer = function () {
    var d = document.getElementById('mobile-drawer');
    if (d) d.classList.toggle('open');
  };

  // 5. Botones [data-quote]: scrollean suave al formulario, pre-seleccionan servicio/zona y enfocan Nombre
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

  // 6. Validación real de formularios + Paso a WhatsApp estilo Diego Ayala
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
    var zona = (zonaInput && zonaInput.value.trim()) ? zonaInput.value.trim() : 'Córdoba';
    var detalle = (msgInput && msgInput.value.trim()) ? msgInput.value.trim() : '';

    var textoWA = 'Hola MMO Electricistas, soy *' + nombre + '* (Tel: ' + tel + ').\n' +
                  '• *Necesito:* ' + servicio + '\n' +
                  '• *Barrio / Localidad:* ' + zona;
    if (detalle) {
      textoWA += '\n• *Detalle:* ' + detalle;
    }
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

  // Quitar estado de error al escribir
  document.addEventListener('input', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('err')) {
      e.target.classList.remove('err');
    }
  });

  // 7. Buscador en vivo de Zonas y Barrios
  window.filtrarTarjetasZona = function (q) {
    var query = (q || '').toLowerCase().trim();
    document.querySelectorAll('.zcard').forEach(function (card) {
      var txt = (card.textContent + ' ' + (card.getAttribute('data-barrios') || '')).toLowerCase();
      card.style.display = (!query || txt.indexOf(query) !== -1) ? '' : 'none';
    });
  };

  // 8. Lightbox de fotos de trabajos
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
