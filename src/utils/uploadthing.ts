"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

// O "type" aqui é fundamental para não vazar código de servidor
import type { OurFileRouter } from "~/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// Este é o hook que vais usar no "handleSave"
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();