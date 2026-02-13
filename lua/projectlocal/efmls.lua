local utils = require("projectlocal._utils")
local efmls_modpath = "efmls-configs"
local M = {}

local function get_valid_config(name)
  local linter_ok, linter =
    pcall(require, string.format("%s.linters.%s", efmls_modpath, name))
  local formatter_ok, formatter =
    pcall(require, string.format("%s.formatters.%s", efmls_modpath, name))

  if linter_ok then
    return linter
  end

  if formatter_ok then
    return formatter
  end

  utils.err("Not valid configuration found for: " .. name)

  return nil
end

function M.register(raw_list, raw_config)
  local efmls_ok, _ = pcall(require, efmls_modpath)
  if not efmls_ok then
    utils.err(
      "creativenull/efmls-configs-nvim is required to use `efmls` option."
    )
    return
  end

  -- Start parsing list
  local list = vim.fn.json_decode(raw_list)
  local languages = {}

  for lang, tools in pairs(list) do
    languages[lang] = {}

    for _, tool in pairs(tools) do
      local valid_config = get_valid_config(tool)

      if valid_config ~= nil then
        table.insert(languages[lang], valid_config)
      end
    end
  end

  local efmls_config = {
    init_options = {
      documentFormatting = true,
      documentRangeFormatting = true,
    },
    filetypes = vim.tbl_keys(languages),
    settings = {
      rootMarkers = { ".git/" },
      languages = languages,
    },
  }

  -- Setup efm by merging it with user provided config
  if vim.fn.has("nvim-0.11") == 1 then
    -- Use vim.lsp.config() for nvim 0.11 and up
    vim.lsp.config("efm", require("projectlocal.lsp").get_config(efmls_config))
    vim.lsp.enable("efmls")
  else
    -- Check if lspconfig is installed before proceeding
    local lspconfig_ok, _ = pcall(require, "lspconfig")
    if not lspconfig_ok then
      utils.err("neovim/nvim-lspconfig is required to use `efmls` option.")
      return
    end

    require("lspconfig").efm.setup(
      require("projectlocal.lsp").get_config(efmls_config)
    )
  end
end

return M
