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

[Link to video]

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
