-- Powered by projectlocal-vim
-- https://github.com/creativenull/projectlocal-vim
local success, dls = pcall(require, 'diagnosticls-configs-nvim')
if success then
  dls.setup {
    typescript = {
      formatter = require('diagnosticls-configs.formatters.prettier'),
    },
  }
end
