declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare global {
  interface Window {
    __equalityIsUsingLocalStorage: boolean;
    __equalityTheme: string;
  }
}

export {};
