export async function onRequestGet(context) {
  const { env, request } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // Include redirect_uri to match the one used during the authorize step.
  // GitHub requires the same redirect_uri in the token exchange when one was provided
  // in the initial authorization request.
  const redirectUri = `${url.origin}/api/callback`;

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      state
    })
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    // Return the GitHub response for easier debugging in the browser.
    return new Response(
      JSON.stringify(data, null, 2),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  // Return an HTML response that posts the token back to the opener window
  // using the format Decap (Netlify) CMS expects.
  return new Response(`
    <script>
      (function() {
        try {
          var msg = 'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(data.access_token)} });
          // If the callback was opened by the admin UI as a popup, postMessage back to the opener.
          if (window.opener) {
            window.opener.postMessage(msg, window.location.origin);
            window.close();
          } else {
            // If there's no opener (redirect in same tab), write a simple success message and show the token.
            document.body.innerText = 'Authentication successful. You can close this window.';
            console.log(msg);
          }
        } catch (e) {
          document.body.innerText = 'OAuth callback error';
          console.error(e);
        }
      })();
    </script>
  `, {
    headers: {
      "Content-Type": "text/html"
    }
  });
}
