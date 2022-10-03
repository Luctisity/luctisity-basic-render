/// <reference types="vite/client" />

declare module '*?raw' {
    const content: string;
    export default content;
}

declare module '*.html' {
    const content: string;
    export default content;
}