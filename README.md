# RadCalc
# A collection of web-based radiology calculators

## Dependencies
NodeJS: Manages most dependences (see `package.json`). The two most important dependencies are:
- [Svelte](https://svelte.dev/)
- [Simple CSS](https://github.com/kevquirk/simple.css)

## Development
- Build tasks are in `.vscode/tasks.json`
- A development server can be started using the `dev` script in `package.json`.

## Deployment
- Build with the `build` script in `package.json`
- Push the contents of the resulting `build` directory to a server.

## Environment
The repository is prepped for development using the nix package manager. The following files allow this
```
.direnv
.envrc
default.nix`
```

To enable this, `direnv` VSCode extension should installed on the system, and the command `direnv allow` must be run in the root of the repository.

# To Do
- [ ] DEXA trend erroneously considered nonexistant if values are 0
- [x] FRAX upper age limit
- [ ] Trend should just input prior BMD and calculate changes
- [ ] Graph heights for quick sanity check
- [ ] Graph T-scores for quick diagnostic overview
- [ ] Graph trends for quick diagnostic overview