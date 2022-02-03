if exists('g:loaded_projectlocal')
  finish
endif

command! -nargs=? PLConfig call denops#notify('projectlocal', 'openLocalConfig', [<q-args>])
command! -nargs=0 PLLoad call denops#notify('projectlocal', 'load', [])
command! -nargs=0 PLAutoloadEnable call denops#notify('projectlocal', 'enable', [])
command! -nargs=0 PLAutoloadDisable call denops#notify('projectlocal', 'disable', [])

autocmd! User DenopsPluginPost:projectlocal call denops#notify('projectlocal', 'autosource', [])

let g:loaded_projectlocal = 1
