if exists('g:loaded_projectlocal')
  finish
endif

command! -nargs=? ProjectLocalConfig call denops#notify('projectlocal', 'open', [<q-args>])
command! -nargs=0 ProjectLocalLoad call denops#notify('projectlocal', 'load', [])
command! -nargs=0 ProjectLocalAutoloadEnable call denops#notify('projectlocal', 'autoloadEnable', [])
command! -nargs=0 ProjectLocalAutoloadDisable call denops#notify('projectlocal', 'autoloadDisable', [])

augroup ProjectLocalEvents
autocmd ProjectLocalEvents User DenopsPluginPost:projectlocal call denops#notify('projectlocal', 'discover', [])
autocmd ProjectLocalEvents DirChanged * call denops#notify('projectlocal', 'discover', [])

let g:loaded_projectlocal = 1
