import stylelint from 'stylelint'

import { judgeComment } from './eslint/no-comments.ts'

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
  '/^-?(calc|min|max|minmax|repeat)\\((?!.*\\b(?!100(%|vw|vh|dvh|svh)(?!\\w))\\d+(\\.\\d+)?(px|rem|em|ch|ex|pt|vw|vh|dvh|svh)).*\\)$/',
  '/^rgba\\(var\\(--/',
  '/^env\\(safe-area-inset-/',
  '100vh',
  '100dvh',
]

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

const NO_COMMENTS = 'local/no-comments'
const noCommentsMessages = stylelint.utils.ruleMessages(NO_COMMENTS, {
  comment:
    'Comentário no código é proibido: só título de seção ou de bloco, curto, em uma linha só. O porquê vai no commit ou na doc.',
  portuguese: 'Título de seção em português: escreva em inglês.',
})

const noComments = stylelint.createPlugin(NO_COMMENTS, (enabled) => (root, result) => {
  if (!enabled) return
  root.walkComments((comment) => {
    const first = comment.parent.type === 'root' && comment.parent.first === comment
    const next = comment.next()
    const startsLine = first || comment.raws.before.includes('\n')
    const endsLine = comment.raws.inline || (next ? next.raws.before.includes('\n') : true)
    const text = comment.raws.inline ? comment.text : `${comment.raws.left}${comment.text}${comment.raws.right}`
    const verdict = judgeComment(text, startsLine && endsLine)
    if (verdict !== 'allowed')
      stylelint.utils.report({ ruleName: NO_COMMENTS, result, node: comment, message: noCommentsMessages[verdict] })
  })
  root.walkDecls((decl) => {
    const raw = decl.raws.value?.raw ?? ''
    for (const match of raw.matchAll(/(?<!:)\/\/[^\n]*|\/\*[\s\S]*?\*\//g)) {
      const lineStart = raw.lastIndexOf('\n', match.index) + 1
      let lineEnd = raw.indexOf('\n', match.index + match[0].length)
      if (lineEnd === -1) lineEnd = raw.length
      const alone =
        !raw.slice(lineStart, match.index).trim() && !raw.slice(match.index + match[0].length, lineEnd).trim()
      const text = match[0].startsWith('//') ? match[0].slice(2) : match[0].slice(2, -2)
      const verdict = judgeComment(text, alone)
      if (verdict !== 'allowed')
        stylelint.utils.report({ ruleName: NO_COMMENTS, result, node: decl, message: noCommentsMessages[verdict] })
    }
  })
})

const TOKEN_SOURCES = ['src/assets/scss/themes/**', 'src/assets/scss/abstracts/**', 'src/assets/scss/base/**']

export default {
  customSyntax: 'postcss-scss',
  overrides: [
    { files: ['**/*.vue'], customSyntax: 'postcss-html' },
    {
      files: TOKEN_SOURCES,
      rules: {
        'scale-unlimited/declaration-strict-value': null,
        'scss/dollar-variable-pattern': null,
        'media-feature-name-value-allowed-list': null,
      },
    },
  ],
  ignoreFiles: ['src/graphify-out/**', 'dist/**'],
  plugins: ['stylelint-declaration-strict-value', 'stylelint-scss', noComments],
  rules: {
    [NO_COMMENTS]: true,
    'scale-unlimited/declaration-strict-value': [
      TOKENIZED,
      {
        ignoreValues: {
          '': KEYWORDS,
          flex: [...SHARE, '/^\\d+$/'],
          'flex-basis': SHARE,
          'box-shadow': [...KEYWORDS, 'inset', '/^-?[1-3]px$/'],
          '/^(min-|max-)?(width|height)$/': SHARE,
          '/^(top|right|bottom|left|inset)$/': SHARE,
          'border-radius': [...KEYWORDS, '50%'],
          '/^border-.*-radius$/': [...KEYWORDS, '50%'],
          '/^background/': SHARE,
          '/^(transition|animation)(-duration|-delay)?$/': [...KEYWORDS, '/^[a-z-]+$/'],
          'grid-template-columns': [...KEYWORDS, '/^\\d+(\\.\\d+)?fr$/'],
          'grid-template-rows': [...KEYWORDS, '/^\\d+(\\.\\d+)?fr$/'],
        },
        expandShorthand: true,
        ignoreFunctions: false,
        ignoreVariables: false,
        disableFix: true,
        message: '"${property}: ${value}" is a raw value: use a token (var(--…)) from _ecos.scss.',
      },
    ],
    'scss/declaration-nested-properties': 'never',
    'property-disallowed-list': ['font'],
    'scss/dollar-variable-pattern': ['^bp-', { message: 'Variables live in the SCSS abstracts; use a token here.' }],
    'media-feature-name-value-allowed-list': {
      'min-width': ['/^\\$bp-/'],
      'max-width': ['/^\\$bp-/'],
      width: ['/^\\$bp-/'],
      'min-height': ['/^\\$bp-/'],
      'max-height': ['/^\\$bp-/'],
    },
  },
}
