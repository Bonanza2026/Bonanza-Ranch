// Explicit Markdown requests with a positive HTTP quality value. Browser Accept
// headers and text/markdown;q=0 keep receiving the normal HTML representation.
export const markdownAcceptPattern = '(^|.*,\\s*)\\s*[Tt][Ee][Xx][Tt]/[Mm][Aa][Rr][Kk][Dd][Oo][Ww][Nn](\\s*;\\s*[Qq]=(1(\\.0{0,3})?|0\\.([1-9][0-9]{0,2}|0[1-9][0-9]?|00[1-9])))?\\s*(,.*|$)';

export const acceptsMarkdown = (value) => new RegExp(markdownAcceptPattern).test(value || '');
export const markdownPath = (path) => `/_agent-markdown${path}.md`;
