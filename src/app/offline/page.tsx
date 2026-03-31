import type { Metadata } from 'next';
import { OfflineContent } from './offline-content';

export const metadata: Metadata = {
  title: 'Offline - Demokrat',
};

export default function OfflinePage() {
  return <OfflineContent />;
}
