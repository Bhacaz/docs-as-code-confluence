# Migration Elasticsearch 7

## Duplicate indexes

The migration must be bone in 4 steps and 3 PR.

1. Create the new classes for the new index
2. Reset, create and reimport the index
3. Modified the reference of the old index to use the new one
4. Clean code and delete old index

Concrete example with `Schedule::TaskKindsIndex`

### 1. Create the new classes for the new index

1. Create a new file under `app/chewy/new_cluster` with the same module and class name of the old one.

```text
app/chewy/new_cluster/schedule/task_kinds_index.rb
```

2. Copy and paste the content of the original index into the new one.
3. Do some modifications
    - Add root module `module NewCluster`
    - Inherit from `< ApplicationIndex`
    - If applicable, replace module from example, `include SomeModule` to `include ::NewCluster::SomeModule` (expect `Crutches`)
4. Change `type: :string` => `type: :text` and
   `type: :string, index: :not_analyzed` => `type: :keyword`

The final result may look like this:

```ruby
# app/chewy/new_cluster/schedule/task_kinds_index.rb
module NewCluster
  module Schedule
    class TaskKindsIndex < ApplicationIndex
      define_type ::Schedule::TaskKind do
        field :id, type: :integer
        ...
      end
    end
  end
end
```

5. Add `extend ::NewCluster::SyncTypeConcern` in the old index, before `define_type`.

After those five points, the PR is ready to be merged. Once deployed, every operation (add, update, remove) on an old
document will also be done in the new index.

**Note** This synchronization only apply on types class methods (not on the index class level). Example:
`Schedule::TaskKindsIndex.import` will import nothing into the new one. `Schedule::TaskKindsIndex::TaskKind.import`
on the other hand will import everything into the new one `NewCluster::Schedule::TaskKindsIndex::TaskKind`.

## 2. Reset, create and reimport the index

Ask someone with the permission to do this in production to reset the new index. To test it in staging the command
will be something like this `bundle exec rake chewy:sidekiq:reset['new_cluster/schedule/task_kinds']`.

## 3. Modified the reference of the old index to use the new one

1. Every reference to the old class must be replace for the new one.

This include `*.import`, `*.query`,
`*.filter`, `update_index('...')`, etc. There is many breaking changes between ES 1 and ES 7. Be sure to
test those changes. A list of changes will be available in the near future.

2. Move the `extend ::NewCluster::SyncTypeConcern` from the old index class to the new one.

This will reverse the way the to index will be synchronized. The purpose of this change is to easily rollback
if necessary.

## 4. Clean code and delete old index

1. Remove the remaining class of the old index.
2. Remove the `extend ::NewCluster::SyncTypeConcern` for the new one.
3. Once deployed, ask someone to manually delete the old index for the ES 1 cluster.

## Chewy deprecations

[Chewy: Legacy DSL incompatibilities](https://github.com/toptal/chewy/tree/v5.2.0#legacy-dsl-incompatibilities)

### only

`only(:id)` => `source(:id)`

### unlimited

This method doens't existe anymore. Freedly reminder, the default number of documents to return of ES is 20.

To replace the `unlimited` there's three alternatives:

1. Already knowing how many documents we want. You can use `limit(100)` or `paginate`.

```ruby
scope = NewCluster::AccountsIndex.filter(term: { first_name: 'Nancy' })
scope.paginate(per_page: 10, page: 1)
```

2. You can use the same logic as the old Chewy DSL and make 2 queries, one to query the total of documents and the other to return the documents.

```ruby
scope = NewCluster::AccountsIndex.filter(term: { first_name: 'Nancy' })
scope.limit(scope.count)
```

3. Set a random big number (to avoid).

```ruby
scope = NewCluster::AccountsIndex.filter(term: { first_name: 'Nancy' })
scope.limit(Size::HUGE)
```

When there is a query, like searching for account with the names, consider using a static limit (or use the default).
If an user search for a name, it usually care only for the 5 or 10 best match.

```ruby
NewCluster::AccountsIndex
  .query(match_phrase_prefix: { first_name: 'Nancy' })
  .limit(10)
```

**Note** using `find` instead of `filter(terms: { '_id' => ids })` already handle `limit`.

## AnalysisConcern

To analyzers the new way is to select only the ones that are uses in the index.

```ruby
module NewCluster
  class DistributionListsIndex < ApplicationIndex
    include ::NewCluster::AnalysisConcern[:lowercase, :standard_folding] # <==
```

Look for the constants in `NewCluster::AnalysisConcern` to found the availables and downcase the constant name.

## Elasticsearch deprecations

### [Aggregations size](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)

`size: 0` isn't valid anymore. Use one of the three techniques above.

### [filter `ids`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html)

With ES7 comes the filter `ids`. It replace the classic `{ terms: { '_id' => [1, 2] } }`. The `terms` filter still works
but since there is a dedicated filter we should used it.

```diff
- NewCluster::AccountsIndex.filter(terms: { '_id' => [1, 2 })
+ NewCluster::AccountsIndex.filter(ids: { values: [1, 2 })
```
### [missing](https://www.elastic.co/guide/en/elasticsearch/reference/7.12/query-dsl-exists-query.html#find-docs-null-values)

In ES7, 'missing' query is no longer supported. To find documents that are missing an indexed value for a field, use the must_not boolean query with the exists query. For example:

```ruby
filter(
  { missing: { field: 'from_console_layout_id', existence: true, null_value: true } }
```
)

becomes:

```ruby
filter(
  bool: { must_not: { exists: { field: 'from_console_layout_id' } } }
)
```

### and, or

`and`, `or` keyword in filter doesn't works anymore. A combinaison of `bool must` or `bool should` must be used.

```ruby
filter(
  and: [
    { term: { 'account.id' => 1} },
    { term: { 'group.id' => 2} }
  ]
)
```

becomes:

```ruby
filter(
  bool: { 
    must: [
      { term: { 'account.id' => 1} },
      { term: { 'group.id' => 2} }
    ]
  } 
)
```

```ruby
filter(
  should: [
    { term: { 'account.id' => 1} },
    { term: { 'group.id' => 2} }
  ]
)
```

becomes:

```ruby
filter(
  bool: { 
    should: [
      { term: { 'account.id' => 1} },
      { term: { 'group.id' => 2} }
    ]
  } 
)
```

### Should and minimum_should_match

Adding the params `minimum_should_match` may be required to keep the same fonctionnallity.

In ES 1, the default value was `1`, in ES 7, it depends.

* 1: in [query context](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/query-filter-context.html) and should is alone (no must or filter)
* 1: in [filter context](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/query-filter-context.html) (e.g. inside a filter part of a bool query; true until ES 6.7)
* 0: in [filter context](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/query-filter-context.html) (e.g. inside a filter part of a bool query; true since ES 7.0, see notes below)
* 0: in [query context](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/query-filter-context.html) and there are must and should (or filter and should)

Source and example: [The default value of minimum_should_match](https://stackoverflow.com/a/49012705/3123484)

Rule of thumb, always add `minimum_should_match: 1`