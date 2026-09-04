/**
 * Gives an admin account a password, so `npm run dev` does not need Google.
 *
 * Google sign-in is the only way into /admin in production, and it should stay
 * that way. Locally it is a nuisance: the OAuth client has to list
 * `http://localhost:3001/__/auth/handler` as an authorised redirect URI, and
 * when it does not, sign-in dies at Google with "Access blocked" — which is a
 * console trip to fix, not a code change.
 *
 * So this writes a password onto an existing Firebase Auth user. Nothing about
 * the gate changes: the login form still trades the credential for an ID
 * token, /api/admin/session still verifies it and still checks
 * `hasAdminAccess`, and this account still needs the admin claim like any
 * other. The only difference is which Firebase provider minted the token.
 *
 * Run with:
 *   node scripts/dev-admin-password.js              # uses DEV_ADMIN_EMAIL
 *   node scripts/dev-admin-password.js me@here.com  # or name one
 *
 * Reads DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD from .env.local, which is
 * gitignored. The password is never passed as an argument, so it stays out of
 * shell history, and is never printed.
 *
 * Two things must be true in the Firebase console for the sign-in to work:
 *   1. Authentication > Sign-in method > Email/Password is enabled.
 *   2. This account is an admin — the super admin, or granted the claim by
 *      scripts/seed-admins.js or /admin/admins.
 * This script checks the second and tells you about the first.
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch {
  console.warn('Note: dotenv not installed. Set environment variables manually.');
}

const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Must match SUPER_ADMIN_EMAIL in src/lib/admin-auth.ts.
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'chris@dximarketing.com')
  .trim()
  .toLowerCase();

// Firebase's own floor is six characters. Anything at that floor on an account
// that can read the whole customer list is not worth having.
const MIN_PASSWORD_LENGTH = 10;

function initAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    ''
  ).trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.'
    );
    process.exit(1);
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

async function main() {
  const email = (process.argv[2] || process.env.DEV_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.DEV_ADMIN_PASSWORD || '';

  if (!email) {
    console.error('No account named. Set DEV_ADMIN_EMAIL in .env.local, or pass one as an argument.');
    process.exit(1);
  }

  if (!password) {
    console.error('Set DEV_ADMIN_PASSWORD in .env.local. It is not read from the command line, so it stays out of your shell history.');
    process.exit(1);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `DEV_ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters. This account can read every registration and lead in the project.`
    );
    process.exit(1);
  }

  const auth = getAuth(initAdminApp());

  let user;

  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }

    console.error(
      `No Firebase user for ${email}. Create it and grant admin first:\n  node scripts/seed-admins.js ${email}`
    );
    process.exit(1);
  }

  const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
  const isAdmin = isSuperAdmin || user.customClaims?.admin === true;

  if (!isAdmin) {
    // Setting a password on a non-admin would produce an account that signs in
    // happily and is then refused at /api/admin/session, which reads as a
    // broken password rather than a missing claim.
    console.error(
      `${email} is not an admin, so a password would not get it into the dashboard. Grant it first:\n  node scripts/seed-admins.js ${email}`
    );
    process.exit(1);
  }

  // verifyAdminSessionCookie refuses an unverified address, and an account
  // created by seed-admins.js has never been through an email loop.
  await auth.updateUser(user.uid, { password, emailVerified: true, disabled: false });

  console.log(`Password set for ${email} (${isSuperAdmin ? 'super admin' : 'admin'}).`);
  console.log('\nIf sign-in still fails with auth/operation-not-allowed, enable it:');
  console.log('  Firebase console > Authentication > Sign-in method > Email/Password');
  console.log('\nThen run npm run dev and sign in at http://localhost:3001/admin/login.');
  console.log('The password box only renders in development; production stays Google-only.');
}

main().catch((error) => {
  // Never let a thrown Firebase error carry the password into a log.
  console.error(error?.code || error?.message || 'Failed to set the password.');
  process.exit(1);
});
