# Selector

### What is a `selector`

A `selector` is an attribute use in many model relative to the `Schedule::Period`.
It is stored in the database as a string and it's use to retrieve a subset of object.

> Example: Only a subset of the resources can do a task

Here the list of the selector in the database

Model | selectors
--- | ---
`Schedule::Constrant` | `resource_selector`, `second_resource`
`Schedule::TaskKind` | `skill_resource`, `planning_resource`
`Schedule::EquityPack` | `task_selector`
`Schedule::DailyTarget` | `task_selector`
`Schedule::Layout` | `task_selector`, `resource_selector`
`Schedule::Step` | `task_selector`, `resource_selector`, `resource_directive`, `pairing_directive`, `pairing_selectors`
`Schedule::TaskBlocking` | `task_selector`, `resource_selector`
`Schedule::TeachingRatio` | `task_selector`, `residency_task_selector`, `resource_selector`
`Schedule::Template` | `task_selector`
`Schedule::TransferNotification` | `task_selector`, `resource_selector`

### Structure of a `selector`

A `selector` is a string with a list of attribute.

**Attribute**

The element to identify the object in the selector.

> Example: The `explicit_initials` of `Schedule::Resource` or the `abbreviation` of `Schedule::Teams`

---

**Items**

To select multiple objects, or items each attribute or separated by a pipe (`|`).

> Example: The selector include _AA_ and _BB_
>
> Result : `AA|BB`

---

**Subsets**

The selector can also include a subset of items.

> Example: A team is composed of several items and has the `abbreviation` _GARDE_.

Those subsets can be use in a selector with the octothorp (`#`).

> Example: `#GARDE`

---

**Empty**

When a selector is empty it select every items.

> Example: the selector is `nil`, it include every resources.

---

**Negation**

The tilde (`~`) is used to exclude an item or a subset.

> Example: Every resources (_AA_, _BB_, and _CC_) except _AA_ can be `BB|CC` or `~AA`

> Example: The team _GARDE_ include only _AA_. And we want every resources except _AA_
>
> Result: `BB|CC` or `~AA` or `~#GARDE`

There can be more than one `~`. To exclude a exclusion. The first `~` apply for all the items in the selector.
All the other tilde is for the item only.

> Example: `~#GARDE|~BB` is like `~(#GARDE|~BB)`. This selector will result to exclude
every resource in the team _GARDE_ (_AA_) except _BB_. Which will result to only select _CC_.

Saving only `~` will exclude every items.

> Example: The selector `~` means that no resources can do this task.

**Sub selector**

In a `selector`, there can be many items used.

> Example: In the a `task_selector` there's `task_kind`, `cwdays_filters`, `holidays`...
>
> To select every _GARDE_ task in the weekend (day _6_ and _7_) the `selector` will be `GARDE;6|7`

**Chain of selector**

Two hyphen  (`--`) is use to chain `selectors` and will result to a union of each items included in each `selector`.

> Example: `AA|BB--CC` will include _AA_, _BB_ and _CC_

### UI component

This is the UI component use in _admin_ to create a selector.

* `Any` will save `nil`.
* `None` will save `~`.
* `Select` will save every `Explicity included` items and subset.
* `All except` will save every `Explicity included` items and subset with a `~` at the beginning.

![Admin UI component](https://user-images.githubusercontent.com/7858787/60179579-ff6db780-97eb-11e9-8964-01df5c92b788.png)