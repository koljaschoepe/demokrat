import { redirect } from 'next/navigation';

export default function BenachrichtigungenSettingsPage() {
  redirect('/profile/settings?section=benachrichtigungen');
}
