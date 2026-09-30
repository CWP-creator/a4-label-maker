import React from 'react';
import { Printer, CloudUpload, FileSpreadsheet, HardDrive, Check } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentUser: User | null;
  onOpenDriveModal: () => void;
  onSaveToDrive: () => void;
  onPrint: () => void;
  savingToDrive: boolean;
  driveSaveSuccess: boolean;
  totalLabels: number;
  rows: number;
  columns: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenDriveModal,
  onSaveToDrive,
  onPrint,
  savingToDrive,
  driveSaveSuccess,
  totalLabels,
  rows,
  columns,
}) => {
  return (
    <header className="no-print w-full bg-white border-b border-neutral-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-950 tracking-tight">A4 Label Maker</h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                A4 • {rows}×{columns} ({totalLabels} labels)
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden md:block">
              Apps Script to Web App converter • High precision A4 printing
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Google Drive Connect Button */}
          <button
            type="button"
            id="header-drive-btn"
            onClick={onOpenDriveModal}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              currentUser
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            {currentUser ? (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Drive Connected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4 text-neutral-600" />
                <span>Connect Google Drive</span>
              </>
            )}
          </button>

          {/* Export to Google Drive */}
          <button
            type="button"
            id="save-to-drive-btn"
            onClick={onSaveToDrive}
            disabled={savingToDrive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold transition disabled:opacity-50"
            title="Save printable label HTML to Google Drive"
          >
            {driveSaveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Saved in Drive</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3.5 h-3.5 text-neutral-700" />
                <span className="hidden sm:inline">{savingToDrive ? 'Saving...' : 'Save to Drive'}</span>
              </>
            )}
          </button>

          {/* Primary Print Button */}
          <button
            type="button"
            id="header-print-btn"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};
