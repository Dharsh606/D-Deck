import { contextBridge, ipcRenderer } from 'electron';
import type { DeckData, ViewMode } from '../src/types';

contextBridge.exposeInMainWorld('electronAPI', {
  getDeckData: () => ipcRenderer.invoke('deck:get-data'),
  saveDeckData: (data: DeckData) => ipcRenderer.invoke('deck:save-data', data),
  setWindowMode: (mode: ViewMode) => ipcRenderer.invoke('window:set-mode', mode),
  getWindowMode: () => ipcRenderer.invoke('window:get-mode'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('window:set-always-on-top', flag),
  setStartupOnBoot: (flag: boolean) => ipcRenderer.invoke('app:set-startup', flag),
  showNotification: (title: string, body: string, options?: { silent?: boolean }) => 
    ipcRenderer.invoke('app:notify', title, body, options),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
  savePosition: (mode: ViewMode, x: number, y: number) => ipcRenderer.invoke('window:save-position', mode, x, y),
});
