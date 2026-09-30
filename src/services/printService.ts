/**
 * High-precision A4 print utility for label sheets.
 * Handles printing across standard browsers, iframe sandboxes, and mobile devices.
 */

export interface PrintOptions {
  sheetTitle?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export function printA4Element(elementId: string = 'print-sheet-a4', options: PrintOptions = {}): boolean {
  try {
    options.onBeforePrint?.();

    const targetElement = document.getElementById(elementId) || document.querySelector('.print-page');
    if (!targetElement) {
      // Fallback: try screen canvas
      const screenCanvas = document.querySelector('[id^="a4-preview-canvas"]');
      if (screenCanvas) {
        return printViaIframe(screenCanvas as HTMLElement, options);
      }
      // Last resort fallback
      window.focus();
      window.print();
      return true;
    }

    // Try iframe printing first for clean isolated output
    const printedViaIframe = printViaIframe(targetElement as HTMLElement, options);
    if (printedViaIframe) {
      return true;
    }

    // Fallback: window.print()
    window.focus();
    window.print();
    options.onAfterPrint?.();
    return true;
  } catch (error) {
    console.warn('Iframe print failed, falling back to window.print():', error);
    try {
      window.focus();
      window.print();
      options.onAfterPrint?.();
      return true;
    } catch {
      return false;
    }
  }
}

function printViaIframe(element: HTMLElement, options: PrintOptions): boolean {
  try {
    // Remove any stale print iframes
    const existingIframe = document.getElementById('a4-print-isolated-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'a4-print-isolated-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      return false;
    }

    const title = options.sheetTitle || 'A4 Label Sheet';
    const clonedContent = element.cloneNode(true) as HTMLElement;
    const sourceStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((styleElement) => styleElement.outerHTML)
      .join('\n');

    // Reset transforms or unwanted constraints on clone
    clonedContent.style.transform = 'none';
    clonedContent.style.margin = '0 auto';
    clonedContent.style.boxShadow = 'none';
    clonedContent.style.position = 'relative';

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${sourceStyles}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      width: 210mm !important;
      height: 297mm !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .print-wrapper {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
      page-break-after: avoid;
      break-after: avoid;
    }
    /* Keep the cloned sheet at the exact physical page size. */
    .print-page {
      display: grid !important;
      width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      margin: 0 !important;
      overflow: hidden !important;
      box-shadow: none !important;
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    ${clonedContent.outerHTML}
  </div>
</body>
</html>`);
    doc.close();

    // Give browser time to parse DOM and embedded SVGs
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        options.onAfterPrint?.();
      } catch (err) {
        console.warn('iframe.contentWindow.print error:', err);
        window.focus();
        window.print();
        options.onAfterPrint?.();
      } finally {
        // Clean up iframe after printing dialog is closed
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 60000);
      }
    }, 250);

    return true;
  } catch (err) {
    console.error('Error setting up print iframe:', err);
    return false;
  }
}
