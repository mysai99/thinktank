import { redirect } from 'next/navigation';

// Redirect root to app dashboard
// In the future, this could check auth status and redirect to /welcome for unauthenticated users
export default function RootPage() {
  redirect('/dashboard');
}
