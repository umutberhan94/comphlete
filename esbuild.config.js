const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/extension.ts'], // Adjust entry point if needed
    bundle: true,
    outfile: 'out/extension.js', // Output bundled file
    minify: true,
    sourcemap: false,
    platform: 'node',  // Ensures compatibility with Node.js environment
    target: 'es2020',
    external: ['vscode'], // Exclude vscode from the bundle
}).catch(() => process.exit(1));
