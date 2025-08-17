import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import { SimpleApp } from './app/SimpleApp';
import '@/shared/styles/globals.css';

vkBridge.send('VKWebAppInit');

createRoot(document.getElementById('root')!).render(<SimpleApp />);

if (import.meta.env.MODE === 'development') {
  import('./eruda.ts');
}
