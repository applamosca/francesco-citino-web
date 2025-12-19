import { z } from 'zod';

// Validation limits
export const FORM_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 255 },
  phone: { max: 20 },
  message: { min: 10, max: 2000 },
  notes: { max: 1000 },
  address: { max: 500 },
} as const;

// Contact form schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(FORM_LIMITS.name.min, { message: `Il nome deve avere almeno ${FORM_LIMITS.name.min} caratteri` })
    .max(FORM_LIMITS.name.max, { message: `Il nome non può superare ${FORM_LIMITS.name.max} caratteri` }),
  email: z
    .string()
    .trim()
    .email({ message: 'Inserisci un indirizzo email valido' })
    .max(FORM_LIMITS.email.max, { message: `L'email non può superare ${FORM_LIMITS.email.max} caratteri` }),
  message: z
    .string()
    .trim()
    .min(FORM_LIMITS.message.min, { message: `Il messaggio deve avere almeno ${FORM_LIMITS.message.min} caratteri` })
    .max(FORM_LIMITS.message.max, { message: `Il messaggio non può superare ${FORM_LIMITS.message.max} caratteri` }),
});

// Booking form schema
export const bookingFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(FORM_LIMITS.name.min, { message: `Il nome deve avere almeno ${FORM_LIMITS.name.min} caratteri` })
    .max(FORM_LIMITS.name.max, { message: `Il nome non può superare ${FORM_LIMITS.name.max} caratteri` }),
  email: z
    .string()
    .trim()
    .email({ message: 'Inserisci un indirizzo email valido' })
    .max(FORM_LIMITS.email.max, { message: `L'email non può superare ${FORM_LIMITS.email.max} caratteri` }),
  phone: z
    .string()
    .trim()
    .max(FORM_LIMITS.phone.max, { message: `Il telefono non può superare ${FORM_LIMITS.phone.max} caratteri` })
    .regex(/^[+\d\s\-()]*$/, { message: 'Formato telefono non valido' })
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .max(FORM_LIMITS.notes.max, { message: `Le note non possono superare ${FORM_LIMITS.notes.max} caratteri` })
    .optional()
    .or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Sanitize text to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};
