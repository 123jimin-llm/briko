// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const config = tseslint.config([
    {
        ignores: ["dist/**"],
    },
    {
        files: ["src/**/*.ts"],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.strict,
        ],
    },
]);

export default config;