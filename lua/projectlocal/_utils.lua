local M = {}

M.plugin_name = "projectlocal.vim"

---Print error message to command line
---@param msg string
---@return nil
function M.err(msg)
	local error_msg = string.format("[%s] %s", M.plugin_name, msg)
	vim.api.nvim_echo({ { error_msg, "ErrorMsg" } }, true, {})
end

return M
