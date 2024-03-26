# Supported types

- Scalar
  - Similar to primitive types
  - Int: signed 32‐bit integer
  - Float: signed double-precision floating-point value
  - String: UTF‐8 character sequence
  - Boolean: true / false
  - ID (serialized as a String): unique identifier that's often used to refetch an object or as the key for a cache
  - [Custom scalar](https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/)
- Object
  - This includes the three special root operation types: `Query`, `Mutation`, and `Subscription`.
    - Query: top-level entry points for queries (read operations)
    - type Query { books: [Book!] }: books is a field of Query object
    - Mutation: similar to Query, but for write operations
    - Subscription
  - `__typename` field
- Input
  - special object types that allow you to provide hierarchical data as arguments to fields
  - field of an input type can be only a scalar, an enum, or another input type
- Enum
  - legal values are defined in the schema
  - serialize as strings
  - can define resolver for enum for internal values
- Union
  - a union's included types must be object types (**not scalars**, input types, etc.)
  - Included types do **not** need to share any fields
- Interface

## [Nullability and lists](https://www.apollographql.com/docs/apollo-server/schema/schema#nullability-and-lists)

| RETURN TYPE | EXAMPLE ALLOWED RETURN VALUES                            |
| ----------- | -------------------------------------------------------- |
| `[Book]`    | `[]`, `null`, `[null]`, and `[{title: "City of Glass"}]` |
| `[Book!]`   | `[]`, `null`, and `[{title: "City of Glass"}]`           |
| `[Book]!`   | `[]`, `[null]`, and `[{title: "City of Glass"}]`         |
| `[Book!]!`  | `[]` and `[{title: "City of Glass"}]`                    |
