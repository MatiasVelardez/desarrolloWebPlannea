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
        var ok = confirm('Cerrar sesión?');
        if(ok){ state.user = null; updateHeaderUI(); showToast('Sesión cerrada.'); }
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

  // Simple focus trap: keep focus inside modal while open
  function focusTrap(e){
    if(!authModal || authModal.hidden) return;
    if(!authModal.contains(e.target)){
      e.stopPropagation();
      authModal.querySelector('button, input, [tabindex]')?.focus();
    }
  }

  // profileMenu event listener removed

  // Init
  updateHeaderUI();
})();
