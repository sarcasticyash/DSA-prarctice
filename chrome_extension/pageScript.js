// Striver DSA Sync - Page Context Script (MAIN World)
(function () {
    function isLikelyCode(text) {
        if (!text || typeof text !== 'string') return false;
        const trimmed = text.trim();
        if (trimmed.length < 15) return false;
        const hasKeywords = /(class\s+\w+|function|def\s+\w+|#include|void|int|public:|vector<|return\s|var\s|let\s|const\s|System\.out)/.test(trimmed);
        const hasBrackets = /[\{\}\;\(\)]/.test(trimmed);
        const hasIndentsOrNewlines = trimmed.includes('\n');
        return (hasKeywords || (hasBrackets && hasIndentsOrNewlines));
    }

    function extractCodeFromMainWorld() {
        let code = null;
        let source = null;

        try {
            // 1. Monaco Editor Models (Global monaco)
            if (window.monaco && window.monaco.editor && typeof window.monaco.editor.getModels === 'function') {
                const models = window.monaco.editor.getModels();
                if (models && models.length > 0) {
                    let bestModelCode = "";
                    for (const m of models) {
                        try {
                            const val = m.getValue();
                            if (val && isLikelyCode(val) && val.length > bestModelCode.length) {
                                bestModelCode = val;
                            }
                        } catch (e) {}
                    }
                    if (!bestModelCode && models.length > 0) {
                        for (const m of models) {
                            try {
                                const val = m.getValue();
                                if (val && val.length > bestModelCode.length) bestModelCode = val;
                            } catch (e) {}
                        }
                    }
                    if (bestModelCode && bestModelCode.trim().length > 0) {
                        return { code: bestModelCode, source: "monaco-model" };
                    }
                }
            }

            // 2. Direct Monaco Instance on DOM nodes
            const editorNodes = document.querySelectorAll(".monaco-editor, [data-mode-id], .CodeMirror, .cm-editor");
            for (const node of editorNodes) {
                const candidateObj = node._editor || node.editor || node._model || node.model || node.monacoEditor || node.monaco;
                if (candidateObj) {
                    if (typeof candidateObj.getValue === "function") {
                        const val = candidateObj.getValue();
                        if (val && val.trim().length > 0) return { code: val, source: "monaco-dom-instance" };
                    }
                    if (candidateObj.getModel && typeof candidateObj.getModel === "function") {
                        const m = candidateObj.getModel();
                        if (m && typeof m.getValue === "function") {
                            const val = m.getValue();
                            if (val && val.trim().length > 0) return { code: val, source: "monaco-dom-model" };
                        }
                    }
                }
            }

            // 3. React Fiber Tree Inspection on Editor Containers (TakeUForward / Next.js)
            const searchNodes = document.querySelectorAll(".monaco-editor, .CodeMirror, .cm-editor, textarea.inputarea, textarea, [class*='editor']");
            for (const node of searchNodes) {
                const fiberKey = Object.keys(node).find(k => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"));
                const propsKey = Object.keys(node).find(k => k.startsWith("__reactProps$"));

                if (propsKey && node[propsKey]) {
                    const p = node[propsKey];
                    if (typeof p.value === "string" && isLikelyCode(p.value)) return { code: p.value, source: "react-props-value" };
                    if (typeof p.code === "string" && isLikelyCode(p.code)) return { code: p.code, source: "react-props-code" };
                }

                if (fiberKey && node[fiberKey]) {
                    let curr = node[fiberKey];
                    let depth = 0;
                    while (curr && depth < 35) {
                        for (const propObj of [curr.memoizedProps, curr.pendingProps]) {
                            if (propObj && typeof propObj === "object") {
                                if (typeof propObj.value === "string" && isLikelyCode(propObj.value)) {
                                    return { code: propObj.value, source: "react-fiber-props-value" };
                                }
                                if (typeof propObj.code === "string" && isLikelyCode(propObj.code)) {
                                    return { code: propObj.code, source: "react-fiber-props-code" };
                                }
                                if (propObj.editor && typeof propObj.editor.getValue === "function") {
                                    try {
                                        const val = propObj.editor.getValue();
                                        if (val && val.trim().length > 0) return { code: val, source: "react-fiber-editor" };
                                    } catch (e) {}
                                }
                                if (propObj.model && typeof propObj.model.getValue === "function") {
                                    try {
                                        const val = propObj.model.getValue();
                                        if (val && val.trim().length > 0) return { code: val, source: "react-fiber-model" };
                                    } catch (e) {}
                                }
                            }
                        }
                        curr = curr.return;
                        depth++;
                    }
                }
            }

            // 4. CodeMirror 5 & CodeMirror 6 Instances
            const cmElems = document.querySelectorAll(".CodeMirror");
            for (const cmElem of cmElems) {
                if (cmElem.CodeMirror && typeof cmElem.CodeMirror.getValue === "function") {
                    const val = cmElem.CodeMirror.getValue();
                    if (val && val.trim().length > 0) return { code: val, source: "codemirror-5" };
                }
            }
            const cm6Elems = document.querySelectorAll(".cm-editor");
            for (const cmElem of cm6Elems) {
                const view = cmElem.cmView || cmElem._view;
                if (view && view.view && view.view.state && view.view.state.doc) {
                    const val = view.view.state.doc.toString();
                    if (val && val.trim().length > 0) return { code: val, source: "codemirror-6" };
                }
            }

            // 5. Global monacoEditor / editor fallbacks
            if (window.monacoEditor && typeof window.monacoEditor.getValue === "function") {
                const val = window.monacoEditor.getValue();
                if (val && val.trim().length > 0) return { code: val, source: "global-monacoEditor" };
            }
            if (window.editor && typeof window.editor.getValue === "function") {
                const val = window.editor.getValue();
                if (val && val.trim().length > 0) return { code: val, source: "global-editor" };
            }

        } catch (e) {
            console.error("[Striver Sync PageScript Error]", e);
        }

        return { code: code, source: source };
    }

    // Listen for requests from isolated content script
    window.addEventListener("STRIVER_SYNC_REQUEST_PAGE_CODE", function (event) {
        const requestId = event.detail ? event.detail.requestId : null;
        const res = extractCodeFromMainWorld();
        window.dispatchEvent(new CustomEvent("STRIVER_SYNC_RESPONSE_PAGE_CODE", {
            detail: {
                requestId: requestId,
                code: res ? res.code : null,
                source: res ? res.source : null
            }
        }));
    });
})();

