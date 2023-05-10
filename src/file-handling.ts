import { TFile } from "obsidian";
import { OUTPUT_FILENAME } from "./constants";

/**
 * Retrieves the note file with the specified path or creates a new one if it
 * doesn't exist.
 *
 * @returns A `Promise` that resolves to a `TFile` representing the note file.
 */
export async function getNoteFile(): Promise<TFile> {
  // Access the vault from the window object
  const { vault } = window.app;

  // Get the note file by its path
  const note = vault.getAbstractFileByPath(OUTPUT_FILENAME);

  // If the note file exists, return it; otherwise, create a new note file
  if (note instanceof TFile) {
    return note;
  } else {
    // Create a new note file with the specified name and empty content
    return await vault.create(OUTPUT_FILENAME, "");
  }
}
