# projectlocal-vim

[![Deno 1.11.0 or above](https://img.shields.io/badge/Deno-Support%201.11.0-yellowgreen.svg?logo=deno)](https://github.com/denoland/deno/tree/v1.11.0)
[![Vim 8.1.2424 or above](https://img.shields.io/badge/Vim-Support%208.1.2424-yellowgreen.svg?logo=vim)](https://github.com/vim/vim/tree/v8.1.2424)
[![Neovim 0.4.4 or above](https://img.shields.io/badge/Neovim-Support%200.4.4-yellowgreen.svg?logo=neovim&logoColor=white)](https://github.com/neovim/neovim/tree/v0.4.4)

Load your vim project configurations safely, for vim and neovim. Written in typescript via [denops.vim][denops]

This is a combination of [projectcmd.vim][pcmdvim] and [projectcmd.nvim][pcmdnvim] to unify both plugins to support both
vim and neovim.

__Status: Alpha (Still in testing the waters)__

## Requirements

You will need `deno` installed and have denops.vim plugin:

+ [deno](https://deno.land)
+ [denops.vim][denops]

## Install

### vim-plug

```vim
Plug 'vim-denops/denops.vim'
Plug 'creativenull/projectlocal-vim'
```

### packer.nvim

```lua
use {'creativenull/projectlocal-vim', requires = {'vim-denops/denops.vim'}}
```

## Getting Started



## 

[denops]: https://github.com/vim-denops/denops.vim
[pcmdvim]: https://github.com/creativenull/projectcmd.vim
[pcmdnvim]: https://github.com/creativenull/projectcmd.nvim
