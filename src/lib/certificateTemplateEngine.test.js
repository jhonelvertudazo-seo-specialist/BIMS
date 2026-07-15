import { describe, it, expect } from 'vitest';
import { renderTemplateText, ordinalDay } from './certificateTemplateEngine.js';

describe('renderTemplateText', () => {
    it('substitutes known placeholders', () => {
        expect(renderTemplateText('Hello {{name}}', { name: 'Juan' })).toBe('Hello Juan');
    });

    it('replaces unknown placeholders with an empty string', () => {
        expect(renderTemplateText('Hello {{name}}, age {{age}}', { name: 'Juan' })).toBe('Hello Juan, age ');
    });

    it('returns an empty string for empty/undefined input', () => {
        expect(renderTemplateText('', { name: 'Juan' })).toBe('');
        expect(renderTemplateText(undefined, { name: 'Juan' })).toBe('');
    });
});

describe('ordinalDay', () => {
    it('handles the standard 1st/2nd/3rd cases', () => {
        expect(ordinalDay(1)).toBe('1st');
        expect(ordinalDay(2)).toBe('2nd');
        expect(ordinalDay(3)).toBe('3rd');
        expect(ordinalDay(4)).toBe('4th');
    });

    it('handles the 11th/12th/13th exceptions', () => {
        expect(ordinalDay(11)).toBe('11th');
        expect(ordinalDay(12)).toBe('12th');
        expect(ordinalDay(13)).toBe('13th');
    });

    it('handles the 21st/22nd/23rd cases', () => {
        expect(ordinalDay(21)).toBe('21st');
        expect(ordinalDay(22)).toBe('22nd');
        expect(ordinalDay(23)).toBe('23rd');
    });
});
