import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { LabelSetupForm } from './components/LabelSetupForm';
import { A4SheetPreview } from './components/A4SheetPreview';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { CsvPasteModal } from './components/CsvPasteModal';
import { BatchDataEditor } from './components/BatchDataEditor';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { LabelData, GridConfig, FillMode } from './types';
import { initAuth, getAccessToken } from './services/firebase';
import { saveHtmlToDrive, ParsedSheetResult } from './services/googleDrive';
import { printA4Element } from './services/printService';
import { CheckCircle2, AlertCircle, FileSpreadsheet, HardDrive, Printer } from 'lucide-react';

const INITIAL_LABEL_DATA: LabelData = {
  id: 'shivapuri-fabric-default',
  companyName: 'Shivapuri Fabric\nProduct pvt ltd',
  addressAndPan: 'Tokha-4, PAN no-60960145',
  productName: 'Pillow 17x27 Swan',
  price: 'MRP NRs 682.00',
  origin: 'Made in nepal',
  email: 'contact.shivapurifabric@gmail.com',
  barcodeValue: '60960145-SWAN',
  customFields: [],
};

const INITIAL_GRID_CONFIG: GridConfig = {
  rows: 8,
  columns: 5,
  marginTopMm: 8,
  marginBottomMm: 8,
  marginLeftMm: 8,
  marginRightMm: 8,
  gapHorizontalMm: 2,
  gapVerticalMm: 2,
  paddingMm: 2,
  borderStyle: 'dashed',
  borderColor: '#d4d4d4',
  borderRadiusMm: 1,
  textAlign: 'center',
  fontSizeScale: 'sm',
  showBarcode: true,
  barcodeType: 'CODE128',
  showCutMarks: true,
};

const INITIAL_BATCH_ITEMS: LabelData[] = [
  {
    id: 'b1',
    companyName: 'Shivapuri Fabric\nProduct pvt ltd',
    addressAndPan: 'Tokha-4, PAN no-60960145',
    productName: 'Pillow 17x27 Swan',
    price: 'MRP NRs 682.00',
    origin: 'Made in nepal',
    email: 'contact.shivapurifabric@gmail.com',
    barcodeValue: '60960145-SWAN',
  },
  {
    id: 'b2',
    companyName: 'Shivapuri Fabric\nProduct pvt ltd',
    addressAndPan: 'Tokha-4, PAN no-60960145',
    productName: 'Pillow 16x24 Standard',
    price: 'MRP NRs 540.00',
    origin: 'Made in nepal',
    email: 'contact.shivapurifabric@gmail.com',
    barcodeValue: '60960145-STD',
  },
  {
    id: 'b3',
    companyName: 'Shivapuri Fabric\nProduct pvt ltd',
    addressAndPan: 'Tokha-4, PAN no-60960145',
    productName: 'Cushion 16x16 Square',
    price: 'MRP NRs 420.00',
    origin: 'Made in nepal',
    email: 'contact.shivapurifabric@gmail.com',
    barcodeValue: '60960145-CSH',
  },
  {
    id: 'b4',
    companyName: 'Shivapuri Fabric\nProduct pvt ltd',
    addressAndPan: 'Tokha-4, PAN no-60960145',
    productName: 'Double Bed Sheet Cotton',
    price: 'MRP NRs 1,450.00',
    origin: 'Made in nepal',
    email: 'contact.shivapurifabric@gmail.com',
    barcodeValue: '60960145-DBS',
  },
  {
    id: 'b5',
    companyName: 'Shivapuri Fabric\nProduct pvt ltd',
    addressAndPan: 'Tokha-4, PAN no-60960145',
    productName: 'Mattress Protector King',
    price: 'MRP NRs 2,100.00',
    origin: 'Made in nepal',
    email: 'contact.shivapurifabric@gmail.com',
    barcodeValue: '60960145-MPK',
  },
];

