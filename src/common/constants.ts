/**
 * Common constants shared between main and renderer processes
 */

export const APP_NAME = 'Notes App';

export const IPC_CHANNELS = {
  GET_NOTES: 'get-notes',
  SAVE_NOTE: 'save-note',
  DELETE_NOTE: 'delete-note',
  GET_CONFIG: 'get-config',
  SAVE_CONFIG: 'save-config'
} as const;