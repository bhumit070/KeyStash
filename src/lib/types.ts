export type ValueType =
  | 'text'
  | 'number'
  | 'url'
  | 'email'
  | 'uuid'
  | 'date'
  | 'time'
  | 'datetime'
  | 'other';

export interface KeyItem {
  id: string;
  name: string;
  value: string;
  type: ValueType;
  pinned: boolean;
  inContextMenu: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  contextMenuEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  contextMenuEnabled: false,
};

export interface StorageUsage {
  bytesInUse: number;
  quotaBytes: number;
  itemCount: number;
  maxItems: number;
}

export const VALUE_TYPE_LABELS: Record<ValueType, string> = {
  text: 'Text',
  number: 'Number',
  url: 'URL',
  email: 'Email',
  uuid: 'UUID',
  date: 'Date',
  time: 'Time',
  datetime: 'Date & Time',
  other: 'Other',
};

export const VALUE_TYPE_ORDER: ValueType[] = [
  'text',
  'number',
  'url',
  'email',
  'uuid',
  'date',
  'time',
  'datetime',
  'other',
];
