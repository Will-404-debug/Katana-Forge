import { z } from "zod";

export const DEFAULT_BACKGROUND_COLOR = "#040405";

export const backgroundColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "La couleur doit etre un hex valide.")
  .transform((value) => value.toLowerCase());