export default function App() {
  const [labelData, setLabelData] = useState<LabelData>(INITIAL_LABEL_DATA);
  const [gridConfig, setGridConfig] = useState<GridConfig>(INITIAL_GRID_CONFIG);
  const [fillMode, setFillMode] = useState<FillMode>('repeat-single');
  const [batchItems, setBatchItems] = useState<LabelData[]>(INITIAL_BATCH_ITEMS);
  const [zoom, setZoom] = useState<number>(0.75);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [driveModalOpen, setDriveModalOpen] = useState<boolean>(false);
  const [csvPasteModalOpen, setCsvPasteModalOpen] = useState<boolean>(false);
  const [batchEditorOpen, setBatchEditorOpen] = useState<boolean>(false);
  const [confirmDriveSaveOpen, setConfirmDriveSaveOpen] = useState<boolean>(false);

  const [savingToDrive, setSavingToDrive] = useState<boolean>(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleUpdateLabelData = (updated: Partial<LabelData>) => {
    setLabelData((prev) => ({ ...prev, ...updated }));
    if (updated.customFields) {
      setBatchItems((items) =>
        items.map((item) => ({
          ...item,
          customFields: updated.customFields!.map((field) => ({
            ...field,
            value: item.customFields?.find((currentField) => currentField.id === field.id)?.value || field.value,
          })),
        }))
      );
    }
  };

  const handleUpdateGridConfig = (updated: Partial<GridConfig>) => {
    setGridConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleImportSheetResult = (result: ParsedSheetResult) => {
    setLabelData(result.labelData);
    if (result.gridConfig) {
      setGridConfig((prev) => ({ ...prev, ...result.gridConfig }));
    }
    if (result.batchItems && result.batchItems.length > 0) {
      setBatchItems(result.batchItems);
      setFillMode('batch-list');
      showToast(`Loaded ${result.batchItems.length} products in batch mode!`, 'success');
    } else {
      setFillMode('repeat-single');
      showToast(`Imported setup form for "${result.labelData.productName}"`, 'success');
    }
  };

  const handlePrint = () => {
    showToast('Opening print dialog for A4 sheet...', 'success');
    printA4Element('print-sheet-a4', {
      sheetTitle: `A4 Labels - ${labelData.productName}`,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [labelData.productName, gridConfig, fillMode, batchItems]);

  const handleInitiateSaveToDrive = () => {
    if (!currentUser) {
      setDriveModalOpen(true);
      return;
    }
    setConfirmDriveSaveOpen(true);
  };

  const handleConfirmSaveToDrive = async () => {
    setConfirmDriveSaveOpen(false);
    setSavingToDrive(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google to save to Drive.');
      }

      // Generate a standalone HTML document for the A4 sheet
      const cleanProductName = labelData.productName.replace(/[^a-zA-Z0-9]/g, '_') || 'labels';
      const fileName = `A4_Labels_${cleanProductName}_${Date.now()}.html`;
      const customFieldsHtml = (labelData.customFields || [])
        .filter((field) => field.label.trim() || field.value.trim())
        .map((field) => `<div class="custom"><strong>${field.label}</strong>: ${field.value}</div>`)
        .join('');

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>A4 Label Sheet - ${labelData.productName}</title>
<style>
@page { size: A4 portrait; margin: 0; }
body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
.sheet {
  width: 210mm;
  height: 297mm;
  display: grid;
  grid-template-rows: repeat(${gridConfig.rows}, minmax(0, 1fr));
  grid-template-columns: repeat(${gridConfig.columns}, minmax(0, 1fr));
  padding: ${gridConfig.marginTopMm}mm ${gridConfig.marginRightMm}mm ${gridConfig.marginBottomMm}mm ${gridConfig.marginLeftMm}mm;
  gap: ${gridConfig.gapVerticalMm}mm ${gridConfig.gapHorizontalMm}mm;
  box-sizing: border-box;
}
.label {
  border: 1px ${gridConfig.borderStyle} ${gridConfig.showCutMarks ? '#ccc' : 'transparent'};
  border-radius: ${gridConfig.borderRadiusMm}mm;
  padding: ${gridConfig.paddingMm}mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: ${gridConfig.textAlign};
  box-sizing: border-box;
}
.company { font-size: 8.5px; font-weight: 800; text-transform: uppercase; }
.address { font-size: 6.5px; color: #555; }
.product { font-size: 10px; font-weight: 900; margin: 2px 0; }
.price { font-size: 8.5px; font-weight: 700; background: #eee; display: inline-block; padding: 1px 4px; border-radius: 2px; }
.origin { font-size: 6px; color: #666; font-weight: 600; text-transform: uppercase; }
.email { font-size: 5.5px; color: #777; }
.custom { font-size: 5.5px; color: #555; line-height: 1.1; }
.custom strong { text-transform: uppercase; color: #333; }
</style>
</head>
<body>
<div class="sheet">
${Array.from({ length: gridConfig.rows * gridConfig.columns })
  .map(
    () => `
  <div class="label">
    <div>
      <div class="company">${labelData.companyName.replace(/\n/g, '<br>')}</div>
      <div class="address">${labelData.addressAndPan}</div>
    </div>
    <div>
      <div class="product">${labelData.productName}</div>
      <div class="price">${labelData.price}</div>
      ${customFieldsHtml}
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 2px;">
      <span class="origin">${labelData.origin}</span>
      <span class="email">${labelData.email}</span>
    </div>
  </div>`
  )
  .join('')}
</div>
</body>
</html>`;

      const result = await saveHtmlToDrive(token, fileName, htmlContent);
      setDriveSaveSuccess(true);
      showToast(`Saved "${result.name}" to your Google Drive!`, 'success');
      setTimeout(() => setDriveSaveSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save to Google Drive';
      showToast(msg, 'error');
    } finally {
      setSavingToDrive(false);
    }
  };

  const totalLabels = gridConfig.rows * gridConfig.columns;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100/70 text-neutral-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-message"
          className={`no-print fixed top-20 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentUser={currentUser}
        onOpenDriveModal={() => setDriveModalOpen(true)}
        onSaveToDrive={handleInitiateSaveToDrive}
        onPrint={handlePrint}
        savingToDrive={savingToDrive}
        driveSaveSuccess={driveSaveSuccess}
        totalLabels={totalLabels}
        rows={gridConfig.rows}
        columns={gridConfig.columns}
      />

      {/* Drive Quick Notice Banner when not connected */}
      {!currentUser && (
        <div className="no-print bg-neutral-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>
                Want to import your Apps Script <strong>"label maker"</strong> spreadsheet directly?
              </span>
            </div>
            <button
              type="button"
              id="connect-drive-banner-btn"
              onClick={() => setDriveModalOpen(true)}
              className="px-3 py-1 bg-white text-neutral-900 hover:bg-neutral-100 rounded font-bold text-[11px] flex items-center gap-1.5 transition"
            >
              <HardDrive className="w-3.5 h-3.5" /> Connect Google Drive
            </button>
          </div>
        </div>
      )}

      {/* App Main Body: Two-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left Column: Controls and Inputs */}
          <div className="no-print lg:col-span-5 flex flex-col gap-4">
            <LabelSetupForm
              labelData={labelData}
              onUpdateLabelData={handleUpdateLabelData}
              config={gridConfig}
              onUpdateConfig={handleUpdateGridConfig}
              fillMode={fillMode}
              onToggleFillMode={setFillMode}
              batchCount={batchItems.length}
              onOpenDriveModal={() => setDriveModalOpen(true)}
              onOpenBatchEditor={() => setBatchEditorOpen(true)}
              onOpenCsvPasteModal={() => setCsvPasteModalOpen(true)}
            />
          </div>

          {/* Right Column: Live A4 Visual Canvas & Print Component */}
          <div className="lg:col-span-7 flex flex-col items-center sticky top-20">
            <div className="no-print w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Live A4 Print Sheet Preview
              </span>
              <button
                type="button"
                id="quick-print-preview-btn"
                onClick={handlePrint}
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded-lg shadow-2xs hover:bg-neutral-50 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print Sheet
              </button>
            </div>

            {/* A4 Sheet Component */}
            <div className="w-full flex justify-center bg-neutral-200/60 p-4 sm:p-6 rounded-2xl border border-neutral-300/80 shadow-inner">
              <A4SheetPreview
                labelData={labelData}
                config={gridConfig}
                fillMode={fillMode}
                batchItems={batchItems}
                zoom={zoom}
                onZoomChange={setZoom}
                onPrint={handlePrint}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <GoogleDriveModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        currentUser={currentUser}
        onImportSuccess={handleImportSheetResult}
        onUserChange={setCurrentUser}
      />

      <CsvPasteModal
        isOpen={csvPasteModalOpen}
        onClose={() => setCsvPasteModalOpen(false)}
        onApplyParsedData={handleImportSheetResult}
      />

      <BatchDataEditor
        isOpen={batchEditorOpen}
        onClose={() => setBatchEditorOpen(false)}
        items={batchItems}
        onUpdateItems={setBatchItems}
        defaultCompany={labelData.companyName}
        defaultAddressPan={labelData.addressAndPan}
        defaultOrigin={labelData.origin}
        defaultEmail={labelData.email}
        defaultCustomFields={labelData.customFields}
      />

      <ConfirmationDialog
        isOpen={confirmDriveSaveOpen}
        title="Save Label Sheet to Google Drive?"
        message="This will create a new printable HTML label sheet file in your Google Drive root directory. You can open and print it anytime from your Google Drive."
        confirmLabel="Save to Drive"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSaveToDrive}
        onCancel={() => setConfirmDriveSaveOpen(false)}
      />
    </div>
  );
}
