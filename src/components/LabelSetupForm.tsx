import React from 'react';
import { LabelData, GridConfig, FillMode } from '../types';
import {
  Building2,
  MapPin,
  Tag,
  DollarSign,
  Globe2,
  Mail,
  Grid3X3,
  Sliders,
  Barcode,
  Layers,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';

interface LabelSetupFormProps {
  labelData: LabelData;
  onUpdateLabelData: (data: Partial<LabelData>) => void;
  config: GridConfig;
  onUpdateConfig: (config: Partial<GridConfig>) => void;
  fillMode: FillMode;
  onToggleFillMode: (mode: FillMode) => void;
  batchCount: number;
  onOpenDriveModal: () => void;
  onOpenBatchEditor: () => void;
  onOpenCsvPasteModal: () => void;
}

export const LabelSetupForm: React.FC<LabelSetupFormProps> = ({
  labelData,
  onUpdateLabelData,
  config,
  onUpdateConfig,
  fillMode,
  onToggleFillMode,
  batchCount,
  onOpenDriveModal,
  onOpenBatchEditor,
  onOpenCsvPasteModal,
}) => {
  const totalLabels = config.rows * config.columns;

  const handleApplyPreset = (rows: number, cols: number) => {
    onUpdateConfig({ rows, columns: cols });
  };

  const handleResetToDefault = () => {
    onUpdateLabelData({
      companyName: 'Shivapuri Fabric\nProduct pvt ltd',
      addressAndPan: 'Tokha-4, PAN no-60960145',
      productName: 'Pillow 17x27 Swan',
      price: 'MRP NRs 682.00',
      origin: 'Made in nepal',
      email: 'contact.shivapurifabric@gmail.com',
      barcodeValue: '60960145-SWAN',
      customFields: [],
    });
    onUpdateConfig({
      rows: 8,
      columns: 5,
      marginTopMm: 8,
      marginBottomMm: 8,
      marginLeftMm: 8,
      marginRightMm: 8,
      gapHorizontalMm: 2,
      gapVerticalMm: 2,
      showBarcode: true,
      borderStyle: 'dashed',
      showCutMarks: true,
    });
  };

  const updateCustomField = (id: string, changes: Partial<{ label: string; value: string }>) => {
    onUpdateLabelData({
      customFields: (labelData.customFields || []).map((field) =>
        field.id === id ? { ...field, ...changes } : field
      ),
    });
  };

  const addCustomField = () => {
    onUpdateLabelData({
      customFields: [
        ...(labelData.customFields || []),
        { id: `custom-${Date.now()}`, label: '', value: '' },
      ],
    });
  };

  const removeCustomField = (id: string) => {
    onUpdateLabelData({ customFields: (labelData.customFields || []).filter((field) => field.id !== id) });
  };

  return (
    <div id="label-setup-sidebar" className="w-full flex flex-col gap-5 text-neutral-800">
      {/* Top Banner: Quick Actions & Preset Buttons */}
      <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            Presets & Quick Templates
          </span>
          <button
            type="button"
            id="reset-form-btn"
            onClick={handleResetToDefault}
            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 transition underline underline-offset-2"
          >
            Reset Shivapuri Data
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="preset-8x5-btn"
            onClick={() => handleApplyPreset(8, 5)}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition ${
              config.rows === 8 && config.columns === 5
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            <div className="font-semibold">8 × 5 Grid (40 labels)</div>
            <div className={`text-[10px] ${config.rows === 8 && config.columns === 5 ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Shivapuri Fabric Standard
            </div>
          </button>

          <button
            type="button"
            id="preset-6x4-btn"
            onClick={() => handleApplyPreset(6, 4)}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition ${
              config.rows === 6 && config.columns === 4
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            <div className="font-semibold">6 × 4 Grid (24 labels)</div>
            <div className={`text-[10px] ${config.rows === 6 && config.columns === 4 ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Medium Retail Tags
            </div>
          </button>

          <button
            type="button"
            id="preset-7x3-btn"
            onClick={() => handleApplyPreset(7, 3)}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition ${
              config.rows === 7 && config.columns === 3
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            <div className="font-semibold">7 × 3 Grid (21 labels)</div>
            <div className={`text-[10px] ${config.rows === 7 && config.columns === 3 ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Avery L7160 Compatible
            </div>
          </button>

          <button
            type="button"
            id="preset-5x2-btn"
            onClick={() => handleApplyPreset(5, 2)}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition ${
              config.rows === 5 && config.columns === 2
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            <div className="font-semibold">5 × 2 Grid (10 labels)</div>
            <div className={`text-[10px] ${config.rows === 5 && config.columns === 2 ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Large Box / Carton Stickers
            </div>
          </button>
        </div>
      </div>

      {/* Mode Selector: Single Label Repeat vs Multi-item batch */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Label Print Mode
        </label>
        <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
          <button
            type="button"
            id="mode-single-btn"
            onClick={() => onToggleFillMode('repeat-single')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              fillMode === 'repeat-single'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Single Product ({totalLabels} copies)
          </button>
          <button
            type="button"
            id="mode-batch-btn"
            onClick={() => onToggleFillMode('batch-list')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              fillMode === 'batch-list'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Batch Items ({batchCount})
          </button>
        </div>
        {fillMode === 'batch-list' && (
          <div className="flex items-center justify-between px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700">
            <span>{batchCount} unique items loaded</span>
            <button
              type="button"
              id="edit-batch-items-btn"
              onClick={onOpenBatchEditor}
              className="text-neutral-900 font-bold hover:underline"
            >
              View / Edit List
            </button>
          </div>
        )}
      </div>

      {/* Primary Setup Form Fields (matches the user's Apps Script Setup Form) */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-700" />
            Label Setup Form Fields
          </h3>
          <button
            type="button"
            id="paste-csv-trigger-btn"
            onClick={onOpenCsvPasteModal}
            className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition"
          >
            Paste CSV / Text
          </button>
        </div>

        {/* Company Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="input-company-name" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-neutral-500" /> Company Name
          </label>
          <textarea
            id="input-company-name"
            rows={2}
            value={labelData.companyName}
            onChange={(e) => onUpdateLabelData({ companyName: e.target.value })}
            placeholder="e.g. Shivapuri Fabric&#10;Product pvt ltd"
            className="w-full text-xs font-medium border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 resize-none"
          />
        </div>

        {/* Address & PAN */}
        <div className="flex flex-col gap-1">
          <label htmlFor="input-address-pan" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-500" /> Address & PAN
          </label>
          <input
            id="input-address-pan"
            type="text"
            value={labelData.addressAndPan}
            onChange={(e) => onUpdateLabelData({ addressAndPan: e.target.value })}
            placeholder="e.g. Tokha-4, PAN no-60960145"
            className="w-full text-xs font-medium border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="input-product-name" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-neutral-500" /> Product Name
          </label>
          <input
            id="input-product-name"
            type="text"
            value={labelData.productName}
            onChange={(e) =>
              onUpdateLabelData({
                productName: e.target.value,
                barcodeValue: e.target.value.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase(),
              })
            }
            placeholder="e.g. Pillow 17x27 Swan"
            className="w-full text-xs font-medium border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 font-bold"
          />
        </div>

        {/* Price & Origin Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="input-price" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-neutral-500" /> Price / MRP
            </label>
            <input
              id="input-price"
              type="text"
              value={labelData.price}
              onChange={(e) => onUpdateLabelData({ price: e.target.value })}
              placeholder="e.g. MRP NRs 682.00"
              className="w-full text-xs font-bold border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="input-origin" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-neutral-500" /> Origin (Made in)
            </label>
            <input
              id="input-origin"
              type="text"
              value={labelData.origin}
              onChange={(e) => onUpdateLabelData({ origin: e.target.value })}
              placeholder="e.g. Made in nepal"
              className="w-full text-xs font-medium border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="input-email" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-neutral-500" /> Contact Email
          </label>
          <input
            id="input-email"
            type="email"
            value={labelData.email}
            onChange={(e) => onUpdateLabelData({ email: e.target.value })}
            placeholder="e.g. contact.shivapurifabric@gmail.com"
            className="w-full text-xs font-medium border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
          />
        </div>

        {/* Optional custom fields */}
        <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-neutral-800">Additional Text Fields</h4>
              <p className="text-[10px] text-neutral-500">Add dates, codes, sizes, or any extra label text.</p>
            </div>
            <button
              type="button"
              id="add-custom-field-btn"
              onClick={addCustomField}
              className="px-2 py-1 bg-neutral-900 text-white rounded-md text-[11px] font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add field
            </button>
          </div>
          {(labelData.customFields || []).map((field) => (
            <div key={field.id} className="grid grid-cols-[1fr_1.4fr_auto] gap-1.5 items-center">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                placeholder="Field name"
                aria-label="Custom field name"
                className="w-full text-xs border border-neutral-300 rounded-lg px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                placeholder="Value"
                aria-label={`${field.label || 'Custom'} value`}
                className="w-full text-xs border border-neutral-300 rounded-lg px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
              <button
                type="button"
                onClick={() => removeCustomField(field.id)}
                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                aria-label={`Remove ${field.label || 'custom'} field`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Barcode Text */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="input-barcode" className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5 text-neutral-500" /> Barcode Value / SKU
            </label>
            <label className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 cursor-pointer">
              <input
                id="toggle-barcode-checkbox"
                type="checkbox"
                checked={config.showBarcode}
                onChange={(e) => onUpdateConfig({ showBarcode: e.target.checked })}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              Show Barcode
            </label>
          </div>
          <input
            id="input-barcode"
            type="text"
            value={labelData.barcodeValue || ''}
            onChange={(e) => onUpdateLabelData({ barcodeValue: e.target.value })}
            placeholder="e.g. 60960145-SWAN"
            className="w-full text-xs font-mono border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Grid Configuration: Rows & Columns (Directly matches Apps Script inputs) */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col gap-3.5">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2.5">
          <Grid3X3 className="w-4 h-4 text-neutral-700" />
          A4 Sheet Grid Layout
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Number of Rows */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-grid-rows" className="text-xs font-semibold text-neutral-700">
              Number of Rows
            </label>
            <div className="flex items-center">
              <button
                type="button"
                id="dec-rows-btn"
                onClick={() => onUpdateConfig({ rows: Math.max(1, config.rows - 1) })}
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-l-lg text-xs font-bold"
              >
                -
              </button>
              <input
                id="input-grid-rows"
                type="number"
                min={1}
                max={20}
                value={config.rows}
                onChange={(e) => onUpdateConfig({ rows: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full text-center text-xs font-bold border-y border-neutral-300 py-1.5 focus:outline-hidden"
              />
              <button
                type="button"
                id="inc-rows-btn"
                onClick={() => onUpdateConfig({ rows: Math.min(20, config.rows + 1) })}
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-r-lg text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Number of Columns */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-grid-columns" className="text-xs font-semibold text-neutral-700">
              Number of Columns
            </label>
            <div className="flex items-center">
              <button
                type="button"
                id="dec-cols-btn"
                onClick={() => onUpdateConfig({ columns: Math.max(1, config.columns - 1) })}
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-l-lg text-xs font-bold"
              >
                -
              </button>
              <input
                id="input-grid-columns"
                type="number"
                min={1}
                max={10}
                value={config.columns}
                onChange={(e) => onUpdateConfig({ columns: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full text-center text-xs font-bold border-y border-neutral-300 py-1.5 focus:outline-hidden"
              />
              <button
                type="button"
                id="inc-cols-btn"
                onClick={() => onUpdateConfig({ columns: Math.min(10, config.columns + 1) })}
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-r-lg text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Page Margins and Spacing */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
          <div className="flex flex-col gap-1">
            <label htmlFor="input-margin-vert" className="text-[11px] font-semibold text-neutral-600">
              Top/Bottom Margins (mm)
            </label>
            <input
              id="input-margin-vert"
              type="number"
              min={0}
              max={30}
              value={config.marginTopMm}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                onUpdateConfig({ marginTopMm: val, marginBottomMm: val });
              }}
              className="text-xs font-medium border border-neutral-300 rounded-lg px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="input-margin-horiz" className="text-[11px] font-semibold text-neutral-600">
              Left/Right Margins (mm)
            </label>
            <input
              id="input-margin-horiz"
              type="number"
              min={0}
              max={30}
              value={config.marginLeftMm}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                onUpdateConfig({ marginLeftMm: val, marginRightMm: val });
              }}
              className="text-xs font-medium border border-neutral-300 rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* Styling Details: Borders and Alignment */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
          <div className="flex flex-col gap-1">
            <label htmlFor="select-border-style" className="text-[11px] font-semibold text-neutral-600">
              Cutting Guide Border
            </label>
            <select
              id="select-border-style"
              value={config.borderStyle}
              onChange={(e) =>
                onUpdateConfig({
                  borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none',
                  showCutMarks: e.target.value !== 'none',
                })
              }
              className="text-xs font-medium border border-neutral-300 rounded-lg px-2 py-1 bg-white"
            >
              <option value="dashed">Dashed Guide Lines</option>
              <option value="solid">Solid Border</option>
              <option value="dotted">Dotted Lines</option>
              <option value="none">No Border (Pre-cut stickers)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="select-text-align" className="text-[11px] font-semibold text-neutral-600">
              Text Alignment
            </label>
            <select
              id="select-text-align"
              value={config.textAlign}
              onChange={(e) => onUpdateConfig({ textAlign: e.target.value as 'left' | 'center' })}
              className="text-xs font-medium border border-neutral-300 rounded-lg px-2 py-1 bg-white"
            >
              <option value="center">Centered</option>
              <option value="left">Left Aligned</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
