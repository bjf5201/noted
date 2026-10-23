# Noted API Design

## Scope

For now, the API is organized around three areas, each with a set of specific features. The project will iteratively add additional features once these initial endpoints are complete:

1. **Authentication:**
   - Logging in and out
   - Checking validity of current session
2. **User**
   - Creating a user account
   - Managing user's account information
   - Retrieving user profile
3. **Notes** - in Markdown format
   - Creating a note
   - Editing an existing note
   - Deleting an existing note
   - Listing notes (which belong to the logged in user)
   - Retrieving a specific note (which is owned by the logged in user)

## Endpoint list

### User endpoints

| Endpoint       | Method | Purpose                           | Success       | Notes                                       |
| -------------- | ------ | --------------------------------- | ------------- | ------------------------------------------- |
| `/api/v1/user` | POST   | Register a user                   | `201 Created` |                                             |
| `/api/v1/user` | GET    | Get the current user's profile    | `200 OK`      |                                             |
| `/api/v1/user` | PATCH  | Update the current user's profile | `200 OK`      | Double check that this contract makes sense |

### Authentication endpoints

| Endpoint               | Method | Purpose                   | Success          | Notes |
| ---------------------- | ------ | ------------------------- | ---------------- | ----- |
| `/api/v1/auth/login`   | POST   | Log in                    | `200 OK`         |       |
| `/api/v1/auth/logout`  | POST   | Log out                   | `204 No Content` |       |
| `/api/v1/auth/session` | GET    | Check the current session | `200 OK`         | ^4    |

### Notes Endpoints

| Endpoint            | Method | Purpose                       | Success          | Notes |
| ------------------- | ------ | ----------------------------- | ---------------- | ----- |
| `/api/v1/notes`     | GET    | List the current user's notes | `200 OK`         |       |
| `/api/v1/notes`     | POST   | Create a note                 | `201 Created`    |       |
| `/api/v1/notes/:id` | GET    | Get one note                  | `200 OK`         |       |
| `/api/v1/notes/:id` | PATCH  | Update a note                 | `200 OK`         |       |
| `/api/v1/notes/:id` | DELETE | Delete a note                 | `204 No Content` | ^5    |

## API Contracts

### OpenAPI 3.1 YAML document

See the [OpenAPI document](./openapi.yaml)

### Shared resource shapes

A **user profile** should contain _only information safe to return_ to the frontend:

```JSON
{
  "id": 12,
  "username": "bjf5201",
  "email": "bjf5201@example.com"
}
```

A **note summary** is what the frontend needs to display a note in a list:

```JSON
{
  "id": 42,
  "title": "My first note",
  "createdAt": "2026-10-20T18:30:00.000Z",
  "updatedAt": "2026-10-20T18:30:00.000Z"
}
```

A **full note** includes the Markdown source (stored in `content` property):

```JSON
{
  "id": 42,
  "title": "My first note",
  "content": "# Hello\nThis is a Markdown note.",
  "createdAt": "2026-10-20T18:30:00.000Z",
  "updatedAt": "2026-10-20T18:30:00.000Z"
}
```

A **standard error response** for all errors no matter what the HTTP status may be:

```JSON
{
  "statusCode": 404,
  "error": "Not found",
  "message": "Resource not found"
}
```

Add the `property` field for **validation errors**:

```JSON
{
  "statusCode": 400,
  "error": "Bad request",
  "message": "Invalid property on request body/query/path",
  "property": ["title", "content"]
}
```

## Conventions and Style Choices

- Base path => n `/api/v1` prefix
- Data formats => JSON requests and responses, via TypeBox and `@fastify/typebox-type-provider`
- Authentication => session cookie
- Resource identifiers => Numeric IDs
- HTTP Responses:
  - Create => `201 Created`
  - Successful reads & updates => `200 OK`
  - Successful note deletion => `204 No Content`
  - Invalid request data => `400 Bad Request`
  - Unauthenticated request => `401 Unauthorized`
  - Resource not found => `404 Not Found`
  - Duplicate email => `409 Conflict`
- Single `content` field for Markdown note content

## Notes

^4: This is usually used before retrieving restricted data such as a user's account info or their notes
^5: Again, why is `204: No Content` the success response after deletion? This is a confusing response, it implies an error rather than success.
