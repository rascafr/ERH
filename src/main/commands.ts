import { dialog, BrowserWindow, app } from 'electron';
import { Singleton } from './coreFileInstance';

export function openRadioFileCommand(context: BrowserWindow) {
  dialog
    .showOpenDialog(context, {
      properties: ['openFile'],
    })
    .then(({ canceled, filePaths }) => {
      const [fileToOpen] = filePaths;
      if (!canceled) {
        Singleton.getInstance().setCurrentFile(fileToOpen);
      }
      return true;
    })
    .catch((reason) => {
      console.error(reason);
    });
}

export function appQuit() {
  app.quit();
}
