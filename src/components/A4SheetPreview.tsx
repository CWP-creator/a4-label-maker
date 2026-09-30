import React, { useId } from 'react';
import { LabelData, GridConfig, FillMode } from '../types';
import { LabelItem } from './LabelItem';
import { ZoomIn, ZoomOut, Maximize2, Scissors, Printer } from 'lucide-react';

interface A4SheetPreviewProps {
  labelData: LabelData;
  config: GridConfig;
  fillMode: FillMode;
  batchItems: LabelData[];
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onPrint?: () => void;
}

export const A4SheetPreview: React.FC<A4SheetPreviewProps> = ({
  labelData,
  config,
  fillMode,
  batchItems,
  zoom,
  onZoomChange,
  onPrint,
}) => {
  const containerId = useId();
  const totalSlots = config.rows * config.columns;

  const itemsToRender: LabelData[] = [];
  for (let i = 0; i < totalSlots; i++) {
    if (fillMode === 'batch-list' && batchItems.length > 0) {
      itemsToRender.push(batchItems[i % batchItems.length]);
    } else {
      itemsToRender.push(labelData);
    }
  }

  // Calculate approximate dimensions per label
  const printableWidthMm = 210 - config.marginLeftMm - config.marginRightMm - (config.columns - 1) * config.gapHorizontalMm;
  const labelWidthMm = Math.max(10, printableWidthMm / config.columns).toFixed(1);

  const printableHeightMm = 297 - config.marginTopMm - config.marginBottomMm - (config.rows - 1) * config.gapVerticalMm;
  const labelHeightMm = Math.max(10, printableHeightMm / config.rows).toFixed(1);

  return (
    <div id="a4-preview-viewport" className="flex flex-col items-center w-full">
      {/* Top floating bar for zoom, sheet info and print button (hidden in print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 w-full max-w-[210mm] mb-3 px-2 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200">
            A4: 210 × 297 mm
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-50 text-neutral-600 border border-neutral-200">
            Grid: {config.rows} rows × {config.columns} cols ({totalSlots} labels)
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-neutral-500">
            Label size: ~{labelWidthMm} × {labelHeightMm} mm
          </span>
        </div>

        {/* Zoom & Quick Print controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5 shadow-xs">
            <button
              type="button"
              id="zoom-out-btn"
              onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-medium text-neutral-700 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              id="zoom-in-btn"
              onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-neutral-200 mx-0.5" />
            <button
              type="button"
              id="zoom-reset-btn"
              onClick={() => onZoomChange(0.75)}
              className="px-2 py-0.5 text-[11px] font-medium hover:bg-neutral-100 rounded text-neutral-700 transition flex items-center gap-1"
              title="Fit view"
            >
              <Maximize2 className="w-3 h-3" /> Fit
            </button>
          </div>

          {onPrint && (
            <button
              type="button"
              id="preview-toolbar-print-btn"
              onClick={onPrint}
              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
              title="Print A4 sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          )}
        </div>
      </div>

      {/* Helpful Hint banner */}
      <div className="no-print w-full max-w-[210mm] mb-2 px-1 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Click anywhere on the sheet below to print directly
        </span>
        <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">Ctrl / ⌘ + P supported</span>
      </div>

      {/* Screen container for scaled zoom view - Clickable A4 sheet */}
      <div className="no-print overflow-auto max-w-full pb-8 flex justify-center w-full">
        <div
          role="button"
          tabIndex={0}
          id="interactive-a4-sheet"
          onClick={() => {
            onPrint?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPrint?.();
            }
          }}
          aria-label="A4 Label Sheet. Click to print sheet."
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out, box-shadow 0.15s ease',
            width: '210mm',
            height: '297mm',
          }}
          className="group relative bg-white shadow-xl hover:shadow-2xl ring-1 ring-neutral-300 hover:ring-2 hover:ring-neutral-950 rounded-xs shrink-0 select-none cursor-pointer transition-all"
        >
          {/* Floating Print Badge on Sheet */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950/90 hover:bg-neutral-950 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-xs transition group-hover:scale-105 active:scale-95 pointer-events-none">
            <Printer className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>Click Sheet to Print</span>
          </div>

          {/* Visual Corner Markers / Guide notes */}
          {config.showCutMarks && (
            <div className="absolute top-1 left-1.5 flex items-center gap-1 text-[7px] text-neutral-400 font-mono pointer-events-none opacity-60">
              <Scissors className="w-2.5 h-2.5" /> Cut along guides
            </div>
          )}

          {/* Actual Grid Canvas */}
          <div
            id={`a4-preview-canvas-${containerId}`}
            className="w-full h-full box-border grid"
            style={{
              width: '210mm',
              height: '297mm',
              gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
              paddingTop: `${config.marginTopMm}mm`,
              paddingBottom: `${config.marginBottomMm}mm`,
              paddingLeft: `${config.marginLeftMm}mm`,
              paddingRight: `${config.marginRightMm}mm`,
              rowGap: `${config.gapVerticalMm}mm`,
              columnGap: `${config.gapHorizontalMm}mm`,
            }}
          >
            {itemsToRender.map((item, index) => (
              <div key={`screen-label-${index}`} className="w-full h-full min-h-0 min-w-0">
                <LabelItem data={item} config={config} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print-Dedicated Component (Only rendered when window.print is called) */}
      <div id="print-root-container" className="hidden print:block">
        <div
          id="print-sheet-a4"
          className="print-page bg-white box-border grid"
          style={{
            width: '210mm',
            height: '297mm',
            minHeight: '297mm',
            maxHeight: '297mm',
            gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
            paddingTop: `${config.marginTopMm}mm`,
            paddingBottom: `${config.marginBottomMm}mm`,
            paddingLeft: `${config.marginLeftMm}mm`,
            paddingRight: `${config.marginRightMm}mm`,
            rowGap: `${config.gapVerticalMm}mm`,
            columnGap: `${config.gapHorizontalMm}mm`,
            margin: 0,
            overflow: 'hidden',
          }}
        >
          {itemsToRender.map((item, index) => (
            <div key={`print-label-${index}`} className="w-full h-full min-h-0 min-w-0">
              <LabelItem data={item} config={config} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

