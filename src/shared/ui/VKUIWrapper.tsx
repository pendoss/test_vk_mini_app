import { ReactNode } from 'react';
import { ConfigProvider, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

interface VKUIWrapperProps {
  children: ReactNode;
}

export function VKUIWrapper({ children }: VKUIWrapperProps) {
  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot 
          mode="full"
          safeAreaInsets={{
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }}
        >
          <div className="vkui-safe-area-wrapper">
            {children}
          </div>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}
