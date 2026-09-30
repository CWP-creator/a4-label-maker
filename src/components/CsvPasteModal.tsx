import React, { useState } from 'react';
import { X, Clipboard, Check, Sparkles } from 'lucide-react';
import { parseCSVText } from '../utils/csvParser';
import { ParsedSheetResult } from '../services/googleDrive';

interface CsvPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (result: ParsedSheetResult) => void;
}

const SAMPLE_APPS_SCRIPT_CSV = `LABEL SETUP FORM,,,
Company Name:,"Shivapuri Fabric
Product pvt ltd",,"Shivapuri Fabric
Product pvt ltd"
Address & PAN:,"Tokha-4, PAN no-60960145",,"Tokha-4, PAN no-60960145"
Product Name:,Pillow 17x27 Swan,,Pillow 17x27 Swan
Price:,MRP NRs 682,,MRP NRs 682.00
Origin (Made in):,Made in nepal,,Made in nepal
Email:,contact.shivapurifabric@gmail.com,,contact.shivapurifabric@gmail.com
Number of Rows:,8,,
Number of Columns:,5,,`;

export const CsvPasteModal: React.FC<CsvPasteModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
}) => {
  const [csvText, setCsvText] = useState<string>(SAMPLE_APPS_SCRIPT_CSV);
  const [applied, setApplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!csvText.trim()) return;
    const result = parseCSVText(csvText);
    onApplyParsedData(result);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 600);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_APPS_SCRIPT_CSV);
  };

  return (
    <div
      id="csv-paste-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        id="csv-paste-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-neutral-800" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Paste Apps Script / CSV Form</h3>
              <p className="text-xs text-neutral-500">
                Paste the CSV from your Apps Script "LABEL SETUP FORM"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="csv-textarea" className="text-xs font-semibold text-neutral-700">
              CSV Data:
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded"
            >
              <Sparkles className="w-3 h-3 text-neutral-600" /> Load Shivapuri Sample
            </button>
          </div>

          <textarea
            id="csv-textarea"
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV here..."
            className="w-full text-xs font-mono border border-neutral-300 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
          />

          <div className="text-[11px] text-neutral-500">
            Supports both the key-value "LABEL SETUP FORM" format and tabular product lists with headers.
          </div>
        </div>

        <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            id="apply-csv-btn"
            onClick={handleApply}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Applied!
              </>
            ) : (
              'Parse and Apply'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
