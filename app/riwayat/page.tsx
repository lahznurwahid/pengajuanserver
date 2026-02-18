import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect legacy /riwayat path to the pemohon riwayat page
  redirect('/pemohon/riwayat');
}
