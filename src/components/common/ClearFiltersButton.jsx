export default function ClearFiltersButton({ active, onClear }) {
    if (!active) return null;
    return (
        <button type="button" className="btn btn-link btn-sm text-decoration-none px-0" onClick={onClear}>
            ✕ Clear filters
        </button>
    );
}
