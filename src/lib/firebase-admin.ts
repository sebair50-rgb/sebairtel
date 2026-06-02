import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
    "Please set it in .env.local with the Firebase service account private key JSON."
  );
}

const serviceAccount = JSON.parse(serviceAccountKey);

const app = !getApps().length
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApp();

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { app as adminApp, adminDb, adminAuth, adminStorage };
