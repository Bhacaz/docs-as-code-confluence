# Docs as Code - Confluence

Publish a folder of documentation to Confluence.

Create a Confluence Page for each markdown file. Each folder will create a _parent_ page to reflect
the directory structure.

## Parameters

| Name | Description | Required |
| ---- | --- | --- |
| `folder` | The folder to sync | true |
| `username` | Confluence username or email | true |
| `password` | Confluence password or API token | true |
| `confluence-base-url` | Your Confluence url. Example: `https://mydomain.atlassian.net/wiki` | true |
| `space-id` | Confluence space id to publish the documentation. | true |
| `parent-page-id` | Page id under which the documentation will be published | true |

## TODO

* Renaming a file
* Moving/Removing a file
* Not updating Confluence pages when there is no change

## Example of workflow

```yml
name: Sync Docs as Code - Confluence
on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
jobs:
  docs-as-code:
    runs-on: ubuntu-latest
    name: Sync Docs as Code - Confluence
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Sync Docs as Code - Confluence
        uses: Bhacaz/docs-as-code-confluence@main
        with:
          folder: docs
          username: abc@xyz.com
          password: ${{ secrets.API_TOKEN }}
          confluence-base-url: https://mydomain.atlassian.net/wiki
          space-id: ~1234
          parent-page-id: 123456789
```

## Example of usage in a repository

[Bhacaz/docs-as-code-confluence-demo](https://github.com/Bhacaz/docs-as-code-confluence-demo)
