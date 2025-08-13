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
- [ ] Trend should just input prior BMD and calculate changes
    - This may be more complication than it's worth. If a change is supplied, then the comparison needs to be aware of the current value to calculate the prior value and the % change. This results in some tricky state dependencies especially if the user does things like change with spine levels are used, change BMD values, or change the absolute BMD value for the prior in this trend.
    - It may be more reasonable to have alternative inputs. Prepopulated fields can just show the populated values. When the user wants to enter an empty field, the alternative input could just be BMDs. Would probably need a toggle.
- [ ] Graph heights for quick sanity check
- [ ] Graph T-scores for quick diagnostic overview
- [ ] Graph trends for quick diagnostic overview