import { redirect } from 'next/navigation';

export default function DatenSettingsPage() {
  redirect('/profile/settings?section=daten');
}
