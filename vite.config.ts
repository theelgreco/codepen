import { defineConfig } from "vite";
import { resolve } from "path";
import { globbySync } from "globby";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

const htmlEntries = globbySync("./src/client/**/*.html").reduce((acc, file) => {
    const name = file.replace("./src/client/pages/", "").replace("/index.html", "").replace(".html", "");
    // @ts-expect-error
    acc[name || "index"] = resolve(__dirname, file);
    return acc;
}, {});

export default defineConfig({
    root: "./src/client/pages",
    plugins: [tailwindcss(), vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src/client", import.meta.url)), // Alias for src folder
        },
    },
    build: {
        outDir: "../../../dist/public",
        emptyOutDir: true,
        rollupOptions: {
            input: htmlEntries,
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
    server: {
        hmr: {
            host: "localhost",
            port: 5174,
            overlay: false,
        },
        fs: {
            allow: [resolve(__dirname, "..")], // Allow src/client/pages parent
        },
    },
});
