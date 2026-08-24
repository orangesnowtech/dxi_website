/**
 * Bootstraps admin access.
 *
 * Access is granted by the `admin: true` custom claim on a Firebase Auth user,
 * plus one hardcoded super admin who always has access and is the only account
 * allowed to change the list. Day to day this is managed from /admin/admins —
 * this script exists for the bootstrap case, and for when nobody can get in.
 *
 * Run with:
 *   node scripts/seed-admins.js                      # ensure super admin exists, list admins
 *   node scripts/seed-admins.js name@dximarketing.com  # also grant admin to these
 *   node scripts/seed-admins.js --dry ...            # show what would change
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY
 * in .env.local.
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

const dryRun = process.argv.includes('--dry');
const extraEmails = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith('--'))
  .map((arg) => arg.trim().toLowerCase());

function initAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '').trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\n/g, '\n').trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.'
    );
    process.exit(1);
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

async function ensureUser(auth, email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  if (dryRun) {
    console.log(`  [dry] would create ${email}`);
    return null;
  }

  // No password and no linked provider, so their first Google sign-in attaches
  // to this record rather than creating a second one.
  const user = await auth.createUser({ email, emailVerified: true, disabled: false });
  console.log(`  created ${email} (uid ${user.uid})`);
  return user;
}

async function grantAdmin(auth, email) {
  const user = await ensureUser(auth, email);

  if (!user) {
    return;
  }

  if (user.customClaims?.admin === true) {
    console.log(`  ${email} already has the admin claim`);
    return;
  }

  if (dryRun) {
    console.log(`  [dry] would set admin claim on ${email}`);
    return;
  }

  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
  console.log(`  admin claim set on ${email}`);
}

async function listAdmins(auth) {
  const admins = [];
  let pageToken;

  do {
    const page = await auth.listUsers(1000, pageToken);

    for (const user of page.users) {
      const isSuper = (user.email || '').toLowerCase() === SUPER_ADMIN_EMAIL;

      if (isSuper || user.customClaims?.admin === true) {
        admins.push({ email: user.email, isSuper, disabled: user.disabled });
      }
    }

    pageToken = page.pageToken;
  } while (pageToken);

  return admins;
}

async function main() {
  const auth = getAuth(initAdminApp());

  console.log(`Super admin: ${SUPER_ADMIN_EMAIL}${dryRun ? ' (dry run)' : ''}\n`);

  // The super admin needs an account to sign in to, but no claim — access is
  // by email, so they cannot be locked out by a bad claim edit.
  await ensureUser(auth, SUPER_ADMIN_EMAIL);

  for (const email of extraEmails) {
    if (email === SUPER_ADMIN_EMAIL) continue;
    await grantAdmin(auth, email);
  }

  const admins = await listAdmins(auth);
  console.log('\nCurrent admins:');

  for (const admin of admins) {
    const role = admin.isSuper ? 'super admin' : 'admin';
    console.log(`  ${admin.email} — ${role}${admin.disabled ? ' (disabled)' : ''}`);
  }

  console.log('\nManage this list at /admin/admins, signed in as the super admin.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
