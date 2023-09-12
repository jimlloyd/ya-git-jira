# ya-git-jira - Yet Another Git Jira

This package installs two applications (for now) that are written to be
usable as `git` extensions, i.e. sub-commands of the `git` command.
The extensions faciliate workflow when using `git` for source control and `jira`
for issue tracking. Other similar packages exist -- thus the "yet another"
in the name.

This package will likely evolve over time to include some other workflow cases.
For now, the two commands are:

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
the global config by adding the `-g` option to the commands below.

### Host

You must provide the host name of your Jira cloud service (usually `yourcompany.atlassian.net`) via  `git config`:

```
$ git config jira.host yourcompany.atlassian.net
```

### API Token

This package requries that you create a API Token (a.k.a. Personal Access Token) for your Atlassian
account, as described [here](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).

You make the token available to `git-jira` via the `git config` command:

```
$ git config jira.pat "<long token here>"
```

### Email address

`git-jira` also needs the email address associated with your Atlassian account.
If that email address is the same as your `user.email` setting you don't need to
add any other configuration. If you use different email addresses for `git` and Atlassian
then you need to add the email address via `git config` like this:

```
$ git config jira.email <email-address>
```
