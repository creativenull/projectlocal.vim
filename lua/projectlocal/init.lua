local M = {}

local lspconfig = {
  on_attach = nil,
  capabilities = nil
}

function M.setup(config)
  lspconfig.on_attach = config.on_attach
  lspconfig.capabilities = config.capabilities
end

function M.run(config_filepath)
  -- Decode JSON to string


  -- Structure out builtin lsp table, if any


  -- Assign vim.g vars, if any


  local ok, lsp = pcall(require, 'lspconfig')

  if not ok then
    vim.api.nvim_err_writeln('[PROJECTLOCAL] `nvim-lspconfig` plugin not installed')
    return
  end

  for _, lspserver in pairs(list) do
    lsp[lspserver.name].setup(vim.tbl_extend('force', lspconfig, lspserver.opts))
  end
end

return M
