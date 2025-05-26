
// This file provides stubs and schema guidance for Firebase backend features.
// It is NOT meant to be directly run or imported.
// You'll need to create actual Firebase Cloud Functions and Firestore rules in your Firebase project.

// -----------------------------------------------------------------------------
// Firestore Schema Design Ideas
// -----------------------------------------------------------------------------

/*
// /users/{userId}
interface UserDocument {
  uid: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  role: 'owner' | 'worker';
  createdAt: firebase.firestore.Timestamp;
  
  // If worker, link to the team/owner they belong to
  teamId?: string;      // ID of the team document
  ownerUid?: string;    // UID of the owner whose data they access
}

// /teams/{teamId}  (teamId could be the owner's UID for simplicity if one owner = one team)
interface TeamDocument {
  ownerUid: string;
  teamName?: string; // e.g., Shop Name
  hashedTeamPassword?: string; // Password hashed with a secure algorithm (e.g., bcrypt, scrypt via Cloud Function)
  createdAt: firebase.firestore.Timestamp;
  // You might store other team-wide settings here
}

// /invitations/{invitationId}
interface InvitationDocument {
  teamId: string; // ID of the team the worker is invited to
  ownerUid: string; // UID of the owner who sent the invite
  workerEmail: string; // Email of the invited worker
  workerName?: string; // Optional name provided by owner
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: firebase.firestore.Timestamp;
  expiresAt?: firebase.firestore.Timestamp;
  // acceptedByUid?: string; // Worker's UID once they accept and register/login
}

// Data collections (Products, Services, Invoices) would be structured under an owner
// Example: /owners/{ownerUid}/products/{productId}
// This allows security rules to easily control access.

interface ProductDocument { // Stored in Firestore
  ownerUid: string; // To identify which owner this product belongs to
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
  category?: string;
  description?: string;
  imageUrl: string;
  gstPercentage: number;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}

// Similar structures for ServiceDocument and InvoiceDocument, always including ownerUid.
*/

// -----------------------------------------------------------------------------
// Firebase Cloud Function Stubs (TypeScript)
// Place these in your Firebase project's functions/src/index.ts (or similar)
// You'll need to install 'firebase-admin', 'firebase-functions', 'zod', and an email sending library (e.g., nodemailer).
// -----------------------------------------------------------------------------

/*
// In your functions/src/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
// import * as nodemailer from 'nodemailer'; // Example email library

admin.initializeApp();
const db = admin.firestore();

// --- Send Team Invitation ---
const sendTeamInvitationSchema = z.object({
  workerEmail: z.string().email(),
  workerName: z.string().optional(),
  // teamId: z.string(), // Or ownerUid if teamId is ownerUid
});

export const sendTeamInvitation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send invitations.');
  }

  const validationResult = sendTeamInvitationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided.', validationResult.error.format());
  }

  const { workerEmail, workerName } = validationResult.data;
  const ownerUid = context.auth.uid;

  // 1. Check if owner already has a team or create one (simplified: assume team exists or uses ownerUid as teamId)
  // const teamId = ownerUid; // Simplified: teamId is the owner's UID

  // 2. Check if an invitation for this email already exists for this team and is pending
  const existingInviteQuery = await db.collection('invitations')
    .where('ownerUid', '==', ownerUid)
    .where('workerEmail', '==', workerEmail)
    .where('status', '==', 'pending')
    .limit(1)
    .get();

  if (!existingInviteQuery.empty) {
    throw new functions.https.HttpsError('already-exists', 'An invitation for this email is already pending.');
  }

  // 3. Create invitation document in Firestore
  const invitationRef = db.collection('invitations').doc();
  const invitationId = invitationRef.id;
  const invitationLink = `https://YOUR_APP_DOMAIN/accept-invite?inviteId=${invitationId}`; // Replace YOUR_APP_DOMAIN

  await invitationRef.set({
    ownerUid,
    workerEmail,
    workerName: workerName || '',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Optional: 7-day expiry
  });

  // 4. Send email to worker (using nodemailer or Firebase Extension like "Trigger Email")
  // This part requires setting up an email transport.
  // Example (conceptual, needs full setup):
  // const mailTransport = nodemailer.createTransport({ service: 'gmail', auth: { user: 'your-email@gmail.com', pass: 'your-password-or-app-password' } });
  // await mailTransport.sendMail({
  //   from: '"Your App Name" <no-reply@yourdomain.com>',
  //   to: workerEmail,
  //   subject: 'You are invited to join a team!',
  //   html: `
  //     <p>Hello ${workerName || workerEmail},</p>
  //     <p>You have been invited to join a team on SwiftSale POS by the owner (user ID: ${ownerUid}).</p>
  //     <p>Click here to accept: <a href="${invitationLink}">${invitationLink}</a></p>
  //     <p>You will need the Team Password provided by the owner to complete the process.</p>
  //   `,
  // });

  functions.logger.info(`Invitation sent to ${workerEmail} for owner ${ownerUid}, invite ID: ${invitationId}`);
  return { success: true, invitationId };
});


// --- Accept Team Invitation ---
const acceptTeamInvitationSchema = z.object({
  invitationId: z.string(),
  teamPasswordAttempt: z.string().min(6),
});

export const acceptTeamInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to accept an invitation.');
  }

  const validationResult = acceptTeamInvitationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided.', validationResult.error.format());
  }

  const { invitationId, teamPasswordAttempt } = validationResult.data;
  const workerUid = context.auth.uid; // UID of the user trying to accept

  const invitationRef = db.collection('invitations').doc(invitationId);
  const invitationSnap = await invitationRef.get();

  if (!invitationSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Invitation not found or expired.');
  }

  const invitationData = invitationSnap.data()!;

  if (invitationData.status !== 'pending') {
    throw new functions.https.HttpsError('failed-precondition', `Invitation is already ${invitationData.status}.`);
  }
  
  if (invitationData.workerEmail.toLowerCase() !== context.auth.token.email?.toLowerCase()) {
    throw new functions.https.HttpsError('permission-denied', 'This invitation is not for your email address.');
  }

  // Verify Team Password
  const teamRef = db.collection('teams').doc(invitationData.ownerUid); // Assuming teamId is ownerUid
  const teamSnap = await teamRef.get();

  if (!teamSnap.exists || !teamSnap.data()?.hashedTeamPassword) {
    throw new functions.https.HttpsError('internal', 'Team configuration error. Contact owner.');
  }

  const { hashedTeamPassword } = teamSnap.data()!;
  
  // IMPORTANT: Hashing and comparison must be secure.
  // Use a library like bcrypt. Cloud Functions environment might need specific setup for native modules.
  // const passwordsMatch = await bcrypt.compare(teamPasswordAttempt, hashedTeamPassword);
  // For this stub, we'll do a plain text comparison (DO NOT USE IN PRODUCTION)
  const passwordsMatch = teamPasswordAttempt === "Team@123_TEMP_UNHASHED"; // REPLACE WITH ACTUAL HASHED PASSWORD CHECK

  if (!passwordsMatch) {
    throw new functions.https.HttpsError('invalid-argument', 'Incorrect Team Password.');
  }

  // Update user document (worker)
  const workerUserRef = db.collection('users').doc(workerUid);
  await workerUserRef.set({ // Or .update if user doc already exists
    role: 'worker',
    ownerUid: invitationData.ownerUid,
    teamId: invitationData.ownerUid, // Again, assuming teamId is ownerUid
    // Copy other relevant fields from context.auth if needed
    email: context.auth.token.email,
    displayName: context.auth.token.name || '',
  }, { merge: true });

  // Update invitation status
  await invitationRef.update({
    status: 'accepted',
    acceptedByUid: workerUid,
    acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Worker ${workerUid} accepted invitation ${invitationId} for owner ${invitationData.ownerUid}`);
  return { success: true, message: 'Invitation accepted successfully!' };
});


// --- (Optional) Hash Team Password Function ---
// This would be called when an owner sets or updates their team password.
// For brevity, not fully stubbed here, but it would take the clear-text password,
// hash it using bcrypt, and store the hash in the /teams/{ownerUid} document.
*/


