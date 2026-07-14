import { downloadExcel, printTableAsPdf } from '../../utils/actions.js';

export default function ExportButtons({ title, headers, rows }) {
    return (
        <div className="btn-group" role="group" aria-label="Export">
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => downloadExcel(title, headers, rows)}
                disabled={rows.length === 0}
                title="Export to Excel"
            >
                📊 Excel
            </button>
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => printTableAsPdf(title, headers, rows)}
                disabled={rows.length === 0}
                title="Export to PDF"
            >
                🖨️ PDF
            </button>
        </div>
    );
}
