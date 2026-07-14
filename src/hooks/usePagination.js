import { useEffect, useMemo, useState } from 'react';

export function usePagination(items, pageSize = 6) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    useEffect(() => {
        setPage(1);
    }, [items.length]);

    const safePage = Math.min(page, totalPages);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safePage, pageSize]);

    return { pageItems, page: safePage, setPage, totalPages };
}
