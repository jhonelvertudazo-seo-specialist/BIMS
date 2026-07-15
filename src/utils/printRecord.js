import { printDocument } from './actions.js';
import { resolveFieldDisplay } from '../lib/genericDisplay.js';

// Generic printable summary for any GenericPage-driven module: one row
// per configured field, rendered the same way exports already do
// (resolveFieldDisplay), so every module gets a working "Print" action
// without needing its own bespoke print template.
export function printGenericRecord(config, item, lookupData) {
    const rows = config.fields
        .filter((f) => !f.auto || item[f.key])
        .map((f) => [f.label, resolveFieldDisplay(f, item, lookupData)]);
    printDocument(config.title, `
        <h1>${config.title}</h1>
        <h2>Barangay Information and Management System</h2>
        <table>
            ${rows.map(([label, value]) => `<tr><td class="label">${label}</td><td class="value">${value}</td></tr>`).join('')}
        </table>
    `);
}
