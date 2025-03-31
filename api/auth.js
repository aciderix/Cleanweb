// api/auth.js
exports.handler = async (event, context) => {
  const redirectUrl = 'https://clean-eau-nantes.netlify.app/admin/';
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
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
            domain: 'dev-x3odl65g8c07cjf5.us.auth0.com',
            clientID: 'fHdNXEZgsI166aHZfFu6GcDNtCzZoefC',
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