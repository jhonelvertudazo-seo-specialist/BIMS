import JsBarcode from 'jsbarcode';

// Renders a Code128 barcode to an off-screen canvas and returns a data
// URL, so it can be embedded as a plain <img> in print documents (which
// are written into a separate popup window as raw HTML, not React).
export function generateBarcodeDataUrl(value, options = {}) {
    if (!value) return null;
    const canvas = document.createElement('canvas');
    try {
        JsBarcode(canvas, String(value), {
            format: 'CODE128',
            displayValue: true,
            fontSize: 14,
            height: 45,
            margin: 6,
            ...options,
        });
        return canvas.toDataURL('image/png');
    } catch {
        return null;
    }
}
