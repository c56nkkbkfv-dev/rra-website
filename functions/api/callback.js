export async function onRequestGet(context) {
const { env, request } = context;

const url = new URL(request.url);
const code = url.searchParams.get("code");

if (!code) {
return new Response("Missing code", { status: 400 });
}

const redirectUri = `${url.origin}/api/callback`;

const tokenResponse = await fetch(
"https://github.com/login/oauth/access_token",
{
method: "POST",
headers: {
Accept: "application/json",
"Content-Type": "application/json"
},
body: JSON.stringify({
client_id: env.GITHUB_CLIENT_ID,
client_secret: env.GITHUB_CLIENT_SECRET,
code,
redirect_uri: redirectUri
})
}
);

const data = await tokenResponse.json();

if (!data.access_token) {
return new Response(
`<pre>${JSON.stringify(data, null, 2)}</pre>`,
{
status: 500,
headers: {
"Content-Type": "text/html"
}
}
);
}

const payload = `authorization:github:success:${JSON.stringify({
    token: data.access_token
  })}`;

return new Response(
`<!DOCTYPE html>

<html>
<body>
<script>
if (window.opener) {
  window.opener.postMessage(${JSON.stringify(payload)}, "*");
}
window.close();
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
