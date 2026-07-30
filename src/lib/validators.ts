import { z } from 'zod';
import type { ValueType } from './types';

const HTML_INPUT_TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const schemas: Record<ValueType, z.ZodTypeAny> = {
  text: z.string().min(1, 'Value is required'),
  number: z
    .string()
    .min(1, 'Value is required')
    .refine((v) => !Number.isNaN(Number(v)) && v.trim() !== '', 'Must be a valid number'),
  url: z.string().url('Must be a valid URL (e.g. https://example.com)'),
  email: z.string().email('Must be a valid email address'),
  uuid: z.string().uuid('Must be a valid UUID'),
  date: z
    .string()
    .min(1, 'Value is required')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Must be a valid date'),
  time: z.string().regex(HTML_INPUT_TIME, 'Must be a valid time (HH:MM)'),
  datetime: z
    .string()
    .min(1, 'Value is required')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Must be a valid date & time'),
  // `other` is intentionally free-form: only require it to be non-empty.
  other: z.string().min(1, 'Value is required'),
};

export interface ValidationResult {
  success: boolean;
  error?: string;
}

export function validateValue(type: ValueType, value: string): ValidationResult {
  const result = schemas[type].safeParse(value);
  if (result.success) return { success: true };
  return { success: false, error: result.error.issues[0]?.message ?? 'Invalid value' };
}

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'Key name is required' };
  if (trimmed.length > 120) return { success: false, error: 'Key name is too long' };
  return { success: true };
}

/** Maps a ValueType to an appropriate HTML input `type` attribute. */
export function inputTypeFor(type: ValueType): string {
  switch (type) {
    case 'url':
      return 'url';
    case 'email':
      return 'email';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'datetime':
      return 'datetime-local';
    // Number is kept as free text per product requirement, and everything
    // else is a plain text input.
    default:
      return 'text';
  }
}
