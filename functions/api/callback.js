export async function onRequestGet(context) {
  const { env, request } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const redirectUri = `${url.origin}/api/callback`;

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        state,
        redirect_uri: redirectUri
      })
    }
  );

  const data = await tokenResponse.json();

  if (!data.access_token) {
    return new Response(
      `<html>
        <body>
          <h2>GitHub OAuth Error</h2>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html"
        }
      }
    );
  }

  const tokenPayload = JSON.stringify({
    token: data.access_token
  });

  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Complete</title>
    </head>
    <body>
      <script>
        (function() {
          function sendToken() {
            if (window.opener) {
              window.opener.postMessage(
                "authorization:github:success:${tokenPayload}",
                window.location.origin
              );

              setTimeout(function() {
                window.close();
              }, 500);
            } else {
              document.body.innerHTML =
                "<h2>Authentication successful</h2><p>You can close this window.</p>";
            }
          }

          sendToken();
        })();
      </script>
    </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html"
      }
    }
  );
}
