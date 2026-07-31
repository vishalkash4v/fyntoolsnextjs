import { redirect } from 'next/navigation';

/** Bare /fyntoolsadmin → login (Vite had no index either; avoid soft-404). */
export default function AdminIndexPage() {
  redirect('/fyntoolsadmin/login');
}
