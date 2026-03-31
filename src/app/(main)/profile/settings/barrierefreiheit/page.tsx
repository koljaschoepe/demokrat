import { redirect } from 'next/navigation';

export default function BarrierefreiheitSettingsPage() {
  redirect('/profile/settings?section=barrierefreiheit');
}
