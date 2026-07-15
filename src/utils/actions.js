import { supabase } from '../lib/supabaseClient.js';
import { formatCurrency, formatDate } from './format.js';
import { renderTemplateText, DEFAULT_CERTIFICATE_BODIES, ordinalDay } from '../lib/certificateTemplateEngine.js';
import { generateBarcodeDataUrl } from './barcode.js';
import bimsLogo from '../styles/logo/bims logo.png';

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

export async function printCertificateDocument(certificate, resident) {
    const [{ data: template }, { data: profile }] = await Promise.all([
        supabase.from('certificate_templates').select('*').eq('type', certificate.type).maybeSingle(),
        supabase.from('system_settings').select('*').limit(1).maybeSingle(),
    ]);

    const issuedDate = new Date(certificate.issuedAt);
    const prefix = resident?.gender === 'Male' ? 'Mr.' : resident?.gender === 'Female' ? 'Ms.' : '';

    const data = {
        prefix,
        residentName: certificate.residentName,
        address: resident?.address || '',
        purok: resident?.purok || '',
        nationality: resident?.nationality || 'Filipino',
        civilStatus: resident?.civilStatus || '',
        gender: resident?.gender || '',
        purpose: certificate.purpose || 'whatever legal purpose it may serve',
        fee: formatCurrency(certificate.fee),
        referenceNo: certificate.referenceNo,
        day: ordinalDay(issuedDate.getDate()),
        month: issuedDate.toLocaleDateString('en-US', { month: 'long' }),
        year: issuedDate.getFullYear(),
        issuedAt: issuedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        barangayName: profile?.barangay_name || '____________',
        municipality: profile?.municipality || '____________',
        province: profile?.province || '____________',
        captain: profile?.captain || '',
        secretary: profile?.secretary || '',
        treasurer: profile?.treasurer || '',
        firstName: resident?.firstName || '',
        middleName: resident?.middleName || '',
        lastName: resident?.lastName || '',
        tin: resident?.tin || '',
        occupation: resident?.occupation || '',
        birthDate: resident?.birthDate ? formatDate(resident.birthDate) : '',
    };

    const logoUrl = new URL(bimsLogo, window.location.href).href;

    if (certificate.type === 'Cedula') {
        printDocument(`${certificate.type} — ${data.referenceNo}`, buildCedulaHtml(data, certificate, logoUrl));
        return;
    }

    const bodyTemplate = template?.body_template || DEFAULT_CERTIFICATE_BODIES[certificate.type]
        || 'This is to certify that {{prefix}} {{residentName}} is a resident of this Barangay. Issued upon request for {{purpose}}.';
    const footerText = template?.footer_text || '';
    const headerText = template?.header_text ? renderTemplateText(template.header_text, data) : [
        'REPUBLIC OF THE PHILIPPINES',
        `Province of ${data.province}`,
        `Municipality/City of ${data.municipality}`,
        `BARANGAY ${data.barangayName}`,
        'Office of the Punong Barangay',
    ].join('<br/>');

    printDocument(`${certificate.type} — ${data.referenceNo}`, `
        <img src="${logoUrl}" alt="Barangay Logo" class="cert-logo" />
        <p class="cert-header">${headerText}</p>
        <h1>${certificate.type}</h1>
        <p class="cert-towhom">TO WHOM IT MAY CONCERN:</p>
        <p class="cert-body">${renderTemplateText(bodyTemplate, data)}</p>
        ${footerText ? `<p class="cert-body">${renderTemplateText(footerText, data)}</p>` : ''}
        <p class="cert-body">Issued this ${data.day} day of ${data.month}, ${data.year}, at Barangay ${data.barangayName}, ${data.municipality}, Philippines.</p>

        <div class="cert-sign-block">
            <p class="cert-sign-label">Certified by:</p>
            <div class="sign-line"><div class="line">${data.captain ? `HON. ${data.captain}` : '&nbsp;'}</div></div>
            <p class="cert-sign-title">Punong Barangay</p>
        </div>

        <div class="cert-sign-block">
            <p class="cert-sign-label">Attested by:</p>
            <div class="sign-line"><div class="line">${data.secretary || '&nbsp;'}</div></div>
            <p class="cert-sign-title">Barangay Secretary</p>
        </div>

        <p class="cert-seal">[Official Barangay Seal]</p>

        <table class="cert-meta">
            <tr><td class="label">Control No.</td><td class="value">${data.referenceNo}</td></tr>
            <tr><td class="label">OR No.</td><td class="value">${certificate.fee > 0 ? data.referenceNo : 'N/A'}</td></tr>
            <tr><td class="label">Date Issued</td><td class="value">${data.issuedAt}</td></tr>
        </table>
        ${barcodeHtml(data.referenceNo)}
    `);
}

