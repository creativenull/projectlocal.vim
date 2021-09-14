let g:ale_linters = {}
let g:ale_linters.typescript = ['deno']

let g:ale_fixers = {}
let g:ale_fixers.typescript = ['prettier']

lua <<EOF
local success, dls = pcall(require, 'diagnosticls-configs')
if success then
  dls.setup({
    typescript = {
      formatter = require('diagnosticls-configs.formatters.prettier'),
    },
  })
end
EOF
