import { useEffect } from 'react';

import Header from '@/components/header';
import UiExample from '@/components/ui-example';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <main className="space-y-16 p-8">
      <Header />
      <UiExample />
    </main>
  );
}
