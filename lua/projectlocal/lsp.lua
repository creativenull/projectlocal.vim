local M = {}
local global_lsp_opts = {}

---Print error message to command line
---@param msg string
---@return nil
local function err(msg)
  vim.api.nvim_err_writeln(string.format('[projectlocal-vim] %s', msg))
end

---Validate default lsp config
---@param opts table
---@return nil
local function validate_default_opts(opts)
  vim.validate({
    on_attach = {opts.on_attach, 'function'},
    capabilities = {opts.capabilities, 'table'}
  })
end

---Validate server config from projectlocal JSON file
---@param config table
---@return table
local function validate_server_config(config)
  local is_table_or_nil = function(var)
    return type(var) ~= 'table' or type(var) ~= 'nil'
  end

  vim.validate({
    init_options = {config.init_options, is_table_or_nil},
    settings = {config.settings, is_table_or_nil},
    root_dir = {config.root_dir, is_table_or_nil},
  })

  return config
end

---Setup basic LSP config to be applied
---to all LSP servers
---@param default_opts table
---@return nil
function M.setup(default_opts)
  local ok, _ = pcall(validate_default_opts, default_opts)

  if not ok then
    err('Invalid default lsp options')
    return
  end

  global_lsp_opts = vim.tbl_extend('force', global_lsp_opts, default_opts)
end

---Register LSP servers provided by a JSON string
---@param servers string
---@return nil
function M.register_lspservers(servers)
  local decoded_servers = vim.fn.json_decode(servers)
  -- print(vim.inspect(decoded_servers))
  local ok, nvimlsp = pcall(require, 'lspconfig')

  if not ok then
    err('`nvim-lspconfig` plugin not installed')
    return
  end

  for _, server in pairs(decoded_servers) do
    if server.name == nil then
      err('invalid setup provided, `name` is required')
      return
    end

    local name = server.name
    local ok, config = pcall(validate_server_config, server)
    if not ok then
      err('Invalid LSP config passed to server')
      break
    end

    -- Convert from table to function
    config.root_dir = nvimlsp.util.root_pattern(unpack(config.root_dir))

    -- Register the LSP
    nvimlsp[name].setup(vim.tbl_extend('force', config, global_lsp_opts))
  end
end

return M
