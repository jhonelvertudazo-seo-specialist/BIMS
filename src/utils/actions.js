export function openInMaps(query) {
    if (!query || !query.trim()) return false;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
}

function csvEscape(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function downloadCsv(filename, headers, rows) {
    const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(','));
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function excelEscape(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function downloadExcel(filename, headers, rows) {
    const headerRow = `<tr>${headers.map((h) => `<th style="background:#f0f0f0;font-weight:bold;">${excelEscape(h)}</th>`).join('')}</tr>`;
    const bodyRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${excelEscape(cell)}</td>`).join('')}</tr>`).join('');
    const html = `<!doctype html>
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
        <body><table border="1">${headerRow}${bodyRows}</table></body>
        </html>`;
    const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function printTableAsPdf(title, headers, rows) {
    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) return false;
    const headerRow = `<tr>${headers.map((h) => `<th>${excelEscape(h)}</th>`).join('')}</tr>`;
    const bodyRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${excelEscape(cell)}</td>`).join('')}</tr>`).join('');
    win.document.write(`
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0b0b0b; padding: 1.5rem; }
                h1 { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; margin-bottom: 0.25rem; }
                h2 { font-size: 0.85rem; font-weight: 400; text-align: center; color: #52514e; margin-top: 0; margin-bottom: 1.5rem; }
                table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
                th, td { border: 1px solid #d8d7cf; padding: 0.35rem 0.5rem; text-align: left; }
                th { background: #f0f0ed; text-transform: uppercase; font-size: 0.68rem; letter-spacing: 0.03em; }
                tr:nth-child(even) td { background: #fafaf8; }
                .meta { text-align: right; font-size: 0.72rem; color: #898781; margin-bottom: 0.5rem; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <h2>Barangay Information and Management System</h2>
            <div class="meta">Generated ${new Date().toLocaleString('en-US')} &middot; ${rows.length} record${rows.length === 1 ? '' : 's'}</div>
            <table>
                <thead>${headerRow}</thead>
                <tbody>${bodyRows}</tbody>
            </table>
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    return true;
}

export function printDocument(title, bodyHtml) {
    const win = window.open('', '_blank', 'width=720,height=900');
    if (!win) return false;
    win.document.write(`
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0b0b0b; padding: 2.5rem; }
                h1 { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; margin-bottom: 0.25rem; }
                h2 { font-size: 0.85rem; font-weight: 400; text-align: center; color: #52514e; margin-top: 0; margin-bottom: 2rem; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                td { padding: 0.5rem 0; border-bottom: 1px solid #e1e0d9; }
                td.label { color: #52514e; width: 40%; }
                td.value { font-weight: 600; }
                .sign-line { margin-top: 4rem; text-align: center; }
                .sign-line .line { border-top: 1px solid #0b0b0b; width: 260px; margin: 0 auto; padding-top: 0.35rem; font-size: 0.8rem; color: #52514e; }
            </style>
        </head>
        <body>${bodyHtml}</body>
        </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    return true;
}
