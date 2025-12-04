declare global {
  interface Window {
    __equalityIsUsingLocalStorage: boolean;
    __equalityTheme: string;
  }
}

export {};
