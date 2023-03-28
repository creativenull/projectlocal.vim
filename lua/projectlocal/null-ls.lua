local utils = require("projectlocal._utils")
local M = {}

function M.register(raw_list, raw_config)
	local projectlocal = require("projectlocal.lsp")
	local okcall, null_ls, mod

	local list = vim.fn.json_decode(raw_list)
	local config = vim.fn.json_decode(raw_config)
	local null_ls_setup = { on_attach = nil, sources = {} }

	okcall, null_ls = pcall(require, "null-ls")
	if not okcall then
		utils.err("null-ls.nvim is not installed to use the null-ls feature")
		return
	end

	for _, m in pairs(list) do
		okcall, mod = pcall(require, "null-ls.builtins." .. m)

		if not okcall then
			utils.err("null-ls builtin not found: null-ls.builtins." .. m)
		else
			table.insert(null_ls_setup.sources, mod)
		end
	end

	if projectlocal.get_config().on_attach ~= nil then
		null_ls_setup.on_attach = projectlocal.get_config().on_attach
	end

	null_ls.setup(null_ls_setup)
end

return M
