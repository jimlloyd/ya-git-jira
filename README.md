# ya-git-jira - Yet Another Git Jira

This package installs several scripts that are written to be
usable as `git` extensions, i.e. sub-commands of the `git` command.
The extensions faciliate workflow when using `git` for source control and `jira`
for issue tracking. Other similar packages exist -- thus the "yet another"
in the name.

This package will likely evolve over time to include more workflow cases.

## gitj -- A test driver to use instead of `git <command>`

It can be useful to run these commands as if they were being invoked through
`git` but using a proxy for `git` than can only execute the commands in this
package.

For example, to see the available top level commands, run `gitj --help`:

```
$ gitj help
Usage: gitj [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  bump [options]  Bump the version number in the current branch
  jira [options]  Commands for working with Jira
  lab [options]   Commands for working with GitLab
```

## Command hierarchy and naming conventions

The `git jira` and `git lab` commands are arranged in a hierarchy with a structure
and naming conventions that are indended to make it easy to navigate the existing
commands and to also make it relatively easy to decide where a new command should
go into the hierarchy. The current hierarchy is:

```
gitj
    bump
    jira
        issue
            list
            show
        start
    lab
        group
            list
        merge
            active
            todo
            train
                list
        namespace
            list
        project
            list
            pipeline
                list
            whereami
    whoami
```

The pattern `<command> list | show` that is used for `issue` will probably become
a common pattern everywhere that `list` appears above. The subcommand `list` implies
that multiple items are return, whereas `show` implies seeing the details for a single item.

The `merge` subcommands `active` vs `todo` are both commands that result in a list.
We might refactor them to instead be `list --active` and `list --todo` which would
be more consistent.

The `git jira start` command might more logically be `git jira issue start`
but `start` implies *issue* and it is expected to be one of the most commonly
executed commands so we elevate it the hierarchy.

## git-jira-start -- Create a new topic branch for work on an issue

#### Usage:
```bash
$ git jira-start <issue>
```

#### Examples:
```bash
$ git jira-start BUG-0042
```

The command retrieves the summary line for the issue and converts it to
a suitable branch name using the kebab-case-convention. If BUG-0042 had
the summary "fix the thing" then the branch name will be `BUG-0042-fix-the-thing`.

The command does not (yet) change the status of the issue.

## git-bump -- Create a new branch based on the current branch

Usage:
```bash
$ git bump
```

This command is not specific to Jira. It simply reads the current branch name and creates a new branch with the version bumped, i.e. incremented.

Assume the current branch is `BUG-0042-fix-the-thing`.
Executing the bump command once will create a new branch named `BUG-0042-fix-the-thing.v1`. If you execute the bump command again it will
create a branch `BUG-0042-fix-the-thing.v2`.

The `git bump` command will work whatever the current branch name is.
It just checks to see if the current branch already ends with `.v`<*num*>,
in which case it increments *num* but otherwise leaves the branch name as is.
If the current branch does not end with `.v`<*num*> then it simply appends the
suffix `.v1`.

##  Bun required

This package uses [bun](https://bun.sh) instead of [node](https://nodejs.org/en).
You must install it before you install this package.

```
$ curl -fsSL https://bun.sh/install | bash
```

## Install with any npm-compatible package manager

You can install ya-git-jira via `npm`, or `yarn` or `pnpm` or `bun`.

```
$ npm install -g ya-git-jira
```

## Configuration

All configuration is via `git config` settings. If your company has multiple
repositories that all using Jira issue tracking then you probably want to use
the global config by adding the `--global` option to the commands below.

### Jira

The `git jira` comands require your Jira `host` and `token`. The `host` is your Jira cloud service (usually `yourcompany.atlassian.net`).
To create an API token follow the instructions [here](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).

```
$ git config jira.host yourcompany.atlassian.net
$ git config jira.token "<long token here>"
```

### GitLab

Likewise the `git lab` comands require your GitLab `host` and `token`, though the default `host` `gitlab.com` will be sufficient
for many users. To create an API token follow the instructions [here](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#create-a-personal-access-token)

```
$ git config gitlab.host gitlab.com
$ git config gitlab.token "<long token here>"
```

### Email address

Both `git lab` and `git jira` also need the email address associated associated with those accounts.
Since `git` itself requires an email addres via the setting `user.email`, it is a reasonable default setting
that will work for many users. But if necessary, you can specify the different email addresses
using these two settings:


```
$ git config jira.user <email-address>
$ git config gitlab.user <email-address>
```
