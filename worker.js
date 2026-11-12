// Bonheur : le site est une page statique (site/index.html, générée par scripts/bundle.py),
// avec les images et les PDF de L'Art d'être heureux à côté. Les réponses restent dans le navigateur :
// ce Worker ne reçoit et ne conserve rien. Il ne sert que les fichiers ; toute autre adresse renvoie à l'accueil.
export default {
  async fetch(request) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Méthode non autorisée', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return Response.redirect(new URL('/', request.url).toString(), 302);
  },
};
