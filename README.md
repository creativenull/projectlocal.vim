# projectlocal-vim

[![Deno 1.11.0 or above](https://img.shields.io/badge/Deno-Support%201.11.0-yellowgreen.svg?logo=deno)](https://github.com/denoland/deno/tree/v1.11.0)
[![Vim 8.1.2424 or above](https://img.shields.io/badge/Vim-Support%208.1.2424-yellowgreen.svg?logo=vim)](https://github.com/vim/vim/tree/v8.1.2424)
[![Neovim 0.4.4 or above](https://img.shields.io/badge/Neovim-Support%200.4.4-yellowgreen.svg?logo=neovim&logoColor=white)](https://github.com/neovim/neovim/tree/v0.4.4)

Load your vim project local configurations safely, for vim and neovim. Written in typescript for [denops.vim][denops].

This is a combination of my [projectcmd.vim][pcmdvim] and [projectcmd.nvim][pcmdnvim] plugins with the aim to unify both
plugins to support both vim and neovim.

__Status: Alpha (Testing out denops but welcome for others to test)__

## TODO

+ [ ] Ability to integrate certain plugins, like ALE, editorconfig, etc
+ [X] Add example gifs/videos
+ [X] Command to create local config file
+ [X] Add more commands, abbreviations if necessary

## Examples
### Running for the first-time

Here is an example of setting up a first time use with projectconfig-vim. In the video below, an ALE linter is set up
for linting the project. This will prompt projectlocal-vim to accept the new local config file and source it.

[![asciicast](https://asciinema.org/a/lg5fteXqg6CWiNiaOUiHIDWUq.svg)](https://asciinema.org/a/lg5fteXqg6CWiNiaOUiHIDWUq)

### Running after a change

Here is an example of setting up after a change was made in the local config file. In the video below, an ALE fixer is
set up for formatting files in the project. This will prompt projectlocal-vim to accept the changes before re-sourcing
it.

[![asciicast](https://asciinema.org/a/AFXP48Kb4L2IwcbZNv40RqBhL.svg)](https://asciinema.org/a/AFXP48Kb4L2IwcbZNv40RqBhL)

## Requirements

+ [deno](https://deno.land)
+ [denops.vim][denops]
+ Vim 8.2 and up (check `:version`)
+ Neovim 0.4 and up (check `:version`)

## Install

First follow the guide to [install deno](https://deno.land) in your machine. Then follow instructions below to install
the plugin via vim-plug, packer.nvim or any plugin manager that's similar to vim-plug.

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
### Why

If you've used `set exrc` for setting project-level local configurations before, then you would know that using it might
pose a risk where malicious code can be executed if downloading unknown projects from git repos with an `.exrc` in that
directory, see [`:h 'exrc'`][vim-exrc]. Therefore, you would also be informed to also enable `set secure` to disable
some vim options to prevent the execution of such code, see [`:h 'secure'`][vim-secure].

However, there might some options you may want to conditionally set on a project-level basis but the limitations of
`secure` restrict you from setting those options. Some of these options include:

+ autocmds
+ shell commands
+ write commands

**projectlocal-vim** tries to tackle this by not using `set secure` or `set exrc` but by sourcing your project-level
local configurations in a safe manner.

### How it works

What this means is that when you open a project for the first time, and **projectlocal-vim** detects a project config
in the project directory, it will then prompt you to allow the local config to be sourced along with your vim config.
Once you've accepted it, it will remember the project directory and will load the local configuration the next time you
open vim in that project directory.

This plugin will also not execute your local config, if you've made changes to the local config file after permitting it.
This means, that **projectlocal-vim** will again prompt you to accept the changes and re-source the local config file.
It's designed to make sure any changes should go through the user first before sourcing it.

Essentially, the goal of this plugin is to help you safely source your local configurations in a project.
Think of it like an `.vscode/settings.json` file but for vim/neovim and written in vimscript or Lua. This gives you and
your team more control on how to set vim configurations on the project and not mess with your user configurations.

[Revised from projectcmd.nvim]

## Documentation

The documentation can be found over at [docs/projectlocal.txt][docs] and via vim after installation and calling the
command `:help projectlocal`.

## Contributing

At this point, you're welcome to just look at the code and see what issue you can find or be able to propose additional
features 🙂.

Linting and LSP provided by Deno, formatting is done by prettier until there is support for `deno fmt` config. You will
need deno and prettier installed globally.

[vim-exrc]: https://vimhelp.org/options.txt.html#'exrc'
[vim-secure]: https://vimhelp.org/options.txt.html#'secure'
[denops]: https://github.com/vim-denops/denops.vim
[pcmdvim]: https://github.com/creativenull/projectcmd.vim
[pcmdnvim]: https://github.com/creativenull/projectcmd.nvim
[docs]: docs/projectlocal.txt
