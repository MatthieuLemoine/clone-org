# clone-org

Clone all the repositories of a given organization.

## Install

```
npm i -g @matthieulemoine/clone-org
# or
yarn global add @matthieulemoine/clone-org
```

## Usage

```
clone-org --token <githubPersonalAccessToken> --org <organizationName> --dir <targetDirectory>
```

:warning: Will not clone a repository if a folder with the same name already exists in `<targetDirectory>`.
