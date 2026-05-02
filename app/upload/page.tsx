import type { Metadata } from "next";
import { UploadClient } from "./UploadClient";

export const metadata: Metadata = {
  title: "Import Questions — MCQ Manager",
  description: "Upload an exam image or CSV to extract and manage multiple-choice questions.",
};

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <UploadClient />
    </div>
  );
}
