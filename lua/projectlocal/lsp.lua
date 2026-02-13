local utils = require("projectlocal._utils")
local M = {}
local global_lsp_opts = {
  on_attach = nil,
  capabilities = nil,
}

---Validate default lsp config
---@param opts table
---@return nil
local function validate_default_opts(opts)
  if vim.fn.has("nvim-0.11") == 1 then
    vim.validate("on_attach", opts.on_attach, "function")
    vim.validate("capabilities", opts.capabilities, "table")
  else
    vim.validate({
      on_attach = { opts.on_attach, "function" },
      capabilities = { opts.capabilities, "table" },
    })
  end
end

---Validate server config from projectlocal JSON file
---@param config table
---@return table
local function validate_server_config(config)
  local is_table_or_nil = function(var)
    return type(var) ~= "table" or type(var) ~= "nil"
  end

  local is_bool_or_nil = function(var)
    return type(var) ~= "boolean" or type(var) ~= "nil"
  end

  if vim.fn.has("nvim-0.11") == 1 then
    vim.validate("init_options", config.init_options, is_table_or_nil)
    vim.validate("root_dir", config.root_dir, is_table_or_nil)
    vim.validate("settings", config.settings, is_table_or_nil)
    vim.validate("single_file_support", config.flags, is_bool_or_nil)
    vim.validate("filetypes", config.filetypes, is_table_or_nil)
  else
    vim.validate({
      init_options = { config.init_options, is_table_or_nil },
      root_dir = { config.root_dir, is_table_or_nil },
      settings = { config.settings, is_table_or_nil },
      single_file_support = { config.flags, is_bool_or_nil },
      filetypes = { config.filetypes, is_table_or_nil },
    })
  end

  return config
end

---Setup basic LSP config to be applied
---to all LSP servers
---@param default_opts table
---@return nil
function M.setup(default_opts)
  local ok, _ = pcall(validate_default_opts, default_opts)

  if not ok then
    utils.err("Invalid default lsp options")
    return
  end

  global_lsp_opts = vim.tbl_extend("force", global_lsp_opts, default_opts)
end

---Register LSP servers provided by a JSON string
---@param raw_server string
---@param raw_config string
---@return nil
function M.register(raw_servers, raw_config)
  local config = vim.fn.json_decode(raw_config)
  local servers = vim.fn.json_decode(raw_servers)

  local lspok, nvimlsp = pcall(require, "lspconfig")
  if not lspok then
    utils.err("`nvim-lspconfig` plugin not installed")
    return
  end

  for _, server in pairs(servers) do
    if type(server) == "string" then
      if vim.fn.has('nvim-0.11') == 1 then
        vim.lsp.config(server, global_lsp_opts)
      else
        nvimlsp[server].setup(global_lsp_opts)
      end
    elseif type(server) == "table" then
      local ok, reason, config

      if vim.fn.has("nvim-0.11") == 1 then
        ok, reason = pcall(vim.validate, "name", server.name, "string")
        ok, reason = pcall(vim.validate, "config", server.config, function(v)
          return type(v) == "table" or type(v) == "nil"
        end)
      else
        ok, reason = pcall(vim.validate, {
          name = { server.name, "string" },
          config = {
            server.config,
            function(v)
              return type(v) == "table" or type(v) == "nil"
            end,
          },
        })
      end

      if not ok then
        utils.err("Failed validation: `name` and `config` keys are required")
        break
      end

      ok, reason = pcall(validate_server_config, server.config)
      if not ok then
        utils.err(
          "Failed validation: `config` properties must have valid fields or left empty: `init_options` (list), `root_dir` (list), `settings` (list), `single_file_support` (boolean), `filetypes` (list)"
        )
        break
      end

      config = server.config

      -- Unpack array into func args for root_dir
      if config.root_dir then
        config.root_dir = nvimlsp.util.root_pattern(unpack(config.root_dir))
      end

      if vim.fn.has('nvim-0.11') == 1 then
        vim.lsp.config(server.name, vim.tbl_extend("force", config, global_lsp_opts))
      else
        -- Safely register LSPs, let lspconfig complain if needed
        pcall(
          nvimlsp[server.name].setup,
          vim.tbl_extend("force", config, global_lsp_opts)
        )
      end
    end
  end
end

---Get the user config provided in setup() that
---needs to be passed for every LSP server, and
---provide extra options if needed
---@param extended_opts table
---@return table
function M.get_config(extended_opts)
  if extended_opts == nil or extended_opts == {} then
    return global_lsp_opts
  else
    return vim.tbl_extend("force", global_lsp_opts, extended_opts)
  end
end

return M
