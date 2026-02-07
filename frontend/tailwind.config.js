/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#00f0ff", // Neon Cyan
                    glow: "#00f0ff80",
                },
                secondary: {
                    DEFAULT: "#7000ff", // Neon Purple
                    glow: "#7000ff80",
                },
                accent: "#ff003c", // Cyber Punk Red
                dark: "#050510", // Deep Space Blue/Black
                darker: "#020205", // Almost Black
                card: "#0a0a1f", // Dark Blue-ish Gray
                surface: "#12122a", // Lighter surface
            }
        },
    },
    plugins: [],
}
