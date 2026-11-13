import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import { app, shell, safeStorage } from "electron";
import http from "http";
import fs from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/documents"];
const TOKEN_PATH = path.join(app.getPath("userData"), "google-token.bin");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRETE!;

//const CREDENTIALS_PATH = path.join(app.getAppPath(), "..", "credentials.json");

// checks if user is already signed in when app runs
export function getSavedClient() {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }
  const refreshToken = safeStorage.decryptString(fs.readFileSync(TOKEN_PATH));
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

// Runs when the user clicks "Sign in with Google"
export async function signInWithGoogle() {
  //local server to catch google's sign-in redirect page
  const server = http.createServer();
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  const redirectURI = `http://127.0.0.1:${port}`;

  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectURI);

  // use PKCE secret for security
  const { codeVerifier, codeChallenge } =
    await client.generateCodeVerifierAsync();
  const authURL = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
  });

  const code = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Sign-in timed out")),
      5 * 60_000,
    );

    server.on("request", (req, res) => {
      const params = new URL(req.url!, redirectURI).searchParams;

      if (params.get("error")) {
        res.end("Sign-in cancelled. You may close this tab.");
        clearTimeout(timeout);
        return reject(new Error("Sign-in cancelled"));
      }

      const code = params.get("code");
      if (!code) {
        return res.end();
      }
      res.end("You are signed in, and may close the tab");
      resolve(code);
    });
    shell.openExternal(authURL);
  }).finally(() => server.close());

  //use code to get google auth tokens, save the refreshed token
  const { tokens } = await client.getToken({ code, codeVerifier });
  client.setCredentials(tokens);
  fs.writeFileSync(
    TOKEN_PATH,
    safeStorage.encryptString(tokens.refresh_token!),
  );
  return client;
}
