# projectlocal.vim

[![Deno 1.28 or above](https://img.shields.io/badge/Deno-Support%201.28-purple.svg?logo=deno)](https://github.com/denoland/deno/tree/v1.28)
[![Vim 9.0.0472 or above](https://img.shields.io/badge/Vim-Support%209.0.0472-purple.svg?logo=vim)](https://github.com/vim/vim/tree/v9.0.0472)
[![Neovim 0.8.0 or above](https://img.shields.io/badge/Neovim-Support%200.8.0-purple.svg?logo=neovim&logoColor=white)](https://github.com/neovim/neovim/tree/v0.8.0)

Load your vim project local configurations safely, for vim and neovim. Written with ♥ in TypeScript and Deno
([denops.vim][denops]).

This is a combination of my [projectcmd.vim][pcmdvim] and [projectcmd.nvim][pcmdnvim] plugins with the aim to unify both
plugins to support both vim and neovim.

<!--
## TODO

+ JSON file
    + [X] Add JSON schema
    + [ ] Add [ALE][ale] support
    + [ ] Add efmls and diagnosticls support via [efmls-configs][efmls-configs] and [diagnosticls-configs][diagnosticls-configs]
    + [ ] Add [neoformat][neoformat] support
    + [ ] Add [neomake][neomake] support
    + [ ] Add [nvim-lint][nvim-lint] support
    + [ ] Add [null-ls][null-ls] support
-->

## Features

+ Setup configurations on a per-project basis
+ Write your configurations in a vimscript, lua or json file
+ Run only on user permission - when a config file is found inside a project, the user will get to decide whether to
  run those configurations or not

## Requirements

+ [deno v1.28 and up](https://deno.land)
+ [denops.vim v4 and up][denops]
+ Vim 9.0.0472 and up (`:version`)
+ Neovim 0.8.0 and up (`:version`)

## Installation

You must have [deno installed for this plugin to work on your machine](https://deno.land)

Below are examples on installing the plugin with a plugin manager or utilizing vim packages.

### vim-plug

```vim
Plug 'vim-denops/denops.vim'
Plug 'creativenull/projectlocal.vim'

" Or use with tag (optional)
" Plug 'creativenull/projectlocal.vim', { 'tag': 'v0.5.0' }
```

### packer.nvim

```lua
use {
    'creativenull/projectlocal.vim',
    tag = 'v0.5.0', -- optional
    requires = { 'vim-denops/denops.vim' },
}
```

### lazy.nvim

```lua
{
    'creativenull/projectlocal.vim',
    version = 'v0.5.x', -- optional
    dependencies = { 'vim-denops/denops.vim' }
}
```

### Without any manager

#### Vim

```sh
git clone https://github.com/creativenull/projectlocal.vim ~/.vim/pack/creativenull/start/projectlocal.vim
```

#### Neovim

```sh
git clone https://github.com/creativenull/projectlocal.vim ~/.local/share/nvim/site/pack/creativenull/start/projectlocal.vim
```

## How to use

## Motivation

I created this plugin in the hopes of making my project configuration separate from my main vim config. To understand
why I went with this approach, we need to cover a bit of history of what vim offers.

<details>
<summary>Click here to read more</summary>

In vim, `set exrc` (`:help 'exrc'`) was the way to enable setting up extra configurations from a project directory.
This detected a `.exrc` or a `.vimrc` in the project directory and vim would run that file as a normal vimscript file.

The problem this posed was that it didn't shield the user from the vimscript code that was executed in the file,
this meant the `.exrc` file could contain malicious code and the user won't know about it.

So to circumvent this problem, you also had to add `set secure` (`:help 'secure'`) along with `set exrc` in your vim
config for it to extremely limit some parts of vimscript code. While that did solve a lot the problems brought by
`exrc` its limit factor made it quite hard to perform the usual configuration for projects. For example, setting a
filetype for a file to get syntax highlighting - especially for files that do not have built-in syntax support by vim -
we will need to set it up with:

```vim
autocmd! BufRead,BufNewFile *.astro set filetype=astro`
```

The above will not work if you have `secure` enabled, because according to the documentation on `secure`:

> When on, ":autocmd", shell and write commands are not allowed in ".vimrc" and ".exrc" in the current directory and map commands are displayed.

</details>

### JSON Config Features (`:help projectlocal-json-config`)

+ Load global variables `g:` (`:help global-variable`).
+ Built-in support for nvim-lsp setup (for neovim only).
  Requires [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) installed.
+ Load global events (coming soon).

## Examples

### Running for the first-time

Here is an example of setting up a first time use with projectconfig-vim. In the video below, an ALE linter is set up
for linting the project. This will prompt projectlocal.vim to accept the new local config file and source it.

[![asciicast](https://asciinema.org/a/lg5fteXqg6CWiNiaOUiHIDWUq.svg)](https://asciinema.org/a/lg5fteXqg6CWiNiaOUiHIDWUq)

### Running after a change

Here is an example of setting up after a change was made in the local config file. In the video below, an ALE fixer is
set up for formatting files in the project. This will prompt projectlocal.vim to accept the changes before re-sourcing
it.

[![asciicast](https://asciinema.org/a/AFXP48Kb4L2IwcbZNv40RqBhL.svg)](https://asciinema.org/a/AFXP48Kb4L2IwcbZNv40RqBhL)

## Documentation

The documentation can be found over at [docs/projectlocal.txt][docs] and via vim/nvim after installation with
`:help projectlocal`.

For a JSON config file check `:help projectlocal-json-config`.

## Overview

### Why

If you've used `set exrc` for setting project-level local configurations before, then you would know that using it might
pose a risk where malicious code can be executed if cloning git repos with a root `.exrc` file in the repo, see
[`:h 'exrc'`][vim-exrc]. Therefore, you would also be informed to also enable `set secure` to disable some vim options
to prevent the execution of such code (to an extent), see [`:h 'secure'`][vim-secure].

However, there might some options you may want to conditionally set on a project-level basis but the limitations of
`set secure` restrict you from setting these options. Some of these options could include:

+ autocmds
+ shell commands
+ write commands

**projectlocal.vim** tries to tackle this by not using `set secure` or `set exrc` but by sourcing your project-level
local configurations in a safe manner.

### How it works

If for the first time you open a project directory in vim, **projectlocal.vim** will check for a local config file. If
it finds one, then it will prompt you to allow executing the code within that file.

On the next time it will remember the local config file, and if no changes were made to it - then it will continue
sourcing it without asking since the last permission allowed it to source. The only time it will ask you afterwards
is when the local config file was changed.

This means, that **projectlocal.vim** will again prompt you to accept the changes and re-source the local config file.
It's designed to make sure that any change should go through the user first before sourcing it.

Essentially, the goal of this plugin is to help you safely source your local configurations in a project.

Think of it like a `.vscode/settings.json` file but for vim/neovim and written in vimscript or lua (and now in json,
see `:help projectlocal-json-config`). This gives you and your team more control on how to set vim configurations
on the project and not mess with your own user configurations.

[Revised from projectcmd.nvim]

## Contributing

At this point, you're welcome to just look at the code and see what issue you can find or be able to propose additional
features requests 🙂

All tooling (linting, formatting, etc) is provided by deno.

[vim-exrc]: https://vimhelp.org/options.txt.html#'exrc'
[vim-secure]: https://vimhelp.org/options.txt.html#'secure'
[denops]: https://github.com/vim-denops/denops.vim
[pcmdvim]: https://github.com/creativenull/projectcmd.vim
[pcmdnvim]: https://github.com/creativenull/projectcmd.nvim
[docs]: doc/projectlocal.txt
[efmls-configs]: https://github.com/creativenull/efmls-configs-nvim
[diagnosticls-configs]: https://github.com/creativenull/diagnosticls-configs-nvim
[ale]: https://github.com/dense-analysis/ale
[null-ls]: https://github.com/jose-elias-alvarez/null-ls.nvim
[nvim-lint]: https://github.com/mfussenegger/nvim-lint
[neoformat]: https://github.com/sbdchd/neoformat
[neomake]: https://github.com/neomake/neomake
