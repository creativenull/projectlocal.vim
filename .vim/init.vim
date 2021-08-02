lua << EOF
local dls = require 'diagnosticls-nvim'
dls.setup {
  typescript = {
    formatter = require 'diagnosticls-nvim.formatters.prettier',
  },
}
EOF
