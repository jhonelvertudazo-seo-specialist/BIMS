import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default [
    { ignores: ['dist/**', 'node_modules/**'] },
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser, ...globals.node },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-refresh/only-export-components': 'warn',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            // This codebase's data hooks/pages universally follow the
            // "useEffect(() => { load() }, [load])" fetch-on-mount pattern,
            // which this rule flags everywhere. That pattern is standard
            // and correct here (see src/context/DataContext.jsx,
            // src/hooks/useGenericEntity.js, most pages) — not a bug to fix.
            'react-hooks/set-state-in-effect': 'off',
        },
    },
    prettierConfig,
];
