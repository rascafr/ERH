export interface IPCIQPayload {
  fileName: string;
  data: number[];
  filteredData: number[];
  binaryLevels: number[];
  size: number;
  visibleSize?: number;
  binSequence: string;
  hexSequence: string;
  avgLevel: number;
  sampleSpeed: number;
  minPulseWidth: number;
  frequency: number;
  fileChanged?: boolean;
}

export enum BackEventName {
  IQ_DATA = 'iq-data',
}

export interface BackEventType {
  eventType: BackEventName;
  payload: any;
}

export enum FrontEventName {
  ZOOM_LEVEL_CHANGED = 'zoom-level-changed',
}

export interface FrontEventType {
  eventType: FrontEventName;
  payload: any;
}
