/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // New warm, human-centric color palette
                primary: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc7fb',
                    400: '#36a5f7',
                    500: '#3A79D0', // Soft Blue - Primary
                    600: '#2d5fa3',
                    700: '#254b87',
                    800: '#1f3f6f',
                    900: '#1a355d',
                },
                secondary: {
                    50: '#f6f7f8',
                    100: '#edeef0',
                    200: '#d5d9de',
                    300: '#b0b9c2',
                    400: '#8594a1',
                    500: '#63707D', // Muted Gray - Secondary
                    600: '#4f5a65',
                    700: '#424b54',
                    800: '#3a4147',
                    900: '#33383d',
                },
                success: {
                    50: '#f0f9f0',
                    100: '#dcf2dc',
                    200: '#bce4bc',
                    300: '#8dd08d',
                    400: '#56A55A', // Soft Green - Success
                    500: '#4a8f4a',
                    600: '#3d733d',
                    700: '#335c33',
                    800: '#2b4a2b',
                    900: '#243d24',
                },
                warning: {
                    50: '#fefbf0',
                    100: '#fdf4d9',
                    200: '#fbe8b3',
                    300: '#f7d680',
                    400: '#D9A636', // Light Amber - Warning
                    500: '#c4942e',
                    600: '#a47a25',
                    700: '#84611e',
                    800: '#6d4f19',
                    900: '#5a4216',
                },
                error: {
                    50: '#fdf2f3',
                    100: '#fbe6e8',
                    200: '#f5d1d6',
                    300: '#edb3bb',
                    400: '#D35B6B', // Soft Red - Error
                    500: '#c04d5c',
                    600: '#a03f4b',
                    700: '#84343e',
                    800: '#6e2c34',
                    900: '#5b252b',
                },
                // Background and text colors
                background: {
                    50: '#FAFAFA', // Light Background
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                },
                text: {
                    primary: '#333333', // Primary text color
                    secondary: '#5A5A5A', // Secondary text color
                    muted: '#9e9e9e',
                    light: '#f5f5f5',
                },
                // Legacy color support (keeping for backward compatibility)
                blue: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc7fb',
                    400: '#36a5f7',
                    500: '#3A79D0',
                    600: '#2d5fa3',
                    700: '#254b87',
                    800: '#1f3f6f',
                    900: '#1a355d',
                },
                gray: {
                    50: '#f6f7f8',
                    100: '#edeef0',
                    200: '#d5d9de',
                    300: '#b0b9c2',
                    400: '#8594a1',
                    500: '#63707D',
                    600: '#4f5a65',
                    700: '#424b54',
                    800: '#3a4147',
                    900: '#33383d',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.5' }],
                'sm': ['0.875rem', { lineHeight: '1.5' }],
                'base': ['1rem', { lineHeight: '1.5' }],
                'lg': ['1.125rem', { lineHeight: '1.5' }],
                'xl': ['1.25rem', { lineHeight: '1.5' }],
                '2xl': ['1.5rem', { lineHeight: '1.5' }],
                '3xl': ['1.875rem', { lineHeight: '1.5' }],
                '4xl': ['2.25rem', { lineHeight: '1.5' }],
            },
            fontWeight: {
                'normal': '400',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
            },
            lineHeight: {
                'relaxed': '1.5',
                'comfortable': '1.6',
            },
            animation: {
                'fade-in': 'fadeIn 300ms ease-out',
                'slide-up': 'slideUp 300ms ease-out',
                'slide-down': 'slideDown 300ms ease-out',
                'scale-in': 'scaleIn 200ms ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                'sm': '6px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
            },
            boxShadow: {
                'soft': '0 4px 6px rgba(0, 0, 0, 0.1)',
                'medium': '0 8px 16px rgba(0, 0, 0, 0.1)',
                'large': '0 16px 32px rgba(0, 0, 0, 0.1)',
                'button': '0 4px 6px rgba(0, 0, 0, 0.1)',
                'card': '0 4px 8px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 8px 16px rgba(0, 0, 0, 0.1)',
            },
            transitionDuration: {
                '200': '200ms',
                '300': '300ms',
                '400': '400ms',
            },
            transitionTimingFunction: {
                'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
                'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            scale: {
                '105': '1.05',
                '110': '1.10',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
