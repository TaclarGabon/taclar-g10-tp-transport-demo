(function(){
  const ROLE_KEY = 'taclar_demo_role';
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const roleByPage = {
    'client.html':'Client',
    'chauffeur.html':'Chauffeur',
    'dispatch.html':'Chef d’exploitation',
    'direction.html':'Direction'
  };

  function setRole(role){
    sessionStorage.setItem(ROLE_KEY, role);
  }

  function clearRole(){
    sessionStorage.removeItem(ROLE_KEY);
  }

  function updateRoleUI(role){
    document.querySelectorAll('[data-role-name]').forEach(el => el.textContent = role || 'Visiteur');
    document.querySelectorAll('[data-role-status]').forEach(el => {
      el.textContent = role ? '● En ligne' : '● Déconnecté';
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(page === 'login.html'){
      document.querySelectorAll('[data-login-role]').forEach(link => {
        link.addEventListener('click', function(){
          setRole(link.getAttribute('data-login-role'));
        });
      });
      return;
    }

    let role = sessionStorage.getItem(ROLE_KEY);
    const expected = roleByPage[page];
    if(expected){
      // Accès direct autorisé pour la démo : le rôle de la page devient la session active.
      if(!role || role !== expected){
        role = expected;
        setRole(role);
      }
    }
    updateRoleUI(role);

    document.querySelectorAll('.js-logout').forEach(link => {
      link.addEventListener('click', function(e){
        e.preventDefault();
        clearRole();
        window.location.href = 'login.html';
      });
    });
  });
})();
