# Directive

A directive decorates part of a GraphQL schema or operation with additional configuration.

## Schema Directive (Server)

- @deprecated(reason: String)

```gql
directive @deprecated(
  reason: String = "No longer supported"
) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION | ENUM_VALUE
```

## Operation Directive (Client)

- @skip(if: Boolean!)
- @include(if: Boolean!)

## [Custom Directive](https://www.apollographql.com/docs/apollo-server/schema/directives#custom-directives)
