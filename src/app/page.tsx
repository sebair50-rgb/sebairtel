import { AppContextProvider } from '@/store/AppContext';
import AppShell from '@/components/layout/AppShell';

export default function Home() {
  return (
    <AppContextProvider>
      <AppShell />
    </AppContextProvider>
  );
}
