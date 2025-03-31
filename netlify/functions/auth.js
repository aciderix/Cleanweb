// Fonction Netlify pour gérer l'authentification Auth0
exports.handler = async (event, context) => {
  try {
    // Vérifier si la méthode est GET
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }
    
    const redirectUrl = 'https://clean-eau-nantes.netlify.app/admin/callback';
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Redirection vers Auth0</title>
          <script src="https://cdn.auth0.com/js/auth0/9.14/auth0.min.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin-top: 50px;
            }
            .loader {
              border: 5px solid #f3f3f3;
              border-top: 5px solid #1a7ba3;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 2s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <h2>Redirection vers la page d'authentification...</h2>
          <div class="loader"></div>
          <p>Vous allez être redirigé vers Auth0 pour vous connecter.</p>
          
          <script>
            window.addEventListener('load', function() {
              const webAuth = new auth0.WebAuth({
                domain: 'dev-x3odl65g8c07cjf5.us.auth0.com',
                clientID: 'fHdNXEZgsI166aHZfFu6GcDNtCzZoefC',
                redirectUri: '${redirectUrl}',
                responseType: 'token id_token',
                scope: 'openid profile email'
              });
              
              // Rediriger vers Auth0 après un court délai
              setTimeout(function() {
                webAuth.authorize();
              }, 1000);
            });
          </script>
        </body>
        </html>
      `
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}; 