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






# Discovering the release & epic branch structure

We can get a list of all existing branches named `origin/release/v*` an `origin/epic/*`

We can then loop over all of these branches and do `git la origin/<branch>`. This can be done without checking out that
branch.

1. make sure we get the date when the epic branch was last modified. We want to purge stale epics.
2. We might want to trace back until we see `develop` as we do below where epic/dakota-develop is branched off of `develop`
right after v23.2 was tagged.

We should see something like this:

```
a04aecd21b (HEAD, origin/epic/low-power-modes) Merge branch 'CTRL-2105-notify-operators-about-gateway-check-in-during-low-power-operation' into 'epic/low-power-modes'
9491350d33 Merge branch 'CTRL-1577-gateway-power-management-from-package-control.v2' into 'epic/low-power-modes'
03f2c2b891 Merge branch 'CTRL-1569-protect-against-de-energize-override-being-used-in-grid-forming' into 'epic/low-power-modes'
1ee324190a Merge branch 'CTRL-1936-scm-hwio-gateway-efuse-control-for-package-control.v1' into 'epic/low-power-modes'
236b3d0e4e Merge branch 'CTRL-570-package-control-low-power-states' into 'epic/low-power-modes'
476b5e0637 Merge branch 'CTRL-1249-allow-grid-form-loadtracking-with-fewer-or-no-cores' into 'epic/low-power-modes'
8afd1943f4 Merge branch 'CTRL-1386-stuck-in-gridparallelengage-while-commanding-gridtiestandby' into 'release/v26'
34a65a9eaf Merge branch 'CTRL-590-further-reduce-cooling-fan-power-draw-in-standby' into 'release/v26'
97a9930bfa Merge branch 'CTRL-1595-allow-grid-forming-without-ptp-sync' into 'release/v26'
c99d9dbb25 Merge branch 'CTRL-1705-e-stop-gti-when-core-controller-loses-communication-to-scm-to-avoid-export' into 'release/v26'
96ccb1ac94 Merge branch 'CTRL-1524-fix-lem-inverter-temp-stale-fault-triggering-when-entry-to-eprestandbycheck' into 'release/v26'
8da6953a46 Merge branch 'CTRL-617-gracefully-de-energize-when-core-is-in-restartlockedout-or-waitingtorestart-states' into 'release/v26'
91ad774377 (tag: v26.0.0) Merge branch 'CTRL-1657-estimate-battery-open-circuit-voltage' into 'epic/dakota-develop'
ff9553c822 Merge branch 'CTRL-1825-ensure-scm_hwio-has-no-extraneous-dependencies' into 'epic/dakota-develop'
57bfa21193 Merge branch 'CTRL-1547-fix-emissions-related-core-energy-signal-for-dakota' into 'epic/dakota-develop'
```

from the above we can see that epic/low-power-modes was branched off of release/v26
and release/v26 was branched off of epic/dakota-develop

For the latter we have the canonical tagging:

```
8da6953a46 Merge branch 'CTRL-617-gracefully-de-energize-when-core-is-in-restartlockedout-or-waitingtorestart-states' into 'release/v26'
91ad774377 (tag: v26.0.0) Merge branch 'CTRL-1657-estimate-battery-open-circuit-voltage' into 'epic/dakota-develop'
```

If we keep going back in history we eventually see:

```
ca73f18409 Merge branch '6230-fix-gti-communicator-power-command-and-ramp-rate-scaling' into 'epic/dakota-develop'
6a8338a6f5 Merge branch '6166-grid-mode-transfer-during-reaction' into 'epic/dakota-develop'
59aa998fda Merge branch '6222-metric-track-distance-required-until-bearing-air-is-up' into 'develop'
050e97f412 (tag: v23.2) Merge branch '6185-log-core-starts-without-bearing-air' into 'develop'
```

Which shows that epic/dakota/develop was branched off of develop very shortly after v23.2 was tagged.
