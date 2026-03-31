import { redirect } from 'next/navigation';

export default function DatenschutzSettingsPage() {
  redirect('/profile/settings?section=datenschutz');
}
