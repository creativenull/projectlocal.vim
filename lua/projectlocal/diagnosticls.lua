local M = {}

---Print error message to command line
---@param msg string
---@return nil
local function err(msg)
	vim.api.nvim_err_writeln(string.format("[projectlocal-vim] %s", msg))
end

function M.register(raw_list, raw_config)
	local okcall, diagnosticls, lintermod, formattermod

	local list = vim.fn.json_decode(raw_list)
	local config = vim.fn.json_decode(raw_config)
	local diagnosticls_setup = {}

	okcall, diagnosticls = pcall(require, "diagnosticls-configs")
	if not okcall then
		err("diagnosticls-configs-nvim is not installed to use the diagnosticls feature")
		return
	end

	for lang, lang_config in pairs(list) do
		local setup_list = { linter = nil, formatter = nil }

		if type(lang_config.linter) == "string" then
			okcall, lintermod = pcall(require, "diagnosticls-configs.linters." .. lang_config.linter)

			if okcall then
				setup_list.linter = lintermod
			end
		elseif type(lang_config.linter) == "table" then
			setup_list.linter = {}

			for _, value in pairs(lang_config.linter) do
				okcall, lintermod = pcall(require, "diagnosticls-config.linters." .. value)

				if okcall then
					table.insert(setup_list.linter, lintermod)
				end
			end
		end

		if type(lang_config.formatter) == "string" then
			okcall, formattermod = pcall(require, "diagnosticls-configs.formatters." .. lang_config.formatter)

			if okcall then
				setup_list.formatter = formattermod
			end
		elseif type(lang_config.formatter) == "table" then
			setup_list.formatter = {}

			for _, value in pairs(lang_config.formatter) do
				okcall, formattermod = pcall(require, "diagnosticls-config.formatters." .. value)

				if okcall then
					table.insert(setup_list.formatter, formattermod)
				end
			end
		end

		diagnosticls_setup[lang] = setup_list
	end

	diagnosticls.setup(diagnosticls_setup)
end

return M
