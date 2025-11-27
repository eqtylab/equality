import { atom } from "nanostores";

type Theme = "light" | "dark";

export const theme = atom<Theme>("dark");
