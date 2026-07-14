export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <nav className="d-flex justify-content-between align-items-center mt-3" aria-label="Table pagination">
            <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ‹ Previous
            </button>
            <span className="text-muted small">Page {page} of {totalPages}</span>
            <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next ›
            </button>
        </nav>
    );
}
