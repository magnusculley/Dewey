import { docs_v1 } from "googleapis";

export type WriteMode = "EDIT" | "SUGGEST";

export type PreviewWriteControl = docs_v1.Schema$WriteControl & {
  writeMode?: WriteMode;
};

export type PreviewBatchUpdateBody = Omit<
  docs_v1.Schema$BatchUpdateDocumentRequest,
  "writeControl"
> & {
  writeControl?: PreviewWriteControl;
};

export type PreviewBatchUpdateResponse =
  docs_v1.Schema$BatchUpdateDocumentResponse & {
    commentUpdateState?:
      | "NO_UPDATES_REQUESTED"
      | "ALL_SAVED"
      | "ALL_FAILED_UNKNOWN_REASON";
  };
