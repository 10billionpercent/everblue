import type { CreatePaintingInput, PaintingStatus } from "@/types";

const VALID_STATUS: PaintingStatus[] = [
  "IDEA",
  "SKETCH",
  "LINEART",
  "PAINTING",
  "DONE",
];

export function validatePainting(input: CreatePaintingInput) {
  if (!input.title.trim()) {
    throw new Error("Title is required.");
  }

  if (input.characters.length === 0) {
    throw new Error("At least one character is required.");
  }

  for (const character of input.description.characters) {
    if (!character.name.trim()) {
      throw new Error("Character name is required.");
    }

    if (!character.outfit.trim()) {
      throw new Error(`Outfit required for ${character.name}`);
    }

    if (!character.hairstyle.trim()) {
      throw new Error(`Hairstyle required for ${character.name}`);
    }

    if (input.pinterestBoard && !input.pinterestBoard.startsWith("https://")) {
      throw new Error("Pinterest board must be a valid URL.");
    }
  }

  if (input.type === "COLLAB" && !input.hostInstagram?.trim()) {
    throw new Error("Host Instagram username required for collabs.");
  }
}

export function validateStatus(status: PaintingStatus) {
  if (!VALID_STATUS.includes(status)) {
    throw new Error("Invalid painting status.");
  }
}
