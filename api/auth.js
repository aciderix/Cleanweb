// api/auth.js
exports.handler = async (event, context) => {
  const redirectUrl = 'https://clean-eau-nantes.netlify.app/admin/';
  
  // Récupération des identifiants Auth0 depuis les variables d'environnement
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0ClientID = process.env.AUTH0_CLIENT_ID;
  
  // Vérifier que les variables d'environnement sont définies
  if (!auth0Domain || !auth0ClientID) {
    console.error('Variables d\'environnement AUTH0_DOMAIN ou AUTH0_CLIENT_ID non définies');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Configuration incorrecte', 
        message: 'Les paramètres d\'authentification ne sont pas configurés'
      })
    };
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'X-Content-Type-Options': 'nosniff'
    },
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Authentification</title>
        <script src="https://cdn.auth0.com/js/auth0/9.14/auth0.min.js"></script>
      </head>
      <body>
        <script>
          const auth0 = new auth0.WebAuth({
            domain: '${auth0Domain}',
            clientID: '${auth0ClientID}',
            redirectUri: '${redirectUrl}',
            responseType: 'token id_token',
            scope: 'openid profile email'
          });
          
          auth0.authorize();
        </script>
      </body>
      </html>
    `
  };
}; 