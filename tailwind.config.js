/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { fontFamily: { display: ['Manrope', 'sans-serif'] }, colors: { ink: '#202236', muted: '#85879a', lilac: '#7568ec', canvas: '#f7f8fc' }, boxShadow: { card: '0 10px 35px rgba(31, 34, 58, .06)' } } },
  plugins: [],
}
