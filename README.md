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
- [x] DEXA trend erroneously considered nonexistant if values are 0
- [x] FRAX upper age limit
- [x] Quick technique modifiers (i.e. spine osteophyte)
- [x] Graph heights for quick sanity check
- [x] Graph T-scores for quick diagnostic overview
- [ ] Graph trends for quick diagnostic overview
- [x] Uncheck and disable a trend box if the result box for that anatomic location is unchecked.
- [x] Spread out result box based on anatomic location.
- [x] Warn+acknowledge region for things like odd heights, odd values in results, and large standard deviations in results
    - [x] Trends not set when results are
    - [x] Unusual heights
    - [x] Unusual comparison dates
    - [x] Unexpected trend results
- [ ] Customizable technique input (type box, select locations) - make a list of technique modifications and where they show up in the report.
- [ ] Calculator feature for BMD change that can just input previous and current BMD