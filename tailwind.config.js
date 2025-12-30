/** * Helper para tornar a config mais limpa.
 * Transforma t('--color-primary-rgb') em 'rgb(var(--color-primary-rgb) / <alpha-value>)'
 */
const t = (varName) => `rgb(var(${varName}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Mapeamento SEMÂNTICO (Use estas classes no seu HTML)

                // Estrutura
                bg: t('--color-bg-rgb'),          // class="bg-bg" (pode renomear para 'background' se preferir)
                surface: t('--color-surface-rgb'), // class="bg-surface"
                border: t('--color-border-rgb'),   // class="border-border"

                // Texto
                text: {
                    DEFAULT: t('--color-text-rgb'),       // class="text-text"
                    secondary: t('--color-text-secondary-rgb'), // class="text-text-secondary"
                    muted: t('--color-text-muted-rgb'),   // class="text-text-muted"
                },

                // Ações e Estados
                primary: {
                    DEFAULT: t('--color-primary-rgb'),    // class="bg-primary text-primary"
                    hover: t('--color-primary-hover-rgb'),
                    active: t('--color-primary-active-rgb'),
                    foreground: t('--on-primary-rgb'),    // class="text-primary-foreground" (para texto dentro do botão)
                },
                secondary: {
                    DEFAULT: t('--color-secondary-rgb'),
                    foreground: t('--on-secondary-rgb'),
                },
                link: t('--color-link-rgb'),
                focus: t('--color-focus-rgb'),

                // Feedback
                success: {
                    DEFAULT: t('--color-success-rgb'),
                    foreground: t('--on-success-rgb'),
                },
                warning: {
                    DEFAULT: t('--color-warning-rgb'),
                    foreground: t('--on-warning-rgb'),
                },
                danger: {
                    DEFAULT: t('--color-danger-rgb'),
                    foreground: t('--on-danger-rgb'),
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}