if exists('g:loaded_projectlocal')
  finish
endif

command! -nargs=? ProjectLocalConfig call denops#notify('projectlocal', 'openLocalConfig', [<q-args>])
command! -nargs=0 ProjectLocalLoad call denops#notify('projectlocal', 'load', [])
command! -nargs=0 ProjectLocalAutoloadEnable call denops#notify('projectlocal', 'enable', [])
command! -nargs=0 ProjectLocalAutoloadDisable call denops#notify('projectlocal', 'disable', [])

command! -nargs=? PLConfig call denops#notify('projectlocal', 'openLocalConfig', [<q-args>])
command! -nargs=0 PLLoad call denops#notify('projectlocal', 'load', [])
command! -nargs=0 PLAutoloadEnable call denops#notify('projectlocal', 'enable', [])
command! -nargs=0 PLAutoloadDisable call denops#notify('projectlocal', 'disable', [])

augroup projectlocal_events
  au!
  autocmd User DenopsPluginPost:projectlocal call denops#notify('projectlocal', 'autosource', [])
  autocmd DirChanged * call denops#notify('projectlocal', 'autosource', [])
augroup END

let g:loaded_projectlocal = 1
