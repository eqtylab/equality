/** EQTY Lab brand files, served from the package so no site has to copy them into `public/`. */
import type { APIRoute } from 'astro';

import eqtyLogo from '../assets/eqty-logo.svg?raw';
// `?inline`, not `?url`: a URL would point into the consumer's build output, which the
// endpoint cannot read back at prerender time. The data URL carries the bytes themselves.
import favicon from '../assets/favicon.png?inline';
import github from '../assets/github.svg?raw';
import ogImage from '../assets/og-image.jpg?inline';

const dataUrlBytes = (dataUrl: string) => Buffer.from(dataUrl.split(',')[1], 'base64');

const ASSETS: Record<string, { body: string | Buffer; type: string }> = {
  'eqty-logo.svg': { body: eqtyLogo, type: 'image/svg+xml' },
  'favicon.png': { body: dataUrlBytes(favicon), type: 'image/png' },
  'github.svg': { body: github, type: 'image/svg+xml' },
  'og-image.jpg': { body: dataUrlBytes(ogImage), type: 'image/jpeg' },
};

export function getStaticPaths() {
  return Object.keys(ASSETS).map((file) => ({ params: { file } }));
}

export const GET: APIRoute = ({ params }) => {
  const { body, type } = ASSETS[params.file as string];
  return new Response(body, { headers: { 'Content-Type': type } });
};
