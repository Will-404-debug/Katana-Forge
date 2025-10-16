import { z } from "zod";

export const katanaConfigSchema = z.object({
  handleColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "La couleur du tsuka doit être un code hex valide."),
  bladeTint: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "La couleur de la lame doit être un code hex valide."),
  metalness: z
    .number()
    .min(0, "Metalness minimal 0")
    .max(1, "Metalness maximal 1"),
  roughness: z
    .number()
    .min(0, "Roughness minimal 0")
    .max(1, "Roughness maximal 1"),
});

export type KatanaConfiguration = z.infer<typeof katanaConfigSchema>;

export const defaultKatanaConfig: KatanaConfiguration = {
  handleColor: "#8b1e1e",
  bladeTint: "#d9d2c5",
  metalness: 0.6,
  roughness: 0.35,
};

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe minimal 8 caracteres"),
  name: z.string().min(2, "Nom requis"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const katanaCreateSchema = katanaConfigSchema.extend({
  name: z.string().min(2, "Nom de katana requis"),
});
