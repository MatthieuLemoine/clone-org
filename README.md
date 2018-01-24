# clone-org

Clone all the repositories of a given organization.

## Usage

```
node index.js --token <githubPersonalAccessToken> --org <organizationName> --dir <targetDirectory>
```

:warning: Will not clone a repository if a folder with the same name already exists in `<targetDirectory>`.
