" Powered by projectlocal-vim
" https://github.com/creativenull/projectlocal-vim
augroup projectlocal_events
  autocmd!
  autocmd FileType typescript let b:ale_linters = ['deno'] | let b:ale_fixers = ['prettier']
augroup END
