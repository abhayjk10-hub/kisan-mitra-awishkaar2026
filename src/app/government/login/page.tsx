import { redirect } from 'next/navigation';

export default function GovernmentLoginPage() {
  redirect('/login?role=government');
}

