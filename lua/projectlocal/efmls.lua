local utils = require('projectlocal._utils')
local M = {}

function M.register(raw_list, raw_config)
  local linters_path = 'efmls-configs.linters.'
  local formatters_path = 'efmls-configs.formatters.'
	local okcall, efmls, lintermod, formattermod

	local list = vim.fn.json_decode(raw_list)
	local config = vim.fn.json_decode(raw_config)
	local efmls_setup = {}

	okcall, efmls = pcall(require, "efmls-configs")
	if not okcall then
		utils.err("efmls-configs-nvim is required to use this feature")
		return
	end

	for lang, lang_config in pairs(list) do
		local setup_list = { linter = nil, formatter = nil }

		if type(lang_config.linter) == "string" then
			okcall, lintermod = pcall(require, linters_path .. lang_config.linter)

			if not okcall then
        utils.err("Failed to load linter for efmls: " .. lang_config.linter)
      else
				setup_list.linter = lintermod
			end
		elseif type(lang_config.linter) == "table" then
			setup_list.linter = {}

			for _, value in pairs(lang_config.linter) do
				okcall, lintermod = pcall(require, linters_path .. value)

				if not okcall then
          utils.err("Failed to load linter for efmls: " .. value)
        else
					table.insert(setup_list.linter, lintermod)
				end
			end
		end

		if type(lang_config.formatter) == "string" then
			okcall, formattermod = pcall(require, formatters_path .. lang_config.formatter)

			if not okcall then
        utils.err("Failed to load formatter for efmls: " .. lang_config.formatter)
      else
				setup_list.formatter = formattermod
			end
		elseif type(lang_config.formatter) == "table" then
			setup_list.formatter = {}

			for _, value in pairs(lang_config.formatter) do
				okcall, formattermod = pcall(require, formatters_path .. value)

				if not okcall then
          utils.err("Failed to load formatter for efmls: " .. value)
        else
					table.insert(setup_list.formatter, formattermod)
				end
			end
		end

		efmls_setup[lang] = setup_list
	end

  -- Safely call setup
	pcall(efmls.setup, efmls_setup)
end

return M
