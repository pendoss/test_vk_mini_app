import { ReactNode } from 'react';
import { StoreProvider } from './store';

interface ProvidersProps {
  children: ReactNode;
}

// Провайдеры для MobX context, темы, и т.д.
export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}
