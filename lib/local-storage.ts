import fs from "fs/promises";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Saves an uploaded File to the OS temp directory.
 * Returns the absolute path to the saved file.
 */
export async function saveTempImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const fileName = `mcq-${uuidv4()}${ext}`;
  const filePath = path.join(os.tmpdir(), fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Reads an image file and returns it as a base64 data URI.
 * Used to embed the image in a multimodal Ollama message.
 */
export async function imageToBase64DataUri(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

/**
 * Deletes a temp file. Silently ignores errors (file may already be gone).
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore — file may not exist
  }
}
