/**
 * Environment variable validation.
 *
 * Centralizes the list of env vars the server needs at runtime and produces
 * clean, actionable error messages instead of letting Appwrite calls explode
 * with "endpoint is undefined" stack traces deep inside the SDK.
 *
 * The Appwrite config module imports `requireEnv` at load time so a
 * misconfigured deploy fails loudly and consistently across every server
 * action and route handler.
 */

/**
 * Returns the value of `name` from process.env, throwing a descriptive
 * error if it is missing or empty. Use this for server-side variables;
 * call `requirePublicEnv` for `NEXT_PUBLIC_*` so the message reflects the
 * fact that those are bundled into the client build too.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env.local (and your Vercel project settings).`,
    );
  }
  return value;
}

/**
 * Same as `requireEnv` but the error message hints that the var must be
 * configured at build time for it to reach the client bundle.
 */
export function requirePublicEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required public environment variable: ${name}. ` +
        `It must be set in the build environment (NEXT_PUBLIC_* vars are ` +
        `inlined at build time, not read at runtime on the client).`,
    );
  }
  return value;
}
