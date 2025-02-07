import { z } from 'zod';

export const rejectionSchema = z.object({
    reason: z.string().max(250, 'cannot exceed 250 characters')
});

// You can add more schemas here as needed
export const genericTextSchema = (fieldName: string, maxLength: number) => {
    return z.object({
        [fieldName]: z.string().max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    });
};