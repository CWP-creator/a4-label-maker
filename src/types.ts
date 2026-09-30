export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface LabelData {
  id: string;
  companyName: string;
  addressAndPan: string;
  productName: string;
  price: string;
  origin: string;
  email: string;
  barcodeValue?: string;
  batchOrSize?: string;
  customFields?: CustomField[];
}

export interface GridConfig {
  rows: number;
  columns: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapHorizontalMm: number;
  gapVerticalMm: number;
  paddingMm: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor: string;
  borderRadiusMm: number;
  textAlign: 'left' | 'center';
  fontSizeScale: 'xs' | 'sm' | 'md' | 'lg';
  showBarcode: boolean;
  barcodeType: 'CODE128' | 'EAN13';
  showCutMarks: boolean;
}

export type FillMode = 'repeat-single' | 'batch-list';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

export interface DriveUser {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}
