import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { LabelData, GridConfig } from '../types';

interface LabelItemProps {
  data: LabelData;
  config: GridConfig;
  index: number;
}

export const LabelItem: React.FC<LabelItemProps> = ({ data, config, index }) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (config.showBarcode && barcodeRef.current) {
      const codeValue = data.barcodeValue || (data.productName ? data.productName.slice(0, 12).replace(/[^a-zA-Z0-9]/g, '') : 'ITEM-001');
      try {
        JsBarcode(barcodeRef.current, codeValue, {
          format: config.barcodeType || 'CODE128',
          width: 1.1,
          height: 16,
          displayValue: false,
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch {
        // Fallback with clean numeric or code string
        try {
          JsBarcode(barcodeRef.current, `LBL${index + 1000}`, {
            format: 'CODE128',
            width: 1.1,
            height: 16,
            displayValue: false,
            margin: 0,
            background: 'transparent',
            lineColor: '#000000',
          });
        } catch {
          // Ignore render failure for edge case strings
        }
      }
    }
  }, [config.showBarcode, config.barcodeType, data.barcodeValue, data.productName, index]);

  const borderStyleClass = (() => {
    if (!config.showCutMarks || config.borderStyle === 'none') return 'border-transparent';
    if (config.borderStyle === 'dashed') return 'border-dashed border-neutral-300';
    if (config.borderStyle === 'dotted') return 'border-dotted border-neutral-300';
    return 'border-solid border-neutral-300';
  })();

  const textAlignmentClass = config.textAlign === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div
      id={`label-item-${index}`}
      className={`h-full w-full flex flex-col justify-between border overflow-hidden box-border bg-white text-neutral-900 leading-tight ${borderStyleClass} ${textAlignmentClass}`}
      style={{
        padding: `${config.paddingMm}mm`,
        borderRadius: `${config.borderRadiusMm}mm`,
      }}
    >
      {/* Top Header: Company Name & PAN */}
      <div className="w-full">
        <h4 className="font-extrabold uppercase tracking-tight text-[8px] sm:text-[8.5px] text-neutral-950 line-clamp-2 leading-none">
          {data.companyName}
        </h4>
        {data.addressAndPan && (
          <p className="text-[6.5px] text-neutral-600 font-medium tracking-tight break-words leading-none mt-0.5">
            {data.addressAndPan}
          </p>
        )}
      </div>

      {/* Middle: Product Name & Price */}
      <div className="w-full my-auto py-0.5">
        <div className="font-black text-[9px] sm:text-[10px] text-neutral-950 tracking-tight leading-tight line-clamp-2">
          {data.productName}
        </div>
        <div className="inline-block mt-0.5 px-1 py-0.5 bg-neutral-100 rounded text-[8px] sm:text-[8.5px] font-bold text-neutral-900 border border-neutral-200">
          {data.price}
        </div>
        {data.customFields?.some((field) => field.label.trim() || field.value.trim()) && (
          <div className="mt-1 w-full flex flex-col gap-0.5 text-[5.5px] leading-none">
            {data.customFields.map(
              (field) =>
                (field.label.trim() || field.value.trim()) && (
                  <div key={field.id} className="flex gap-1 break-words">
                    <span className="font-bold uppercase text-neutral-700">{field.label}:</span>
                    <span className="text-neutral-600">{field.value}</span>
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {/* Bottom: Barcode, Origin & Contact */}
      <div className="w-full flex flex-col gap-0.5">
        {config.showBarcode && (
          <div className="w-full flex flex-col items-center justify-center my-0.5">
            <svg ref={barcodeRef} className="max-w-full h-4" />
            <span className="text-[5.5px] tracking-wider text-neutral-500 font-mono">
              {data.barcodeValue || data.productName.slice(0, 10).toUpperCase()}
            </span>
          </div>
        )}

        <div className="w-full flex flex-col text-[5.5px] text-neutral-600 font-medium border-t border-neutral-200 pt-0.5 leading-none">
          <span className="font-semibold uppercase tracking-wider text-neutral-700 break-words">
            {data.origin || 'Made in Nepal'}
          </span>
          <span className="text-[5px] text-neutral-500 break-words" style={{ overflowWrap: 'anywhere' }}>
            {data.email}
          </span>
        </div>
      </div>
    </div>
  );
};