// Barcode of the certificate's reference number, for a physical scanner
// to look the record up later. Rendered client-side to a data URL since
// print documents are raw HTML written into a popup window, not React.
function barcodeHtml(value) {
    const dataUrl = generateBarcodeDataUrl(value);
    if (!dataUrl) return '';
    return `<div class="cert-barcode"><img src="${dataUrl}" alt="Barcode ${value}" /></div>`;
}

// Mirrors the standard BIR Form 0016 (Community Tax Certificate/Cedula)
// layout rather than the narrative "TO WHOM IT MAY CONCERN" wording used
// by the other certificate types. Fields the app doesn't track (place of
// birth, height/weight, itemized income breakdown) are left as blank
// lines for staff to fill in by hand, same as on the paper form.
function buildCedulaHtml(data, certificate, logoUrl) {
    const fullName = [data.lastName, data.firstName, data.middleName].filter(Boolean).join(', ') || data.residentName;
    return `
        <img src="${logoUrl}" alt="Barangay Logo" class="cedula-logo-watermark" />
        <div class="cedula-topline">BIR FORM 0016 (MARCH, 2000)</div>
        <div class="cedula-title-row">
            <div class="cedula-title">COMMUNITY TAX CERTIFICATE</div>
            <div class="cedula-badge">INDIVIDUAL</div>
            <div class="cedula-cci">CCI ${data.referenceNo}</div>
        </div>
        <table class="cedula-table">
            <tr>
                <td class="cedula-cell"><span class="cedula-label">YEAR</span><br/>${data.year}</td>
                <td class="cedula-cell"><span class="cedula-label">PLACE OF ISSUE (City/Mun./Prov.)</span><br/>${data.municipality}, ${data.province}</td>
                <td class="cedula-cell"><span class="cedula-label">DATE ISSUED</span><br/>${data.issuedAt}</td>
            </tr>
            <tr>
                <td class="cedula-cell" colspan="3"><span class="cedula-label">NAME (Surname, First, Middle)</span><br/>${fullName}</td>
            </tr>
            <tr>
                <td class="cedula-cell" colspan="2"><span class="cedula-label">ADDRESS</span><br/>${data.address || '&nbsp;'}</td>
                <td class="cedula-cell"><span class="cedula-label">TIN (if any)</span><br/>${data.tin || '&nbsp;'}</td>
            </tr>
            <tr>
                <td class="cedula-cell"><span class="cedula-label">CITIZENSHIP</span><br/>${data.nationality}</td>
                <td class="cedula-cell"><span class="cedula-label">PLACE OF BIRTH</span><br/>&nbsp;</td>
                <td class="cedula-cell"><span class="cedula-label">SEX</span><br/>${data.gender || '&nbsp;'}</td>
            </tr>
            <tr>
                <td class="cedula-cell"><span class="cedula-label">CIVIL STATUS</span><br/>${data.civilStatus || '&nbsp;'}</td>
                <td class="cedula-cell"><span class="cedula-label">DATE OF BIRTH</span><br/>${data.birthDate || '&nbsp;'}</td>
                <td class="cedula-cell"><span class="cedula-label">HEIGHT / WEIGHT</span><br/>&nbsp;</td>
            </tr>
            <tr>
                <td class="cedula-cell" colspan="3"><span class="cedula-label">PROFESSION / OCCUPATION / BUSINESS</span><br/>${data.occupation || '&nbsp;'}</td>
            </tr>
        </table>

        <table class="cedula-table cedula-tax-table">
            <tr>
                <td>A. BASIC COMMUNITY TAX (₱5.00) Voluntary or Exempted (₱1.00)</td>
                <td class="cedula-amount">₱</td>
            </tr>
            <tr>
                <td colspan="2">B. ADDITIONAL COMMUNITY TAX (tax not to exceed ₱5,000.00)</td>
            </tr>
            <tr>
                <td class="cedula-subitem">1. Gross receipts or earnings derived from business during the preceding year (₱1.00 for every ₱1,000)</td>
                <td class="cedula-amount">₱</td>
            </tr>
            <tr>
                <td class="cedula-subitem">2. Salaries or gross receipts or earnings derived from exercise of profession or pursuit of any occupation (₱1.00 for every ₱1,000)</td>
                <td class="cedula-amount">₱</td>
            </tr>
            <tr>
                <td class="cedula-subitem">3. Income from real property (₱1.00 for every ₱1,000)</td>
                <td class="cedula-amount">₱</td>
            </tr>
            <tr>
                <td class="cedula-total-label">TOTAL</td>
                <td class="cedula-amount">${data.fee}</td>
            </tr>
            <tr>
                <td class="cedula-total-label">INTEREST</td>
                <td class="cedula-amount">₱</td>
            </tr>
            <tr>
                <td class="cedula-total-label">TOTAL AMOUNT PAID</td>
                <td class="cedula-amount">${data.fee}</td>
            </tr>
        </table>

        <div class="cedula-sign-row">
            <div class="cedula-thumb">
                <div class="cedula-thumb-box"></div>
                <div>Right Thumb Print</div>
            </div>
            <div class="cedula-taxpayer-sign">
                <div class="sign-line"><div class="line">&nbsp;</div></div>
                <div>Taxpayer's Signature</div>
            </div>
        </div>

        <div class="cert-sign-block">
            <div class="sign-line"><div class="line">${data.treasurer || '&nbsp;'}</div></div>
            <p class="cert-sign-title">Municipal/City Treasurer</p>
        </div>

        ${barcodeHtml(data.referenceNo)}
    `;
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
                @page { size: A4; margin: 14mm 16mm; }
                body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0b0b0b; padding: 0.5rem 0.75rem; position: relative; font-size: 0.92rem; }
                h1 { font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; margin: 0.25rem 0; }
                h2 { font-size: 0.85rem; font-weight: 400; text-align: center; color: #52514e; margin-top: 0; margin-bottom: 1.25rem; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; }
                td { padding: 0.35rem 0; border-bottom: 1px solid #e1e0d9; }
                td.label { color: #52514e; width: 40%; }
                td.value { font-weight: 600; }
                .sign-line { margin-top: 1.5rem; text-align: center; page-break-inside: avoid; }
                .sign-line .line { border-top: 1px solid #0b0b0b; width: 260px; margin: 0 auto; padding-top: 0.3rem; font-size: 0.8rem; font-weight: 600; color: #0b0b0b; }
                .cert-logo { position: absolute; top: 0.25rem; left: 0.25rem; height: 60px; width: 60px; object-fit: contain; }
                .cert-header { text-align: center; font-weight: 700; font-size: 0.8rem; line-height: 1.4; margin-bottom: 0.5rem; }
                .cert-towhom { font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
                .cert-body { line-height: 1.6; text-align: justify; margin-bottom: 0.65rem; }
                .cert-sign-block { margin-top: 1.25rem; text-align: center; page-break-inside: avoid; }
                .cert-sign-label { text-align: left; margin-bottom: 0; }
                .cert-sign-title { text-align: center; font-size: 0.8rem; color: #52514e; margin-top: 0.15rem; }
                .cert-seal { text-align: center; font-size: 0.75rem; color: #898781; font-style: italic; margin-top: 1rem; }
                .cert-meta { width: auto; margin-top: 0.75rem; font-size: 0.76rem; }
                .cert-meta td { border-bottom: none; padding: 0.1rem 0; }
                .cert-meta td.label { width: auto; padding-right: 1rem; }
                .cedula-logo-watermark {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    height: 260px; width: 260px; object-fit: contain; opacity: 0.14; z-index: -1;
                }
                .cedula-topline { font-size: 0.7rem; margin-bottom: 0.5rem; }
                .cedula-title-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; border: 2px solid #0b0b0b; padding: 0.4rem 0.6rem; margin-bottom: 0.5rem; }
                .cedula-title { font-weight: 700; font-size: 0.95rem; }
                .cedula-badge { border: 1px solid #0b0b0b; padding: 0.15rem 0.6rem; font-weight: 700; font-size: 0.8rem; }
                .cedula-cci { font-weight: 700; font-size: 0.9rem; }
                .cedula-table { border: 1px solid #0b0b0b; margin-bottom: 0.5rem; }
                .cedula-table.cedula-tax-table { margin-bottom: 1rem; }
                .cedula-cell { border: 1px solid #0b0b0b; padding: 0.3rem 0.5rem; font-size: 0.8rem; vertical-align: top; }
                .cedula-label { font-size: 0.65rem; color: #52514e; text-transform: uppercase; letter-spacing: 0.02em; }
                .cedula-tax-table td { border: 1px solid #0b0b0b; padding: 0.3rem 0.5rem; font-size: 0.78rem; }
                .cedula-subitem { padding-left: 1.25rem !important; }
                .cedula-amount { width: 90px; text-align: right; font-weight: 600; }
                .cedula-total-label { font-weight: 700; text-align: right; }
                .cedula-sign-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem; text-align: center; font-size: 0.78rem; page-break-inside: avoid; }
                .cedula-thumb-box { border: 1px solid #0b0b0b; width: 90px; height: 90px; margin: 0 auto 0.35rem; }
                .cedula-taxpayer-sign .sign-line { margin-top: 0; }
                .cert-barcode { text-align: center; margin-top: 0.75rem; page-break-inside: avoid; }
                .cert-barcode img { height: 45px; }
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
