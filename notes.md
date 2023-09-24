# Notes

## When a new branch is created from an epic branch it should ideally result in what looks like a merge-base

```
git checkout release/v6         \   merge
git checkout -b CTRL-123-a-b-c  /   base
commit
commit
git checkout release/v26
git merge CTRL-123-a-b-c        merge commit with parents release/v26 & CTRL-123-a-b-c
```

The merge base commit is only inferred using `git merge-base`. It's possible that the merge-base will be different
from what the developer expects based on when/how they initially created the branch. For example, if the developer
rebases.

Given an Array<MergeInfo> that starts at HEAD (or some recent commit) and ends at some release tag commit
we need to simulate the git branch/checkout/merge actions that Mermaid understands. Can we do it in one pass by traversing from the end to the start of the array?

Given this is the tag at the end of the array
```
- merge_commit:
    hash: 88cc8899b9
    branches:
      - CTRL-1240-v26-surm-add-relevent-events-to-ccc
      - epic/asac-heater-v26
      - epic/startup_reliability_metric_v26
      - epic/suat_v26
    tags:
      - v26.1
  parents:
    - hash: 8afd1943f4
    - hash: "1714125031"
  source: CTRL-1266-cherry-pick-config-tool-api-changes-v2
  target: release/v26
  base:
    hash: 34a65a9eaf
```

```mermaid
gitGraph
    branch release/v26          # creates the epic branch
    commit 34a65a9eaf
    branch CTRL-1266-cherry-pick-config-tool-api-changes-v2

```

We shoud explicitly model the graph by constructing a digraph.
