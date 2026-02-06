/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#14b8a6", // Teal
                secondary: "#3b82f6", // Blue
                dark: "#0f172a", // Slate 900
                darker: "#020617", // Slate 950
                card: "#1e293b", // Slate 800
            }
        },
    },
    plugins: [],
}
