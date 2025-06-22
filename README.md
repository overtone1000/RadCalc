# RadCalc
## A collection of web-based radiology calculators

Deployment scripts are available to conveniently update a server, but the calculators are simple html/js/css. Just clone or download this repository locally and open `src/index.html` to use the calculators without a server.

## Dependencies
- [Simple CSS](https://github.com/kevquirk/simple.css): Directly included in the `src` directory
- NodeJS - Installs development dependencies such is linter, prettier, and typescript compiler (see `package.json`)

## Development
- Build tasks are in `.vscode/tasks.json`
- A development server can be started using podman via `dev/start.sh`

## Environment

The repository is prepped for development using the nix package manager. The following files allow this
```
.direnv
.envrc
default.nix`
```

To enable this, `direnv` VSCode extension should installed on the system, and the command `direnv allow` must be run in the root of the repository.

## To Do
- [ ] Create deployment scripts
- [ ] Confirm that typescript compiler output can be opened as a simple local site as described above