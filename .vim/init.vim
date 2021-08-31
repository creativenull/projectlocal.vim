lua << EOF
local mod, errmsg = pcall(require, 'lspconfig')
if not mod then
  return
end

local dls = require 'diagnosticls-configs-nvim'
dls.setup {
  typescript = {
    formatter = require 'diagnosticls-configs.formatters.prettier',
  },
}
EOF

augroup pl_events
  au!
  au FileType typescript let b:ale_linters = ['deno'] | let b:ale_fixers = ['prettier']
augroup END
