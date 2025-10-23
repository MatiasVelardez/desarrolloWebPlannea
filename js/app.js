// js/app.js
(function(){
  const btnUser = document.getElementById('btnUser');
  const btnSettings = document.getElementById('btnSettings');
  // login modal and form removed from HTML
  // New auth modal elements
  const authModal = document.getElementById('authModal');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const modalClose = authModal?.querySelector('.modal-close');
  const state = {
    get user(){ 
      const raw = localStorage.getItem('plannea_user');
      return raw ? JSON.parse(raw) : null;
    },
    set user(val){
      if(val) localStorage.setItem('plannea_user', JSON.stringify(val));
      else localStorage.removeItem('plannea_user');
    }
  };

  // Auth modal helpers
  function openAuthModal(){
    if(!authModal) return;
    authModal.hidden = false;
    authModal.setAttribute('aria-hidden', 'false');
    // lock body scroll
    document.body.classList.add('modal-open');
    // focus first input of the visible form
    const firstInput = authModal.querySelector('form:not([hidden]) input');
    (firstInput || authModal.querySelector('input'))?.focus();
    document.addEventListener('keydown', escAuthHandler);
    // simple focus trap
    document.addEventListener('focus', focusTrap, true);
  }

  function closeAuthModal(){
    if(!authModal) return;
    authModal.hidden = true;
    authModal.setAttribute('aria-hidden', 'true');
    // release body scroll
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', escAuthHandler);
    document.removeEventListener('focus', focusTrap, true);
    btnUser && btnUser.focus();
  }

  function escAuthHandler(e){
    if(e.key === 'Escape' || e.key === 'Esc') closeAuthModal();
  }

  function showLogin(){
    if(!loginForm || !registerForm) return;
    // show login, hide register
    loginForm.hidden = false; registerForm.hidden = true;
    loginForm.setAttribute('aria-hidden','false'); registerForm.setAttribute('aria-hidden','true');
    tabLogin.classList.add('active'); tabLogin.setAttribute('aria-pressed','true');
    tabRegister.classList.remove('active'); tabRegister.setAttribute('aria-pressed','false');
    // focus first input of login
    document.getElementById('loginEmail')?.focus();
  }

  function showRegister(){
    if(!loginForm || !registerForm) return;
    // show register, hide login
    loginForm.hidden = true; registerForm.hidden = false;
    loginForm.setAttribute('aria-hidden','true'); registerForm.setAttribute('aria-hidden','false');
    tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-pressed','false');
    tabRegister.classList.add('active'); tabRegister.setAttribute('aria-pressed','true');
    // focus first input of register
    document.getElementById('regEmail')?.focus();
  }
  // profileMenu logic removed because menu was deleted from HTML

  // UI según estado
  function updateHeaderUI(){
    if(!btnUser) return;
    if(state.user){
      btnUser.setAttribute('aria-label', `Profile (${state.user.email})`);
      btnUser.textContent = '👤 ' + (state.user.username || state.user.email);
    }else{
      btnUser.setAttribute('aria-label', 'Login');
      // profileMenu removed
      btnUser.textContent = '👤';
    }
  }

  // Eventos
  // El botón de usuario fue deshabilitado por el usuario: no le añadimos listener
  // Re-attach behavior: open auth modal when not logged, else allow logout via confirm
  if(btnUser){
    btnUser.addEventListener('click', function(){
      if(state.user){
        // si ya está logueado, preguntar si desea cerrar sesión
        showConfirm('Cerrar sesión?').then(ok => { if(ok){ state.user = null; updateHeaderUI(); showToast('Sesión cerrada.'); } });
      }else{
        openAuthModal(); showLogin();
      }
    });
  }

  // Auth modal listeners
  modalClose?.addEventListener('click', function(){ closeAuthModal(); });
  authModal?.addEventListener('click', function(e){ if(e.target.dataset && e.target.dataset.close === 'modal') closeAuthModal(); });

  tabLogin?.addEventListener('click', function(){ showLogin(); });
  tabRegister?.addEventListener('click', function(){ showRegister(); });

  loginForm?.addEventListener('submit', function(e){
    e.preventDefault();
    var data = new FormData(loginForm);
    var email = (data.get('email')||'').toString().trim();
    var password = (data.get('password')||'').toString().trim();
    if(!email || !password){ showMessage('Ingrese email y contraseña'); return; }
    // Simple check against stored users (array in localStorage)
    var usersRaw = localStorage.getItem('plannea_users');
    var users = usersRaw ? JSON.parse(usersRaw) : [];
    var found = users.find(u => u.email === email && u.password === password);
    if(found){ state.user = { email: found.email, username: found.username }; closeAuthModal(); updateHeaderUI(); showToast('Bienvenido ' + (found.username||found.email)); }
    else { showMessage('Credenciales incorrectas'); }
  });

  registerForm?.addEventListener('submit', function(e){
    e.preventDefault();
    var data = new FormData(registerForm);
    var email = (data.get('email')||'').toString().trim();
    var username = (data.get('username')||'').toString().trim();
    var password = (data.get('password')||'').toString().trim();
    if(!email || !username || !password){ showMessage('Complete todos los campos'); return; }
    var usersRaw = localStorage.getItem('plannea_users');
    var users = usersRaw ? JSON.parse(usersRaw) : [];
    if(users.find(u => u.email === email)){ showMessage('El email ya está registrado'); return; }
    users.push({ email: email, username: username, password: password });
    localStorage.setItem('plannea_users', JSON.stringify(users));
    state.user = { email: email, username: username };
    closeAuthModal(); updateHeaderUI(); showToast('Registro exitoso. Bienvenido ' + username);
  });

  // initial visibility: show login, hide register
  if(loginForm && registerForm){ loginForm.hidden = false; registerForm.hidden = true; loginForm.setAttribute('aria-hidden','false'); registerForm.setAttribute('aria-hidden','true'); }

  // Helper: show inline message inside modal
  function showMessage(msg){
    const spot = document.getElementById('authMessage');
    if(!spot) return alert(msg);
    spot.textContent = msg; spot.hidden = false;
    setTimeout(()=>{ spot.hidden = true; }, 4000);
  }

  // Helper: small toast
  function showToast(msg){
    const toast = document.getElementById('toast');
    if(!toast) return alert(msg);
    toast.textContent = msg; toast.hidden = false;
    setTimeout(()=>{ toast.hidden = true; }, 3000);
  }

  // Exponer para otras páginas
  window.showToast = showToast;

  // Simple focus trap: keep focus inside modal while open
  function focusTrap(e){
    if(!authModal || authModal.hidden) return;
    if(!authModal.contains(e.target)){
      e.stopPropagation();
      authModal.querySelector('button, input, [tabindex]')?.focus();
    }
  }

  // Botón de configuración: navegar a la página de settings
  const btnSettingsEl = document.getElementById('btnSettings');
  if(btnSettingsEl){
    btnSettingsEl.addEventListener('click', function(){
      // Calcular ruta relativa a settings.html dependiendo de dónde estemos
      const path = window.location.pathname || '';
      // si estamos dentro de /pages/ (ej: /pages/agenda.html), subir un nivel
      const target = path.includes('/pages/') ? 'settings.html' : 'pages/settings.html';
      // desde dentro de pages/ usar ./settings.html (ya en la misma carpeta) o desde root 'pages/settings.html'
      const base = path.includes('/pages/') ? '' : '';
      // construir URL: si estamos en pages/ usamos './settings.html', pero para compatibilidad con archivos locales, mejor usar relative
      const url = path.includes('/pages/') ? './settings.html' : 'pages/settings.html';
      window.location.href = url;
    });
  }

  // Confirmation modal helper (returns Promise)
  function showConfirm(message){
    return new Promise((resolve) => {
      const modal = document.getElementById('confirmModal');
      if(!modal) return resolve(confirm(message));
      const msg = modal.querySelector('#confirmMessage');
      const okBtn = modal.querySelector('#confirmOk');
      const cancelBtn = modal.querySelector('#confirmCancel');
      msg && (msg.textContent = message);
      modal.hidden = false; document.body.classList.add('modal-open');
      function cleanup(){ modal.hidden = true; document.body.classList.remove('modal-open'); okBtn.removeEventListener('click', onOk); cancelBtn.removeEventListener('click', onCancel); }
      function onOk(){ cleanup(); resolve(true); }
      function onCancel(){ cleanup(); resolve(false); }
      okBtn.addEventListener('click', onOk); cancelBtn.addEventListener('click', onCancel);
      // close by backdrop
      modal.addEventListener('click', function onBackdrop(e){ if(e.target && e.target.dataset && e.target.dataset.close === 'confirm-modal'){ cleanup(); modal.removeEventListener('click', onBackdrop); resolve(false); }});
    });
  }

  // Tema persistente: aplicar al cargar
  (function applySavedTheme(){
    try{
      const t = localStorage.getItem('plannea_theme') || 'system';
      if(t === 'dark') document.documentElement.classList.add('theme-dark');
      else if(t === 'light') document.documentElement.classList.remove('theme-dark');
      else {
        // system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if(prefersDark) document.documentElement.classList.add('theme-dark');
        else document.documentElement.classList.remove('theme-dark');
      }
    }catch(e){ console.error('theme apply error', e); }
  })();

  // Escuchar cambios de tema si hay un selector en la página
  const themeSelector = document.getElementById('setting-theme');
  if(themeSelector){
    // inicializar selector según lo guardado
    const saved = localStorage.getItem('plannea_theme') || 'system';
    themeSelector.value = saved;
    themeSelector.addEventListener('change', function(){
      const val = this.value;
      localStorage.setItem('plannea_theme', val);
      if(val === 'dark') document.documentElement.classList.add('theme-dark');
      else if(val === 'light') document.documentElement.classList.remove('theme-dark');
      else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if(prefersDark) document.documentElement.classList.add('theme-dark');
        else document.documentElement.classList.remove('theme-dark');
      }
    });
  }

  // profileMenu event listener removed

  // Init
  updateHeaderUI();

  // --- Purchase modal helpers (global so map popup can call) ---
  window.openPurchaseModal = function(eventName){
    const modal = document.getElementById('purchaseModal');
    if(!modal) return alert('No se pudo abrir modal de compra');
    document.getElementById('purchaseEventName').textContent = eventName;
    // find slug & price
    const base = window.planneaEvents || [];
    const ev = base.find(x => x.nombre === eventName || x.slug === eventName) || null;
    modal.dataset.eventSlug = ev ? ev.slug : '';
    modal.dataset.eventPrice = ev ? (ev.price || 0) : 0;
    // update total display
    const totalEl = document.getElementById('purchaseTotal');
    const qty = parseInt(document.getElementById('purchaseQty')?.value || '1',10) || 1;
  if(totalEl) totalEl.textContent = 'Total: ' + window.formatPrice((ev ? ev.price || 0 : 0) * qty);
    modal.hidden = false; document.body.classList.add('modal-open');
  }

  // Event state helpers: merge initial events with any persisted availability in localStorage
  window.getPlanneaEventsState = function(){
    try{
      const base = window.planneaEvents || [];
      const raw = localStorage.getItem('plannea_events_state');
      const state = raw ? JSON.parse(raw) : {};
      return base.map(e => ({ ...e, available: (state[e.slug] !== undefined) ? state[e.slug] : e.available }));
    }catch(e){ return window.planneaEvents || []; }
  }

  window.decrementEventAvailability = function(slug, count){
    try{
      const raw = localStorage.getItem('plannea_events_state');
      const state = raw ? JSON.parse(raw) : {};
      const base = window.planneaEvents || [];
      const ev = base.find(x => x.slug === slug);
      if(!ev) return false;
      const prev = (state[slug] !== undefined) ? state[slug] : ev.available;
      const next = Math.max(0, prev - count);
      state[slug] = next;
      localStorage.setItem('plannea_events_state', JSON.stringify(state));
      return true;
    }catch(e){ return false; }
  }

    // Price formatter helper (uses user's locale, default to ARS)
    window.formatPrice = function(amount){
      try{
        const locale = navigator.language || 'es-AR';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(amount);
      }catch(e){ return '$' + (amount || 0).toLocaleString(); }
    }

  const purchaseModal = document.getElementById('purchaseModal');
  const purchaseCancel = document.getElementById('purchaseCancel');
  const purchaseConfirm = document.getElementById('purchaseConfirm');
  purchaseCancel?.addEventListener('click', function(){ if(purchaseModal){ purchaseModal.hidden = true; document.body.classList.remove('modal-open'); }});
  // update total when qty changes
  const purchaseQtyEl = document.getElementById('purchaseQty');
  purchaseQtyEl?.addEventListener('change', function(){
    const modal = document.getElementById('purchaseModal');
    const price = parseFloat(modal?.dataset?.eventPrice || 0) || 0;
    const q = parseInt(purchaseQtyEl.value||'1',10) || 1;
    const totalEl = document.getElementById('purchaseTotal');
  if(totalEl) totalEl.textContent = 'Total: ' + window.formatPrice(price * q);
  });

  purchaseConfirm?.addEventListener('click', function(){
    const qty = parseInt(document.getElementById('purchaseQty')?.value || '1',10) || 1;
    const buyer = document.getElementById('purchaseBuyer')?.value || '';
    const eventName = document.getElementById('purchaseEventName')?.textContent || 'Evento';
    if(!buyer){ showToast('Ingrese su nombre para completar la compra'); return; }

    // Find event (use merged state to get current availability)
    const stateList = (window.getPlanneaEventsState && window.getPlanneaEventsState()) || (window.planneaEvents || []);
    const ev = stateList.find(x => x.nombre === eventName || x.slug === eventName) || null;
    const slug = ev ? ev.slug : null;
    const unitPrice = ev ? (ev.price || 0) : 0;
    const available = ev ? (ev.available || 0) : 0;

    // Validate availability
    if(qty > available){ showToast('No hay suficientes entradas disponibles. Disponibles: ' + available); return; }

    // Prepare confirmation summary
    const total = unitPrice * qty;
    const summary = [
      'Resumen de compra:',
      'Evento: ' + eventName,
      'Precio unitario: ' + window.formatPrice(unitPrice),
      'Cantidad: ' + qty,
      'Total: ' + window.formatPrice(total),
      'Comprador: ' + buyer,
      '\n¿Desea confirmar la compra?'
    ].join('\n');

    showConfirm(summary).then(function(ok){
      if(!ok) return;

      // persist purchase
      try{
        const purchasesRaw = localStorage.getItem('plannea_purchases');
        const purchases = purchasesRaw ? JSON.parse(purchasesRaw) : [];
        purchases.push({ event: eventName, slug: slug, qty: qty, buyer: buyer, unitPrice: unitPrice, total: total, date: new Date().toISOString() });
        localStorage.setItem('plannea_purchases', JSON.stringify(purchases));
      }catch(e){ console.error('Error guardando compra', e); }

      // decrement availability if we know the slug
      if(slug){
        const ok2 = window.decrementEventAvailability(slug, qty);
        if(!ok2) console.warn('No se pudo actualizar disponibilidad para', slug);
        else {
          // update any availability displays on the page
          document.querySelectorAll('.event-available').forEach(el => {
            const card = el.closest('.event-card');
            const title = card && card.querySelector('.event-title') && card.querySelector('.event-title').textContent.trim();
            if(title === eventName) {
              const state = window.getPlanneaEventsState();
              const updated = state.find(s => s.slug === slug);
              el.textContent = 'Disponibles: ' + (updated ? updated.available : 0);
            }
          });
          // if on detail page, update heroAvail
          const heroAvail = document.getElementById('heroAvail');
          if(heroAvail){
            const state = window.getPlanneaEventsState();
            const updated = state.find(s => s.slug === slug);
            heroAvail.textContent = 'Disponibles: ' + (updated ? updated.available : 0);
          }
        }
      }

      showToast('Compra confirmada: ' + eventName);
      if(purchaseModal){ purchaseModal.hidden = true; document.body.classList.remove('modal-open'); }
    });
  });

  // Delegate buy-button clicks on pages (agenda)
  document.addEventListener('click', function(e){
    const b = e.target.closest && e.target.closest('.buy-button');
    if(b){
      const ev = b.dataset && b.dataset.event;
      if(ev) openPurchaseModal(ev);
    }
  });

  // Search/filter for agenda
  const searchInput = document.getElementById('searchInput');
  if(searchInput){
    searchInput.addEventListener('input', function(){
      const q = this.value.trim().toLowerCase();
      document.querySelectorAll('.event-card').forEach(card => {
        const titleEl = card.querySelector('.event-title');
        const dateEl = card.querySelector('.event-date');
        const img = card.querySelector('img.event-image');
        const title = (titleEl && titleEl.textContent || '').toLowerCase();
        const date = (dateEl && dateEl.textContent || '').toLowerCase();
        const imgAlt = (img && img.alt || '').toLowerCase();
        const hay = [title, date, imgAlt].join(' ');
        card.style.display = q.length === 0 || hay.includes(q) ? '' : 'none';
      });
    });
  }
})();
