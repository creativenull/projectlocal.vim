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
" Plug 'creativenull/projectlocal.vim', { 'tag': 'v1.*' }
```

### packer.nvim

```lua
use {
    'creativenull/projectlocal.vim',
    tag = 'v1.*', -- optional
    requires = { 'vim-denops/denops.vim' },
}
```

### lazy.nvim

```lua
{
    'creativenull/projectlocal.vim',
    version = 'v1.x.x', -- optional
    dependencies = { 'vim-denops/denops.vim' }
}
```

### Without any manager

#### Vim

```sh
git clone --depth 1 --branch v1.0.0 https://github.com/creativenull/projectlocal.vim ~/.vim/pack/creativenull/start/projectlocal.vim
```

#### Neovim

```sh
git clone --depth 1 --branch v1.0.0 https://github.com/creativenull/projectlocal.vim ~/.local/share/nvim/site/pack/creativenull/start/projectlocal.vim
```

## How to use

[Check the How to use section in the Wiki page.](https://github.com/creativenull/projectlocal.vim/wiki#how-to-use)

## Motivation

[Read why I created this plugin in the Motivation wiki page.](https://github.com/creativenull/projectlocal.vim/wiki/Motivation)

## Documentation

The documentation can be found over at [docs/projectlocal.txt][docs] and via vim/nvim after installation with
`:help projectlocal`.

For a JSON config file check `:help projectlocal-json-config`.

## Contributing

Make sure you have Deno installed. If you encounter a bug or have an issue, you can make PR with your reasoning. But I
would recommend you create an Issue first before making a PR to expand more on the issue you're having.

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
