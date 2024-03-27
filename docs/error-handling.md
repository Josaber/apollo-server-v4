# Error Handling

## Built-in error codes

| CODE                          | DESCRIPTION                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| GRAPHQL_PARSE_FAILED          | The operation string contains a syntax error.                 |
| GRAPHQL_VALIDATION_FAILED     | The operation is not valid against the schema.                |
| BAD_USER_INPUT                | The operation includes an invalid value for a field argument. |
| PERSISTED_QUERY_NOT_FOUND     | ...                                                           |
| PERSISTED_QUERY_NOT_SUPPORTED | ...                                                           |
| OPERATION_RESOLUTION_FAILURE  | The server couldn't resolve which operation to run.           |
| BAD_REQUEST                   | An error occurred when server to parse GraphQl operation.     |
| INTERNAL_SERVER_ERROR         | An unspecified error occurred.                                |
