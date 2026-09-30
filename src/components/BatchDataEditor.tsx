import React from 'react';
import { X, Plus, Trash2, Tag, DollarSign, Building2 } from 'lucide-react';
import { CustomField, LabelData } from '../types';

interface BatchDataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  items: LabelData[];
  onUpdateItems: (items: LabelData[]) => void;
  defaultCompany: string;
  defaultAddressPan: string;
  defaultOrigin: string;
  defaultEmail: string;
  defaultCustomFields?: CustomField[];
}

export const BatchDataEditor: React.FC<BatchDataEditorProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  defaultCompany,
  defaultAddressPan,
  defaultOrigin,
  defaultEmail,
  defaultCustomFields = [],
}) => {
  if (!isOpen) return null;

  const handleUpdateItem = (index: number, field: keyof LabelData, value: string) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onUpdateItems(updated);
  };

  const handleAddItem = () => {
    const newItem: LabelData = {
      id: `item-${Date.now()}`,
      companyName: defaultCompany,
      addressAndPan: defaultAddressPan,
      productName: `New Item ${items.length + 1}`,
      price: 'MRP NRs 500.00',
      origin: defaultOrigin,
      email: defaultEmail,
      barcodeValue: `SKU-${items.length + 100}`,
      customFields: defaultCustomFields.map((field) => ({ ...field })),
    };
    onUpdateItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onUpdateItems(updated);
  };

  return (
    <div
      id="batch-editor-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        id="batch-editor-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Batch Product Labels ({items.length})</h3>
            <p className="text-xs text-neutral-500">
              Each row will occupy a sequential slot on your A4 print sheet.
            </p>
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

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-neutral-600">Product List</span>
            <button
              type="button"
              id="add-batch-item-btn"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
              >
                <div className="sm:col-span-1 font-mono font-bold text-neutral-400 text-center">
                  #{idx + 1}
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[10px] text-neutral-500 block font-semibold mb-0.5">Product Name</label>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                    className="w-full font-bold bg-white border border-neutral-300 rounded px-2 py-1"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] text-neutral-500 block font-semibold mb-0.5">Price / MRP</label>
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(idx, 'price', e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded px-2 py-1 font-semibold"
                  />
                </div>

                {defaultCustomFields.length > 0 && (
                  <div className="sm:col-span-11 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-neutral-200 pt-2">
                    {(item.customFields || defaultCustomFields).map((field) => (
                      <div key={field.id}>
                        <label className="text-[10px] text-neutral-500 block font-semibold mb-0.5">{field.label || 'Custom Field'}</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const customFields = (item.customFields || defaultCustomFields).map((currentField) =>
                              currentField.id === field.id ? { ...currentField, value: e.target.value } : currentField
                            );
                            const updated = [...items];
                            updated[idx] = { ...item, customFields };
                            onUpdateItems(updated);
                          }}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="sm:col-span-3">
                  <label className="text-[10px] text-neutral-500 block font-semibold mb-0.5">Barcode / SKU</label>
                  <input
                    type="text"
                    value={item.barcodeValue || ''}
                    onChange={(e) => handleUpdateItem(idx, 'barcodeValue', e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded px-2 py-1 font-mono"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded disabled:opacity-30 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
