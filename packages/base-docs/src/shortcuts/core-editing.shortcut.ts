import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { FOCUSING_DOC } from '@univerjs/core';

import { BreakLineCommand, DeleteLeftCommand } from '../commands/commands/core-editing.command';

export const BreakLineShortcut: IShortcutItem = {
    id: BreakLineCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    binding: KeyCode.ENTER,
};

export const DeleteLeftShortcut: IShortcutItem = {
    id: DeleteLeftCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    binding: KeyCode.BACKSPACE,
};
