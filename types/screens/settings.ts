import { z } from 'zod';

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, 'Ingresa tu nombre completo'),
  preferredName: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  phone: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  timeZone: z
    .string()
    .min(2, 'Ingresa un huso horario válido (ej: America/Argentina/Buenos_Aires)'),
  locale: z
    .string()
    .min(2, 'Ingresa un código de idioma válido (ej: es-AR)'),
  bio: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  cuil: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.replace(/[^0-9]/g, '') ?? '';
      return trimmed.length > 0 ? trimmed : undefined;
    }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const companyFormSchema = z.object({
  companyCode: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= 4, 'La clave debe tener al menos 4 caracteres'),
  companyName: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  countryCode: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim().toUpperCase() : undefined)),
  defaultTimeZone: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  industry: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  billingEmail: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : undefined;
    }),
  description: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
