import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([globalIgnores(["**/out", "**/dist", "**/*.d.ts"]),
    eslint.configs.recommended,
    tseslint.configs.strict,
{
    plugins: {
        "@stylistic": stylistic
    },

    rules: {
        "@typescript-eslint/naming-convention": "warn",
        "@stylistic/semi": "warn",
        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn"
    },
}]);