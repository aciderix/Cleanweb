// Désactiver la CSP pour l'administration uniquement
if (window.location.pathname.startsWith('/admin')) {
  // Supprimer les en-têtes CSP existants
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";
  document.head.appendChild(meta);
}
