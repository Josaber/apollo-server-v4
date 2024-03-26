# Mutation Response Example

```gql
interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}
```

```gql
type UpdateUserEmailMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  user: User
}
```
