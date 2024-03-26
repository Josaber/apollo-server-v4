# Client Queries

```gql
query SearchBookQuery {
  search(contains: "Kate") {
    ... on Author {
      name
    }

    ... on Book {
      title
      author {
        name
      }
      publishedAt
      metadata

      ... on Comic {
        color
      }

      ... on Novel {
        language
      }
    }
  }

  book(id: "book-1") {
    title
    author {
      name
      books {
        title
      }
    }
    publishedAt
    metadata

    ... on Comic {
      color
    }

    ... on Novel {
      language
    }
  }

  books {
    title
    author {
      name
      books {
        title
      }
    }
    publishedAt
    metadata

    ... on Comic {
      color
    }

    ... on Novel {
      language
    }
  }
}
```

```gql
query SearchBookQuery {
  book(id: "book-1") {
    title @skip(if: true)
    author {
      name @include(if: true)
      books {
        title
        author {
          name
          books {
            title
            author {
              name
              books {
                author {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
}
```
