import { defineConfig, presetWind3, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
  ],
  safelist: [
    // Progress colors for worklog
    'bg-gray-300',
    'bg-red-600',
    'bg-orange-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-400',
    'bg-red-400',
    // Category colors
    'bg-blue-100', 'text-blue-800',
    'bg-green-100', 'text-green-800',
    'bg-yellow-100', 'text-yellow-800',
    'bg-purple-100', 'text-purple-800',
    'bg-pink-100', 'text-pink-800',
    'bg-indigo-100', 'text-indigo-800',
    'bg-gray-100', 'text-gray-800',
    'bg-orange-100', 'text-orange-800',
    'bg-teal-100', 'text-teal-800',
    'bg-red-100', 'text-red-800',
  ],
})