lezer-generator src/renderer/src/editor/lang/editor.grammar -o src/renderer/src/editor/lang/parser.js

rm -rf src/renderer/src/editor/lang/parser.ts
rm -rf src/renderer/src/editor/lang/parser.terms.ts
mv src/renderer/src/editor/lang/parser.js src/renderer/src/editor/lang/parser.ts
mv src/renderer/src/editor/lang/parser.terms.js src/renderer/src/editor/lang/parser.terms.ts
