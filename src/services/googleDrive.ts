import { GoogleDriveFile, LabelData, GridConfig } from '../types';

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export async function listDriveSheets(accessToken: string, searchTerm?: string): Promise<GoogleDriveFile[]> {
  let query = "trashed = false and mimeType = 'application/vnd.google-apps.spreadsheet'";
  if (searchTerm && searchTerm.trim()) {
    const escaped = searchTerm.replace(/'/g, "\\'");
    query += ` and name contains '${escaped}'`;
  }

  const params = new URLSearchParams({
    q: query,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '25',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Drive files (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

export interface ParsedSheetResult {
  sheetName: string;
  isSetupForm: boolean;
  labelData: LabelData;
  gridConfig?: Partial<GridConfig>;
  batchItems?: LabelData[];
}

export async function fetchSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<ParsedSheetResult> {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!metaRes.ok) {
    const errorData = await metaRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to read Google Sheet (${metaRes.status})`);
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  if (sheets.length === 0) {
    throw new Error('No sheets found in this Google Spreadsheet');
  }

  const primarySheet = sheets[0].properties.title;
  const range = encodeURIComponent(`${primarySheet}!A1:Z100`);

  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!valuesRes.ok) {
    const err = await valuesRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read sheet cells (${valuesRes.status})`);
  }

  const valuesData = await valuesRes.json();
  const rows: string[][] = valuesData.values || [];

  return parseSheetRows(rows, primarySheet);
}

export function parseSheetRows(rows: string[][], sheetName = 'Sheet1'): ParsedSheetResult {
  const parsedData: LabelData = {
    id: `label-${Date.now()}`,
    companyName: 'Shivapuri Fabric\nProduct pvt ltd',
    addressAndPan: 'Tokha-4, PAN no-60960145',
    productName: 'Pillow 17x27 Swan',
    price: 'MRP NRs 682.00',
    origin: 'Made in nepal',
    email: 'contact.shivapurifabric@gmail.com',
    barcodeValue: '60960145-SWAN',
    customFields: [],
  };

  const gridConfig: Partial<GridConfig> = {};
  let isSetupForm = false;
  const batchItems: LabelData[] = [];

  // Check if this is the "LABEL SETUP FORM" layout
  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const firstCell = (row[0] || '').trim().toLowerCase();
    const secondCell = (row[1] || '').trim();

    if (firstCell.includes('label setup form')) {
      isSetupForm = true;
    }

    if (firstCell.includes('company name')) {
      isSetupForm = true;
      parsedData.companyName = secondCell || parsedData.companyName;
    } else if (firstCell.includes('address') || firstCell.includes('pan')) {
      parsedData.addressAndPan = secondCell || parsedData.addressAndPan;
    } else if (firstCell.includes('product name')) {
      parsedData.productName = secondCell || parsedData.productName;
      if (!parsedData.barcodeValue) {
        parsedData.barcodeValue = secondCell.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
      }
    } else if (firstCell.includes('price') || firstCell.includes('mrp')) {
      parsedData.price = secondCell || parsedData.price;
    } else if (firstCell.includes('origin') || firstCell.includes('made in')) {
      parsedData.origin = secondCell || parsedData.origin;
    } else if (firstCell.includes('email')) {
      parsedData.email = secondCell || parsedData.email;
    } else if (secondCell) {
      parsedData.customFields = [
        ...(parsedData.customFields || []),
        { id: `custom-${parsedData.customFields?.length || 0}`, label: row[0] || 'Additional', value: secondCell },
      ];
    } else if (firstCell.includes('number of rows') || firstCell === 'rows:' || firstCell === 'rows') {
      const parsedRows = parseInt(secondCell, 10);
      if (!isNaN(parsedRows) && parsedRows > 0 && parsedRows <= 20) {
        gridConfig.rows = parsedRows;
      }
    } else if (firstCell.includes('number of columns') || firstCell === 'columns:' || firstCell === 'columns') {
      const parsedCols = parseInt(secondCell, 10);
      if (!isNaN(parsedCols) && parsedCols > 0 && parsedCols <= 10) {
        gridConfig.columns = parsedCols;
      }
    }
  }

  // If not a key-value setup form, check if it's a tabular sheet with headers
  if (!isSetupForm && rows.length > 1) {
    const headers = rows[0].map((h) => (h || '').trim().toLowerCase());
    const companyIdx = headers.findIndex((h) => h.includes('company'));
    const addressIdx = headers.findIndex((h) => h.includes('address') || h.includes('pan'));
    const productIdx = headers.findIndex((h) => h.includes('product') || h.includes('item') || h.includes('name'));
    const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('mrp') || h.includes('rate'));
    const originIdx = headers.findIndex((h) => h.includes('origin') || h.includes('made'));
    const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('contact'));
    const barcodeIdx = headers.findIndex((h) => h.includes('barcode') || h.includes('sku') || h.includes('code'));
    const standardIndexes = new Set([companyIdx, addressIdx, productIdx, priceIdx, originIdx, emailIdx, barcodeIdx]);

    if (productIdx !== -1 || priceIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0 || !r.some((c) => (c || '').trim().length > 0)) continue;

        const prod = (productIdx !== -1 ? r[productIdx] : '') || `Product ${i}`;
        const prc = (priceIdx !== -1 ? r[priceIdx] : '') || 'MRP NRs 500';
        const comp = (companyIdx !== -1 ? r[companyIdx] : '') || parsedData.companyName;
        const addr = (addressIdx !== -1 ? r[addressIdx] : '') || parsedData.addressAndPan;
        const orig = (originIdx !== -1 ? r[originIdx] : '') || parsedData.origin;
        const eml = (emailIdx !== -1 ? r[emailIdx] : '') || parsedData.email;
        const bar = (barcodeIdx !== -1 ? r[barcodeIdx] : '') || `${prod.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}-${i}`;
        const customFields = headers
          .map((header, index) => ({ header, index }))
          .filter(({ header, index }) => header && !standardIndexes.has(index) && (r[index] || '').trim())
          .map(({ header, index }) => ({ id: `custom-${index}`, label: rows[0][index] || header, value: r[index] || '' }));

        batchItems.push({
          id: `item-${i}-${Date.now()}`,
          companyName: comp,
          addressAndPan: addr,
          productName: prod,
          price: prc,
          origin: orig,
          email: eml,
          barcodeValue: bar,
          customFields,
        });
      }

      if (batchItems.length > 0) {
        return {
          sheetName,
          isSetupForm: false,
          labelData: batchItems[0],
          gridConfig,
          batchItems,
        };
      }
    }
  }

  return {
    sheetName,
    isSetupForm,
    labelData: parsedData,
    gridConfig,
    batchItems: batchItems.length > 0 ? batchItems : undefined,
  };
}

export async function saveHtmlToDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType = 'text/html'
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata = {
    name: fileName,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to save file to Google Drive (${res.status})`);
  }

  return await res.json();
}
