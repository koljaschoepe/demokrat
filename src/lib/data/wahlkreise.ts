import { createClient } from '@/lib/supabase/client';

export interface Wahlkreis {
  id: number;
  name: string;
  bundesland: string;
}

export async function searchWahlkreise(query: string): Promise<Wahlkreis[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('wahlkreise')
    .select('id, name, bundesland')
    .ilike('name', `%${query}%`)
    .order('id')
    .limit(20);
  return (data as Wahlkreis[] | null) ?? [];
}

export async function getWahlkreis(id: number): Promise<Wahlkreis | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('wahlkreise')
    .select('id, name, bundesland')
    .eq('id', id)
    .single();
  return (data as Wahlkreis | null) ?? null;
}

export const BUNDESLAENDER = [
  'Schleswig-Holstein',
  'Mecklenburg-Vorpommern',
  'Hamburg',
  'Niedersachsen',
  'Bremen',
  'Brandenburg',
  'Sachsen-Anhalt',
  'Berlin',
  'Nordrhein-Westfalen',
  'Sachsen',
  'Thueringen',
  'Hessen',
  'Rheinland-Pfalz',
  'Bayern',
  'Saarland',
  'Baden-Wuerttemberg',
] as const;
