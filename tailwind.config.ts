
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Metric', 'Inter', 'system-ui', 'sans-serif'],
				hpe: ['Metric', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				hpe: {
					// HPE 2025 Brand Colors
					brand: 'hsl(var(--hpe-green-brand))',
					'brand-light': 'hsl(var(--hpe-green-light))',
					emphasis: 'hsl(var(--hpe-green-emphasis))',
					
					// HPE Core Palette
					purple: 'hsl(var(--hpe-purple))',
					teal: 'hsl(var(--hpe-teal))',
					blue: 'hsl(var(--hpe-blue))',
					red: 'hsl(var(--hpe-red))',
					orange: 'hsl(var(--hpe-orange))',
					yellow: 'hsl(var(--hpe-yellow))',
					
					// HPE Light Variants
					'purple-light': 'hsl(var(--hpe-purple-light))',
					'teal-light': 'hsl(var(--hpe-teal-light))',
					'blue-light': 'hsl(var(--hpe-blue-light))',
					'red-light': 'hsl(var(--hpe-red-light))',
					'orange-light': 'hsl(var(--hpe-orange-light))',
					'yellow-light': 'hsl(var(--hpe-yellow-light))',
					
					// HPE Grays
					gray: {
						50: 'hsl(var(--hpe-gray-50))',
						100: 'hsl(var(--hpe-gray-100))',
						200: 'hsl(var(--hpe-gray-200))',
						300: 'hsl(var(--hpe-gray-300))',
						400: 'hsl(var(--hpe-gray-400))',
						500: 'hsl(var(--hpe-gray-500))',
						600: 'hsl(var(--hpe-gray-600))',
						700: 'hsl(var(--hpe-gray-700))',
						800: 'hsl(var(--hpe-gray-800))',
						900: 'hsl(var(--hpe-gray-900))',
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				// HPE 2025 Brand Animations
				'hpe-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.02)'
					}
				},
				'hpe-bounce': {
					'0%, 20%, 53%, 80%, 100%': {
						transform: 'translate3d(0, 0, 0)'
					},
					'40%, 43%': {
						transform: 'translate3d(0, -8px, 0)'
					},
					'70%': {
						transform: 'translate3d(0, -4px, 0)'
					},
					'90%': {
						transform: 'translate3d(0, -2px, 0)'
					}
				},
				'hpe-glow': {
					'from': {
						filter: 'drop-shadow(0 0 20px hsl(var(--hpe-green-brand) / 0.6))'
					},
					'to': {
						filter: 'drop-shadow(0 0 40px hsl(var(--hpe-green-emphasis) / 0.8))'
					}
				},
				'hpe-slide-up': {
					'from': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'to': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'hpe-scale-in': {
					'from': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'to': {
						opacity: '1',
						transform: 'scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				// HPE 2025 Brand Animations
				'hpe-pulse': 'hpe-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'hpe-bounce': 'hpe-bounce 1s ease-in-out infinite',
				'hpe-glow': 'hpe-glow 3s ease-in-out infinite alternate',
				'hpe-slide-up': 'hpe-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'hpe-scale-in': 'hpe-scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
