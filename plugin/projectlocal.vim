if exists('g:loaded_projectlocal')
  finish
endif

command! PLConfig call denops#notify('projectlocal', 'openLocalConfig', [])
command! PLLoad call denops#notify('projectlocal', 'load', [])
command! PLAutoloadEnable call denops#notify('projectlocal', 'enable', [])
command! PLAutoloadDisable call denops#notify('projectlocal', 'disable', [])

autocmd! User DenopsPluginPost:projectlocal call denops#notify('projectlocal', 'autosource', [])

let g:loaded_projectlocal = 1