// -----------------------------------------------------------------------------
// Firebase Security Rules (examples for firestore.rules)
// -----------------------------------------------------------------------------

/*
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to get user's role and ownerUid (if worker)
    function getUserData(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data;
    }

    // Users collection:
    // - Authenticated users can create their own user document (on first registration).
    // - Users can read/update their own document.
    // - Cloud Functions (with admin privileges) can update roles/teamId for workers.
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      // allow write: if request.auth.token.admin == true; // For admin SDK
    }

    // Teams collection:
    // - Owner can create/read/update their own team document.
    // - Workers cannot directly access team passwords.
    match /teams/{ownerId} {
      allow read, write: if request.auth.uid == ownerId;
      // Workers should not read hashedTeamPassword directly
    }

    // Invitations collection:
    // - Owner can create invitations for their team.
    // - Invited worker can read their specific invitation (e.g., to check status if link is re-used).
    // - Cloud Functions handle status updates.
    match /invitations/{inviteId} {
      allow read: if request.auth.uid == get(/databases/$(database)/documents/invitations/$(inviteId)).data.ownerUid ||
                     request.auth.token.email == get(/databases/$(database)/documents/invitations/$(inviteId)).data.workerEmail;
      allow create: if request.auth.uid == request.resource.data.ownerUid; // Owner creates
      // Updates to 'status' should ideally be done by Cloud Functions
    }

    // Owner-specific data collections (e.g., products, services, invoices)
    // Assuming data is stored under /owners/{ownerUid}/collectionName/{docId}
    match /owners/{ownerId}/{collectionName}/{docId} {
      allow read, write: if request.auth.uid == ownerId; // Owner has full access

      // Worker access:
      // Worker can read/write if their user document has role 'worker'
      // AND their ownerUid matches the {ownerId} in the path.
      allow read, write: if getUserData(request.auth.uid).role == 'worker' &&
                           getUserData(request.auth.uid).ownerUid == ownerId;
    }

    // If data is directly under /products/{productId} but has an ownerUid field:
    // match /products/{productId} {
    //   function productData() { return resource.data; }
    //   allow read, write: if request.auth.uid == productData().ownerUid ||
    //                        (getUserData(request.auth.uid).role == 'worker' &&
    //                         getUserData(request.auth.uid).ownerUid == productData().ownerUid);
    // }
    // Similar rules for /services and /invoices
  }
}
*/
