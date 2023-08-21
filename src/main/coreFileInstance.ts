/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { ipcMain } from 'electron';
import { openFile, decimate } from './core';
import { IPCIQPayload } from './types';

class CoreFileInstance {
  private filePath: string | null = null;

  private fileData: IPCIQPayload | null = null;

  private screenWidth = 2000;

  decimateN(values?: number[]) {
    if (!values) return [];
    if (values.length < this.screenWidth) return values;
    return decimate(values, Math.ceil(values.length / this.screenWidth));
  }

  decimateNzoom(zoom: number, values?: number[]) {
    if (!values) return [];
    if (values.length < this.screenWidth) return values;
    return decimate(values, Math.ceil(values.length / zoom));
  }

  setCurrentFile(filePath: string | null) {
    if (filePath) {
      this.filePath = filePath;
      this.fileData = openFile(this.filePath);
      this.notifyZoomLevelChanged(true);
    }
  }

  private getDecimatedData(zoomFrom?: number, zoomTo?: number) {
    const { data, filteredData, binaryLevels } = this.fileData || {
      data: [],
      filteredData: [],
      binaryLevels: [],
    };
    const valZoomFrom =
      zoomFrom === undefined || Number.isNaN(zoomFrom) ? 0 : zoomFrom;
    const valZoomTo =
      zoomTo === undefined || Number.isNaN(zoomTo) ? data.length : zoomTo;

    const slicedData = this.decimateN(data.slice(valZoomFrom, valZoomTo));

    return {
      ...this.fileData,
      visibleSize: slicedData.length,
      data: slicedData,
      filteredData: this.decimateN(filteredData.slice(valZoomFrom, valZoomTo)),
      binaryLevels: this.decimateN(binaryLevels.slice(valZoomFrom, valZoomTo)),
    };
  }

  private notifyZoomLevelChanged(
    resetZoom: boolean,
    userMin?: number,
    userMax?: number
  ) {
    // split according to zoom, perform decimation if needed
    ipcMain.emit('back-events', {
      eventType: 'iq-data',
      payload: {
        fileChanged: resetZoom,
        ...this.fileData,
        ...this.getDecimatedData(userMin, userMax),
      },
    });
  }

  handleNotifyZoomLevelChanged({
    userMin,
    userMax,
  }: {
    userMin?: number;
    userMax?: number;
  }) {
    this.notifyZoomLevelChanged(false, userMin, userMax);
  }
}

export class Singleton {
  private static instance: CoreFileInstance | null = null;

  constructor() {
    throw new Error('Use Singleton.getInstance()');
  }

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new CoreFileInstance();
    }
    return Singleton.instance;
  }
}
