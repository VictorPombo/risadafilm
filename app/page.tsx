import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redireciona a raiz para a tela de login (ou painel de admin)
  redirect('/login');
}
