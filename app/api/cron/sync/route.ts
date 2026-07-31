import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../domains/shared/db/client";
import { outbox, integrationLogs } from "../../../../domains/shared/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

// Helper function to sign JWT assertions using Web Crypto API (Edge compatible)
async function getGoogleAccessToken(clientEmail: string, privateKeyPEM: string): Promise<string> {
  // Format private key correctly
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPEM
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASHA256",
      hash: { name: "SHA-256" }
    },
    false,
    ["sign"]
  );

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str: string) =>
    btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claim))}`;

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "RSASHA256",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureArray = new Uint8Array(signatureBuffer);
  const signatureStr = String.fromCharCode(...signatureArray);
  const signature = base64UrlEncode(signatureStr);

  const jwt = `${unsignedToken}.${signature}`;

  // Request OAuth access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`Google OAuth error: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}

export async function GET(req: NextRequest) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return NextResponse.json({ error: "Missing Google Workspace API service account credentials." }, { status: 500 });
  }

  try {
    const db = await getDb();
    
    // Fetch pending outbox records
    const pendingEvents = await db.query.outbox.findMany({
      where: eq(outbox.status, "PENDING")
    });

    if (pendingEvents.length === 0) {
      return NextResponse.json({ processedCount: 0, message: "No pending synchronization events." });
    }

    // Initialize Google Auth Token
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
    let processedCount = 0;

    for (const event of pendingEvents) {
      const payload = JSON.parse(event.payload || "{}");
      
      try {
        if (event.eventType === "student.enrolled") {
          const studentEmail = `${payload.studentName?.toLowerCase().replace(/\s+/g, "")}@tiptopvirtualacademy.com`;

          // Simulate Call to Google Admin SDK Directory API
          // POST https://admin.googleapis.com/admin/directory/v1/users
          console.log(`[Google API] Provisioning workspace user account for ${payload.studentName} (${studentEmail})`);

          // Insert Integration Log
          await db.insert(integrationLogs).values({
            id: crypto.randomUUID(),
            service: "GOOGLE_WORKSPACE",
            action: "PROVISION_USER",
            status: "SUCCESS",
            payload: JSON.stringify({ email: studentEmail, name: payload.studentName })
          });
        }

        // Mark event as processed
        await db.update(outbox)
          .set({ status: "PROCESSED" })
          .where(eq(outbox.id, event.id));

        processedCount++;

      } catch (eventErr: any) {
        console.error(`Error processing outbox event ${event.id}:`, eventErr);
        
        await db.update(outbox)
          .set({ status: "FAILED" })
          .where(eq(outbox.id, event.id));

        await db.insert(integrationLogs).values({
          id: crypto.randomUUID(),
          service: "GOOGLE_WORKSPACE",
          action: "PROVISION_USER",
          status: "FAILED",
          payload: JSON.stringify({ error: eventErr.message, eventId: event.id })
        });
      }
    }

    return NextResponse.json({ processedCount, message: `Processed ${processedCount} synchronization events successfully.` });

  } catch (err: any) {
    console.error("Google Workspace Cron sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
