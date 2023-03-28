# Motivation

I created this plugin in the hopes of keeping my project configuration separate from my personal vim config. To
understand why I went with this approach, we need to cover a bit of history of what vim offers.

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
autocmd! BufRead,BufNewFile *.astro set filetype=astro
```

The above will not work if you have `secure` enabled, because according to the documentation on `secure`:

> When on, ":autocmd", shell and write commands are not allowed in ".vimrc" and ".exrc" in the current directory and map commands are displayed.

Now with that (brief) history in mind. The reason why I created this plugin was to:

1. Try out denops.vim to help write a vim plugin with Deno
2. Due to the limitation of `secure`, I wanted to find a way to circumvent around that yet securely execute project
   config file

With that, I set out to write this plugin.
