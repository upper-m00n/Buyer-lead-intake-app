import { z } from 'zod';
import { CITIES, PROPERTY_TYPES, BHK_OPTIONS, PURPOSES, TIMELINES, SOURCES, STATUSES } from './types';

export const BuyerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' })
      .max(80, { message: 'Full name cannot exceed 80 characters.' }),

    email: z
      .string()
      .email({ message: 'Please enter a valid email address.' })
      .optional()
      .or(z.literal('')),

    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits.' })
      .max(15, { message: 'Phone number cannot exceed 15 digits.' })
      .regex(/^\d+$/, { message: 'Phone number must only contain digits.' }),

    city: z.enum(CITIES, { message: 'Please select a valid city.' }),

    propertyType: z.enum(PROPERTY_TYPES, { message: 'Please select a valid property type.' }),

    bhk: z.enum(BHK_OPTIONS).optional(),

    purpose: z.enum(PURPOSES, { message: 'Please select a valid purpose.' }),

    budgetMin: z.coerce
      .number({ message: 'Budget must be a number.' })
      .positive({ message: 'Budget must be positive.' })
      .optional(),
      
    budgetMax: z.coerce
      .number({ message: 'Budget must be a number.' })
      .positive({ message: 'Budget must be positive.' })
      .optional(),

    timeline: z.enum(TIMELINES, { message: 'Please select a valid timeline.' }),

    source: z.enum(SOURCES, { message: 'Please select a valid source.' }),
    
    status: z.enum(STATUSES).optional(),

    notes: z
      .string()
      .max(1000, { message: 'Notes cannot exceed 1000 characters.' })
      .optional(),

    tags: z.array(z.string()).optional(),
    
    updatedAt: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    {
      message: 'Maximum budget must be greater than or equal to minimum budget.',
      path: ['budgetMax'],
    }
  )
  .refine(
    (data) => {
      if (['Apartment', 'Villa'].includes(data.propertyType)) {
        return !!data.bhk;
      }
      return true;
    },
    {
      message: 'BHK is required for Apartments and Villas.',
      path: ['bhk'],
    }
  );

export type BuyerFormData = z.infer<typeof BuyerSchema>;