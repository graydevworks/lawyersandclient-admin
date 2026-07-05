export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand-blue', // Give your custom color a unique name
      neutral: 'slate'
    }
  },
  // Extend the Tailwind theme to map your new name to the hex code
  theme: {
    extend: {
      colors: {
        'brand-blue': '#002f53'
      }
    }
  }
})
