export function toSnake(key) {
    return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function toCamel(key) {
    return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function coerceFromRow(field, rawValue) {
    if (field.type === 'number' || field.type === 'currency') {
        return rawValue === null || rawValue === undefined ? null : Number(rawValue);
    }
    if (field.type === 'checkbox') {
        return !!rawValue;
    }
    return rawValue ?? '';
}

function coerceToRow(field, value) {
    if (field.type === 'number' || field.type === 'currency') {
        return value === '' || value === null || value === undefined ? null : Number(value);
    }
    if (field.type === 'checkbox') {
        return !!value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
    return value === undefined ? null : value;
}

export function fromRow(config, row) {
    const record = { id: row.id };
    config.fields.forEach((field) => {
        const column = field.column || toSnake(field.key);
        record[field.key] = coerceFromRow(field, row[column]);
    });
    if (config.extraFromRow) Object.assign(record, config.extraFromRow(row));
    record.createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
    return record;
}

export function toRow(config, data) {
    const row = {};
    config.fields.forEach((field) => {
        const column = field.column || toSnake(field.key);
        row[column] = coerceToRow(field, data[field.key]);
    });
    if (config.extraToRow) Object.assign(row, config.extraToRow(data));
    return row;
}
