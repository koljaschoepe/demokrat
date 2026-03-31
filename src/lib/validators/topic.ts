import { z } from 'zod/v4';

export const createTopicSchema = z.object({
  title: z
    .string()
    .min(10, 'Titel muss mindestens 10 Zeichen lang sein')
    .max(200),
  description: z
    .string()
    .min(50, 'Beschreibung muss mindestens 50 Zeichen lang sein')
    .max(5000),
  category: z.string().min(1, 'Bitte wähle eine Kategorie'),
  tags: z.array(z.string()).min(1, 'Mindestens ein Tag').max(5),
  voting_format: z.enum(['yes_no', 'multiple_choice']),
  voting_options: z.array(z.string().min(1)).optional(),
  max_choices: z.number().int().min(1).max(10).optional(),
  duration_days: z.number().int().min(1).max(30),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
