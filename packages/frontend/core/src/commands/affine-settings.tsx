import type { useI18n } from '@affine/i18n';

import { SettingsIcon } from '@blocksuite/icons/rc';
import { appSettingAtom } from '@toeverything/infra';
import type { createStore } from 'jotai';
import type { useTheme } from 'next-themes';

import type { EditorSettingService } from '../modules/editor-setting';
import { registerAffineCommand } from './registry';

export function registerAffineSettingsCommands({
  t,
  store,
  theme,
  editorSettingService,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  theme: ReturnType<typeof useTheme>;
  editorSettingService: EditorSettingService;
}) {
  const unsubs: Array<() => void> = [];
  const updateSettings = editorSettingService.editorSetting.set.bind(
    editorSettingService.editorSetting
  );
  const settings$ = editorSettingService.editorSetting.settings$;

  // color modes
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-mode-to-auto',
      label: `${t['com.affine.cmdk.affine.color-mode.to']()} ${t[
        'com.affine.themeSettings.system'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'system',
      run() {
        
        theme.setTheme('system');
      },
    })
  );
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-mode-to-dark',
      label: `${t['com.affine.cmdk.affine.color-mode.to']()} ${t[
        'com.affine.themeSettings.dark'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'dark',
      run() {
        
        theme.setTheme('dark');
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-mode-to-light',
      label: `${t['com.affine.cmdk.affine.color-mode.to']()} ${t[
        'com.affine.themeSettings.light'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'light',
      run() {
        

        theme.setTheme('light');
      },
    })
  );

  // Font styles
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-sans',
      label: `${t['com.affine.cmdk.affine.font-style.to']()} ${t[
        'com.affine.appearanceSettings.fontStyle.sans'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Sans',
      run() {
        

        updateSettings('fontFamily', 'Sans');
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-serif',
      label: `${t['com.affine.cmdk.affine.font-style.to']()} ${t[
        'com.affine.appearanceSettings.fontStyle.serif'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Serif',
      run() {
        

        updateSettings('fontFamily', 'Serif');
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-mono',
      label: `${t['com.affine.cmdk.affine.font-style.to']()} ${t[
        'com.affine.appearanceSettings.fontStyle.mono'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Mono',
      run() {
        

        updateSettings('fontFamily', 'Mono');
      },
    })
  );

  // Layout Style
  unsubs.push(
    registerAffineCommand({
      id: `affine:change-client-border-style`,
      label: () => `${t['com.affine.cmdk.affine.client-border-style.to']()} ${t[
        store.get(appSettingAtom).clientBorder
          ? 'com.affine.cmdk.affine.switch-state.off'
          : 'com.affine.cmdk.affine.switch-state.on'
      ]()}
        `,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => BUILD_CONFIG.isElectron,
      run() {
        
        store.set(appSettingAtom, prev => ({
          ...prev,
          clientBorder: !prev.clientBorder,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-full-width-layout`,
      label: () =>
        `${t[
          settings$.value.fullWidthLayout
            ? 'com.affine.cmdk.affine.default-page-width-layout.standard'
            : 'com.affine.cmdk.affine.default-page-width-layout.full-width'
        ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      run() {
        
        updateSettings('fullWidthLayout', !settings$.value.fullWidthLayout);
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-noise-background-on-the-sidebar`,
      label: () =>
        `${t[
          'com.affine.cmdk.affine.noise-background-on-the-sidebar.to'
        ]()} ${t[
          store.get(appSettingAtom).enableNoisyBackground
            ? 'com.affine.cmdk.affine.switch-state.off'
            : 'com.affine.cmdk.affine.switch-state.on'
        ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => BUILD_CONFIG.isElectron,
      run() {
        

        store.set(appSettingAtom, prev => ({
          ...prev,
          enableNoisyBackground: !prev.enableNoisyBackground,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-translucent-ui-on-the-sidebar`,
      label: () =>
        `${t['com.affine.cmdk.affine.translucent-ui-on-the-sidebar.to']()} ${t[
          store.get(appSettingAtom).enableBlurBackground
            ? 'com.affine.cmdk.affine.switch-state.off'
            : 'com.affine.cmdk.affine.switch-state.on'
        ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        BUILD_CONFIG.isElectron && environment.isMacOs,
      run() {
        
        store.set(appSettingAtom, prev => ({
          ...prev,
          enableBlurBackground: !prev.enableBlurBackground,
        }));
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
