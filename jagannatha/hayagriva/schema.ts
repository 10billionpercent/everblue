import type {
  PaintingStatus,
  PaintingType,
  PaintingDescription,
} from "@/types";

export const PAINTING_STATUS: PaintingStatus[] = [
  "IDEA",
  "SKETCH",
  "LINEART",
  "PAINTING",
  "DONE",
];

export const PAINTING_TYPES: PaintingType[] = [
  "FOR_ME",
  "COLLAB",
];

export const EMPTY_DESCRIPTION: PaintingDescription = {
  mainDetails: {},

  characters: [],

  otherDetails: {
    props: [],
    notes: "",
  },
};