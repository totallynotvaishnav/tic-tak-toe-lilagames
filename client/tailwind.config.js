export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'game-bg': '#faf8ef',
                'tile-bg': '#eee4da',
                'tile-empty': '#cdc1b4',
                'tile-x': '#edc22e',
                'tile-o': '#f59563',
                'text-dark': '#776e65',
                'text-light': '#f9f6f2',
                'button-bg': '#8f7a66',
                'grid-bg': '#bbada0',
            },
            fontFamily: {
                game: ['"Clear Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
            },
            boxShadow: {
                tile: '0 2px 4px rgba(0,0,0,0.1)',
                'tile-hover': '0 4px 8px rgba(0,0,0,0.15)',
                button: '0 2px 6px rgba(0,0,0,0.2)',
            },
            animation: {
                pop: 'pop 0.2s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'win-pulse': 'winPulse 0.6s ease-in-out',
            },
            keyframes: {
                pop: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                winPulse: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
            },
        },
    },
    plugins: [],
};
