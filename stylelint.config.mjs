// A raw visual value fails `yarn lint`; only the theme and the SCSS abstracts, which define the tokens, may hold one.
const KEYWORDS = [
  '0',
  'auto',
  'none',
  'inherit',
  'initial',
  'unset',
  'transparent',
  'currentColor',
  'currentcolor',
  'fit-content',
  'max-content',
  'min-content',
  '/^-?var\\(--/',
  // Math over tokens is fine; a raw length inside it is not (calc(10px + 2px) fails), save the whole box or viewport.
  '/^-?(calc|min|max|minmax|repeat)\\((?!.*\\b(?!100(%|vw|vh|dvh|svh)(?!\\w))\\d+(\\.\\d+)?(px|rem|em|ch|ex|pt|vw|vh|dvh|svh)).*\\)$/',
  // Transparency over a token colour (the drawer veil): rgba(var(--color-…-rgb), 0.4).
  '/^rgba\\(var\\(--/',
  // The device's own inset (iPhone home bar), not a design value.
  '/^env\\(safe-area-inset-/',
  '100vh',
  '100dvh',
]

// Relative to the container, not a step of any scale: only where a share of the box makes sense.
const SHARE = [...KEYWORDS, '/^\\d+(\\.\\d+)?%$/']

const TOKENIZED = [
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  '/^margin/',
  '/^padding/',
  '/^(row-|column-)?gap$/',
  'color',
  '/^background/',
  'fill',
  'stroke',
  'border-radius',
  '/^border-.*-radius$/',
  '/^border(-(top|right|bottom|left|inline|block))?-color$/',
  '/^outline-color$/',
  '/^(min-|max-)?(width|height)$/',
  'flex-basis',
  'flex',
  'z-index',
  'box-shadow',
  'outline-offset',
  '/^text-(underline-offset|decoration-thickness)$/',
  '/^(transition|animation)(-duration|-delay)?$/',
  'grid-template-columns',
  'grid-template-rows',
  '/^(top|right|bottom|left|inset)$/',
]

export default {
  customSyntax: 'postcss-scss',
  overrides: [{ files: ['**/*.vue'], customSyntax: 'postcss-html' }],
  ignoreFiles: ['src/assets/scss/themes/**', 'src/assets/scss/abstracts/**', 'src/assets/scss/base/**', 'src/graphify-out/**', 'dist/**'],
  plugins: ['stylelint-declaration-strict-value', 'stylelint-scss'],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      TOKENIZED,
      {
        // Grow and shrink factors and fr fractions are ratios, not lengths.
        ignoreValues: {
          '': KEYWORDS,
          flex: [...SHARE, '/^\\d+$/'],
          'flex-basis': SHARE,
          // Shadows come from the theme; a ring over a token colour is drawn like a border, a hairline width is fine.
          'box-shadow': [...KEYWORDS, 'inset', '/^-?[1-3]px$/'],
          '/^(min-|max-)?(width|height)$/': SHARE,
          '/^(top|right|bottom|left|inset)$/': SHARE,
          // A circle: 50% of the box, not a radius step.
          'border-radius': [...KEYWORDS, '50%'],
          '/^border-.*-radius$/': [...KEYWORDS, '50%'],
          // The shimmer slides a gradient twice the box wide.
          '/^background/': SHARE,
          // The property names in a transition or animation are words; only its durations must be tokens.
          '/^(transition|animation)(-duration|-delay)?$/': [...KEYWORDS, '/^[a-z-]+$/'],
          'grid-template-columns': [...KEYWORDS, '/^\\d+(\\.\\d+)?fr$/'],
          'grid-template-rows': [...KEYWORDS, '/^\\d+(\\.\\d+)?fr$/'],
        },
        // Border and outline shorthands: only their colour is checked; widths (1px, 2px) are hairlines, not scale.
        expandShorthand: true,
        // Functions are checked too: rgb(0, 0, 0) is as raw as #000.
        ignoreFunctions: false,
        // A local $size would hide a raw value from this rule; the SCSS abstracts own every variable.
        ignoreVariables: false,
        disableFix: true,
        message: '"${property}: ${value}" is a raw value: use a token (var(--…)) from _ecos.scss.',
      },
    ],
    // `font: { size: … }` and the font shorthand would carry a raw value past the longhand checks above.
    'scss/declaration-nested-properties': 'never',
    'property-disallowed-list': ['font'],
    'scss/dollar-variable-pattern': ['^bp-', { message: 'Variables live in the SCSS abstracts; use a token here.' }],
    // Breakpoints come from abstracts/_breakpoints.scss: CSS variables do not work inside @media.
    'media-feature-name-value-allowed-list': {
      'min-width': ['/^\\$bp-/'],
      'max-width': ['/^\\$bp-/'],
      width: ['/^\\$bp-/'],
      'min-height': ['/^\\$bp-/'],
      'max-height': ['/^\\$bp-/'],
    },
  },
}
