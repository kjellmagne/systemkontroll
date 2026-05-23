# Moving the Project to a New Computer

This guide describes how to move the full working project from one computer to another and then continue syncing with GitHub safely.

It is written for the "all inclusive" case where you copy the whole project folder, including:

- source code
- the hidden `.git` folder
- local-only files such as `secrets.md`
- any other untracked local helper files

## Recommended Sequence

Use this order:

1. finish or save work on computer 1
2. push tracked Git changes to GitHub when possible
3. copy the full project folder to computer 2
4. verify Git state on computer 2
5. authenticate GitHub on computer 2
6. pull the latest remote changes
7. continue working normally

## What Must Be Included in the Copy

When copying the folder from computer 1 to computer 2, make sure the copy includes:

- the project files
- the hidden `.git` folder
- the `docs` folder
- `secrets.md` if you intentionally want that local file on computer 2 as well

If `.git` is missing, computer 2 will only receive the files, not the repository history or the GitHub remote configuration.

## Before Copying from Computer 1

In the project folder on computer 1, run:

```powershell
git status
git branch --show-current
git remote -v
```

Check these points:

- the current branch is the branch you expect to continue on
- you understand whether there are uncommitted local changes
- `origin` points to the correct GitHub repository

If you have tracked changes that should follow through GitHub, commit and push them before copying:

```powershell
git add .
git commit -m "Describe the change"
git push
```

If you also have local-only files such as `secrets.md`, those can still be copied manually even though they are not pushed.

## Copy the Folder to Computer 2

Copy the full project directory from computer 1 to computer 2.

Important:

- preserve hidden files and folders
- do not omit `.git`
- do not rename the repository contents while copying unless you intend to work from a different path

## First Checks on Computer 2

Open a terminal in the copied project folder and run:

```powershell
git status
git remote -v
git branch
```

What you want to see:

- Git recognizes the folder as a repository
- the expected local branch exists
- `origin` still points to `https://github.com/kjellmagne/systemkontroll.git`

If `git status` fails with "not a git repository", the `.git` folder was not copied and the move needs to be redone.

## Set Git Identity on Computer 2

If Git is not already configured on computer 2, set your identity:

```powershell
git config user.name "Your Name"
git config user.email "your@email.com"
```

Use `--global` if you want the identity to apply to all repositories on that machine:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Authenticate GitHub on Computer 2

Computer 2 also needs GitHub authentication before it can push.

Common options:

- Git Credential Manager
- GitHub Desktop
- GitHub CLI with `gh auth login`

If you use GitHub CLI:

```powershell
gh auth login
```

After authentication, test access:

```powershell
git fetch origin
```

## Pull the Latest Changes from GitHub

Before starting new work on computer 2, sync with GitHub:

```powershell
git checkout main
git pull --rebase origin main
```

If you plan to continue on another branch, switch to it after syncing `main`:

```powershell
git checkout your-branch-name
git pull --rebase origin your-branch-name
```

This step matters even after copying the folder because GitHub may have newer commits than the folder copy.

## Keep `secrets.md` Local Only

`secrets.md` is intended to stay local and should not be pushed to GitHub.

This project's `.gitignore` is set up so `secrets.md` should remain untracked.

Verify that with:

```powershell
git status --short
```

What should happen:

- `secrets.md` should not appear in the output

If `secrets.md` does appear, stop and check `.gitignore` before committing anything.

## Normal Workflow After the Move

Once the repository is verified on computer 2, work normally:

```powershell
git checkout -b my-change
git add .
git commit -m "Describe the change"
git push -u origin my-change
```

Then open a pull request in GitHub if needed.

## If You Want the Cleanest Setup Instead

The full-folder copy works, but the cleaner long-term workflow is:

1. clone the repository fresh on computer 2
2. copy only local-only files such as `secrets.md`
3. reinstall dependencies locally
4. keep machine-specific state out of the repository

That alternative reduces clutter and avoids copying temporary files, caches, and build output.

## Known Boundary: Codex History and Memory

Copying this project folder does not automatically move Codex chat history or Codex local memory.

Those live outside the repository in the local Codex user data on the computer.

The project copy does move:

- code
- Git history in `.git`
- local project files such as `secrets.md`
- repository documentation such as this file

## Quick Checklist

Use this short version when repeating the process:

1. on computer 1, run `git status` and `git push`
2. copy the full folder, including `.git`
3. open the folder on computer 2
4. run `git status`, `git remote -v`, and `git branch`
5. configure Git identity if needed
6. authenticate GitHub
7. run `git fetch origin`
8. run `git pull --rebase`
9. verify that `secrets.md` is still ignored
10. continue working normally
