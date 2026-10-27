declare global {
  var process: { env: { NODE_ENV?: string } };

  interface Window {
    __equalityIsUsingLocalStorage: boolean;
    __equalityTheme: string;
  }
}

export {};
