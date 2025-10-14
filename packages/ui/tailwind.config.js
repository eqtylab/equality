/** @type {import('tailwindcss').Config} */
export default {
  // Scope all utilities under `.equality` so library styles don’t leak
  important: '.equality',
  content: ['./src/**/*.{ts,tsx}'],
};
