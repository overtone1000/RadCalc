# default.nix
with import <nixpkgs> {};
stdenv.mkDerivation {
    name = "dev-environment"; # Probably put a more meaningful name here
    buildInputs = [
        nodejs #install nodejs and then use npm to install typescript and other dependencies to make the project more universally available
        #typescript
    ];
}