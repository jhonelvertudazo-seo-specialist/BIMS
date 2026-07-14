export function nextSequentialCode(list, field, pattern, prefix, padLength) {
    let max = 0;
    list.forEach((item) => {
        const m = pattern.exec(item[field] || '');
        if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return prefix + String(max + 1).padStart(padLength, '0');
}
