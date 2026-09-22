import type { useI18n } from '@affine/i18n';

import type { DocMode } from '@blocksuite/affine/model';
import { ImportIcon, PlusIcon } from '@blocksuite/icons/rc';

import type { usePageHelper } from '../blocksuite/block-suite-page-list/utils';
import type { GlobalDialogService } from '../modules/dialogs';
import { registerAffineCommand } from './registry';

export function registerAffineCreationCommands({
  pageHelper,
  t,
  globalDialogService,
}: {
  t: ReturnType<typeof useI18n>;
  pageHelper: ReturnType<typeof usePageHelper>;
  globalDialogService: GlobalDialogService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerAffineCommand({
      id: 'affine:new-page',
      category: 'affine:creation',
      label: t['com.affine.cmdk.affine.new-page'](),
      icon: <PlusIcon />,
      keyBinding: BUILD_CONFIG.isElectron
        ? {
            binding: '$mod+N',
            skipRegister: true,
          }
        : undefined,
      run() {
        

        pageHelper.createPage('page' as DocMode);
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:new-edgeless-page',
      category: 'affine:creation',
      icon: <PlusIcon />,
      label: t['com.affine.cmdk.affine.new-edgeless-page'](),
      run() {
        

        pageHelper.createEdgeless();
      },
    })
  );

  if (!BUILD_CONFIG.isMobileEdition) {
    unsubs.push(
      registerAffineCommand({
        id: 'affine:new-workspace',
        category: 'affine:creation',
        icon: <PlusIcon />,
        label: t['com.affine.cmdk.affine.new-workspace'](),
        run() {
          

          globalDialogService.open('create-workspace', {});
        },
      })
    );
  }
  unsubs.push(
    registerAffineCommand({
      id: 'affine:import-workspace',
      category: 'affine:creation',
      icon: <ImportIcon />,
      label: t['com.affine.cmdk.affine.import-workspace'](),
      preconditionStrategy: () => {
        return BUILD_CONFIG.isElectron;
      },
      run() {
        

        globalDialogService.open('import-workspace', undefined);
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
