import { redirect } from 'next/navigation';

export default function InteressenSettingsPage() {
  redirect('/profile/settings?section=interessen');
}
