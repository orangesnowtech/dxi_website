import { randomUUID } from "crypto";
import { getStorage } from "firebase-admin/storage";
import "@/lib/firebase/admin";

/**
 * Event poster storage.
 *
 * Firebase has used two bucket naming styles — `*.appspot.com` for older
 * projects and `*.firebasestorage.app` for newer ones — and which you get
 * depends on when the bucket was created. Rather than hardcode a guess, the
 * name is read from the environment and otherwise probed once and remembered.
 */

const BUCKET_ENV = process.env.FIREBASE_STORAGE_BUCKET?.trim();

let resolvedBucket: string | null = null;

function candidateBuckets() {
  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT)?.trim();

  return [
    BUCKET_ENV,
    projectId ? `${projectId}.firebasestorage.app` : null,
    projectId ? `${projectId}.appspot.com` : null,
  ].filter((name): name is string => Boolean(name));
}

export async function resolveBucketName(): Promise<string> {
  if (resolvedBucket) {
    return resolvedBucket;
  }

  const candidates = candidateBuckets();

  for (const name of candidates) {
    try {
      const [exists] = await getStorage().bucket(name).exists();

      if (exists) {
        resolvedBucket = name;
        return name;
      }
    } catch {
      // Try the next candidate; a permissions error on one name says nothing
      // about the others.
    }
  }

  throw new Error(
    candidates.length > 0
      ? `No Firebase Storage bucket found. Tried: ${candidates.join(", ")}. Enable Storage in the Firebase console, or set FIREBASE_STORAGE_BUCKET.`
      : "No Firebase project id configured, so the storage bucket cannot be resolved."
  );
}

export const MAX_POSTER_BYTES = 5 * 1024 * 1024;

export const ALLOWED_POSTER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Stores a poster and returns a URL that will still work in a year.
 *
 * Deliberately not `makePublic()`: buckets created today default to uniform
 * bucket-level access, where per-object ACLs are rejected outright. Instead the
 * object carries a download token, which is exactly what the Firebase client
 * SDK's `getDownloadURL` produces — it works whatever the bucket's access mode,
 * and needs no IAM change to allUsers.
 *
 * Signed URLs were the other option and are wrong here: V4 signing caps at
 * seven days, and a poster outliving its own link is a broken card on the
 * listing page.
 */
export async function uploadEventPoster(
  slug: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const extension = ALLOWED_POSTER_TYPES[contentType];

  if (!extension) {
    throw new Error("Posters must be a JPEG, PNG or WebP image.");
  }

  if (data.byteLength > MAX_POSTER_BYTES) {
    throw new Error("Posters must be 5MB or smaller.");
  }

  const bucketName = await resolveBucketName();
  const token = randomUUID();

  // The random segment means re-uploading a poster for the same event writes a
  // new object rather than overwriting one that a cached page still points at.
  const objectPath = `event-posters/${slug}/${randomUUID()}.${extension}`;

  await getStorage()
    .bucket(bucketName)
    .file(objectPath)
    .save(data, {
      contentType,
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    objectPath
  )}?alt=media&token=${token}`;
}
