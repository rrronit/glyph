import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('glyphAPI', {
  ping: () => ipcRenderer.invoke('glyph:ping'),
  // Library
  scanLibrary: (dir: string) => ipcRenderer.invoke('library:scan', dir),
  getLibrary: () => ipcRenderer.invoke('library:getAll'),
  // Reader
  openBook: (path: string) => ipcRenderer.invoke('reader:open', path),
  readFile: (path: string) => ipcRenderer.invoke('reader:readFile', path),
  getPageText: (bookId: string, page: number) =>
    ipcRenderer.invoke('reader:getPageText', bookId, page),
  // Search
  search: (params: { bookId: string; query: string }) => ipcRenderer.invoke('search:query', params),
  // Bookmarks
  addBookmark: (bookId: string, page: number, label?: string) =>
    ipcRenderer.invoke('bookmark:add', bookId, page, label),
  getBookmarks: (bookId: string) => ipcRenderer.invoke('bookmark:get', bookId),
  removeBookmark: (id: string) => ipcRenderer.invoke('bookmark:remove', id),
  // Progress
  saveProgress: (bookId: string, page: number, totalPages: number) =>
    ipcRenderer.invoke('progress:save', bookId, page, totalPages),
  getProgress: (bookId: string) => ipcRenderer.invoke('progress:get', bookId),
  getRecentBooks: () => ipcRenderer.invoke('progress:getRecent'),
  // Dialog
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  addFiles: (paths: string[]) => ipcRenderer.invoke('library:addFiles', paths),
});
