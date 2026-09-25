/** EQTY Lab brand files, served from the package so no site has to copy them into `public/`. */
import type { APIRoute } from 'astro';

import eqtyLogo from '../assets/eqty-logo.svg?raw';
import favicon from '../assets/favicon.svg?raw';
import github from '../assets/github.svg?raw';

const ASSETS: Record<string, string> = {
  'eqty-logo': eqtyLogo,
  favicon,
  github,
};

export function getStaticPaths() {
  return Object.keys(ASSETS).map((name) => ({ params: { name } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(ASSETS[params.name as string], {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
