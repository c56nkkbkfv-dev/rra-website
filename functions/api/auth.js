export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  const provider = url.searchParams.get("provider") || "github";
  const scope = url.searchParams.get("scope") || "repo";

  if (provider !== "github") {
    return new Response("Unsupported provider", { status: 400 });
  }

  if (!env.GITHUB_CLIENT_ID) {
    return new Response("Missing GITHUB_CLIENT_ID environment variable", { status: 500 });
  }

  const redirectUri = `${url.origin}/api/callback`;
  const state = crypto.randomUUID();

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return Response.redirect(authUrl.toString(), 302);
}
