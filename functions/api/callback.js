export async function onRequestGet(context) {
  const { env, request } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    return new Response("OAuth failed", { status: 500 });
  }

  return new Response(`
    <script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({
          token: data.access_token
        })}',
        window.location.origin
      );
      window.close();
    </script>
  `, {
    headers: {
      "Content-Type": "text/html"
    }
  });
}
