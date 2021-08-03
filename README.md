# projectlocal-vim

[![Deno 1.11.0 or above](https://img.shields.io/badge/Deno-Support%201.11.0-yellowgreen.svg?logo=deno)](https://github.com/denoland/deno/tree/v1.11.0)
[![Vim 8.1.2424 or above](https://img.shields.io/badge/Vim-Support%208.1.2424-yellowgreen.svg?logo=vim)](https://github.com/vim/vim/tree/v8.1.2424)
[![Neovim 0.4.4 or above](https://img.shields.io/badge/Neovim-Support%200.4.4-yellowgreen.svg?logo=neovim&logoColor=white)](https://github.com/neovim/neovim/tree/v0.4.4)

Load your vim project configurations safely, for vim and neovim. Written in typescript via [denops.vim][denops]

This is a combination of [projectcmd.vim][pcmdvim] and [projectcmd.nvim][pcmdnvim] with the aim to unify both plugins to
support both vim and neovim.

__Status: Alpha (Still testing the waters with denops but use at your own discretion 😃)__

## Examples

## Requirements

+ [deno](https://deno.land)
+ [denops.vim][denops]
+ Vim 8.2 and up (check `:version`)
+ Neovim 0.4.4 and up (check `:version`)

## Install

First follow the guide to [install deno](https://deno.land) in your machine. Then follow instructions below to install
the plugin.

### vim-plug

```vim
Plug 'vim-denops/denops.vim'
Plug 'creativenull/projectlocal-vim'
```

### packer.nvim

```lua
use {'creativenull/projectlocal-vim', requires = {'vim-denops/denops.vim'}}
```

## Overview

If you've used `set exrc` before, you would know that using it might execute malicious code, see [`:h 'exrc'`][vim-exrc].
Therefore, you would also be advised to also enable `set secure` to disable some vim config options,
see [`:h 'secure'`][vim-secure].

However, there might some options you may want to conditionally set in a project-level basis but the limitations of
`secure` restrict you from those options. Some of these options include:

+ autocmd
+ shell commands
+ write commands

**projectlocal-vim** tries to tackle this by not using `set secure` or `set exrc` but opening your project config file
written in vimL or Lua and sourcing it only if you allow the file to be executed or not.

What this means is that when you open a project directory with the local config file in it, **projectlocal-vim** will
first check if the directory is allowed to have the local config. If it's not allowed, then it will prompt the user to
accept the local config as part of the files being executed to set configurations for your project. If it's not on the
allowed list, then it will not execute, if a user also says no for adding it to the allow list, then the local config
file will not be loaded.

Essentially, the goal of this plugin is to help you safely source your project-specific options. Think of it like an
`.vscode/settings.json` file but for vim/neovim and written in vimL or Lua.

[Revised from projectcmd.nvim]


## Getting Started

To get started, just install the plugin and add a `init.vim` to you project directory into the location:
`$PROJECT/.vim/init.vim` (where `$PROJECT` is your project directory). This will automatically be picked up by
projectlocal-vim and will prompt you to be allowed to be sourced for the first time.

If you don't want to automatically source the file after opening vim and want to opt to manually source it, then first
allow local config file to be loaded first and then run `:ProjectLocalAutoloadDisable` to disable it only for that
project directory.

### Configuration

Default configurations are as follows and must be defined BEFORE your plugins are loaded via your plugin manager:

```vim
let g:projectlocal = {
    \ 'showMessage': v:true, " Show messages on the command line on what the plugin is doing
    \ 'projectConfig': '.vim/init.vim', " Project config file located relative to the project directory
    \ }
```

Or in a `init.lua`:

```lua
vim.g.projectlocal = {
    showMessage = true, -- Show messages on the command line on what the plugin is doing
    projectConfig = '.vim/init.vim', -- Project config file located relative to the project directory
}
```

## Commands

Below are the available commands for use:

+ `:ProjectLocalConfig` - Open the project local config file, if it exists.
+ `:ProjectLocalAutoloadEnable` - Enable auto sourcing, if it was disabled. This means on the next time you open vim and
    the local project config has changed then it will ask the user to allow sourcing the file. If there were no changes
    on the local project config file then source it automatically.
+ `:ProjectLocalAutoloadDisable` - Disable auto sourcing, if it was enabled. This means the next time you open vim then
    it will not automatically source the local project config file, but can manually load the file via `:ProjectLocalLoad`.
+ `:ProjectLocalLoad` - Manually source the local project config file if autoload is disabled.

[denops]: https://github.com/vim-denops/denops.vim
[pcmdvim]: https://github.com/creativenull/projectcmd.vim
[pcmdnvim]: https://github.com/creativenull/projectcmd.nvim
