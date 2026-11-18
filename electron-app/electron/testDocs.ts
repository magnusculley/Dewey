import path from "node:path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { app } from "electron";
import type {
  PreviewBatchUpdateBody,
  PreviewBatchUpdateResponse,
} from "../src/google/Docspreviewtypes";

//i'll change scope later
const SCOPES = ["https://www.googleapis.com/auth/documents"];

// The path to the credentials file.
const CREDENTIALS_PATH = path.join(app.getAppPath(), "credentials.json");

// test to read a doc
export async function readDoc(documentId: string) {
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  // `as any` avoids a TS clash between two copies of google-auth-library
  const docs = google.docs({ version: "v1", auth: auth as any });
  const { data } = await docs.documents.get({ documentId });

  const text = (data.body?.content ?? [])
    .flatMap((el) => el.paragraph?.elements ?? [])
    .map((e) => e.textRun?.content ?? "")
    .join("");

  return { title: data.title, text };
}

export async function testSuggestToDoc(documentId: string) {
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  try {
    const docs = google.docs({ version: "v1", auth: auth as any });
    const body: PreviewBatchUpdateBody = {
      requests: [
        {
          insertText: {
            text: "\nHere's a new comment to be interted at index 3\n...",
            location: { index: 3 },
          },
        },
      ],
      writeControl: { writeMode: "SUGGEST" },
    };
    // send the request
    console.log(`Inserting suggestion into document: ${documentId}...`);
    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: body,
    });
    console.log("Success!");
    const data = response.data as PreviewBatchUpdateResponse;
    return data;
  } catch (error) {
    console.error("Error inserting text", error);
    throw error;
  }
}
