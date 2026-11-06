<!-- markdownlint-disable -->

# Noted API Design

## Scope

For now, the API is organized around six specific areas, each with a set of specific features. The project will iteratively add additional features once these initial endpoints are complete:

### A. Authentication & Account Management:

| Endpoint         | Method | Purpose                                           | Request Body                                          | Error Responses                                       | Success Response                                                                                       |
| ---------------- | ------ | ------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/auth/register` | POST   | Create a new user account                         | `email`, `username`, `password`                       | `400 Bad Request`, `409 Conflict`                     | `201 Created` + `{ data: { user: { id, username, email, createdAt, updatedAt }}, meta: { requestId }}` |
| `/auth/session`  | POST   | Log in and establish an authenticated session     | `email`, `password`                                   | `400 Bad Request`, `401 Unauthorized`                 | `200 OK` + `{ data: { user: { id, username, email, createdAt, updatedAt }}, meta: { requestId }}`      |
| `/auth/session`  | DELETE | Log out and invalidate the current session        | N/A                                                   | `401 Unauthorized`                                    | `204 No Content`                                                                                       |
| `/users/account` | GET    | Retrieve the authenticated user's account details | N/A                                                   | `401 Unauthorized`                                    | `200 OK` + `{ data: { user: { id, username, email, createdAt, updatedAt }}, meta: { requestId }}`      |
| `/users/account` | PATCH  | Update account fields, such as email or username  | Fields to update (`email`, `username`, or `password`) | `400 Bad Request`, `401 Unauthorized`, `409 Conflict` | `200 OK` + `{ data: { user: { id, username, email, createdAt, updatedAt }}, meta: { requestId }}`      |

### B. User Information

| Endpoint          | Method | Purpose                                                                                                                   | Request Body | Error Responses                                                                     | Success Response                                                                                            |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/users`          | GET    | Retrieve a list of all (public) users; if there are no public users, successful response with an empty `data.users` field | N/A          | `500 Internal Server Error`                                                         | `200 Ok` + `{ data: { users: [{id, username, profileImageUri }, {}, {}] }, meta: { requestId }}`            |
| `/users/{userId}` | GET    | Get basic info about specific user                                                                                        | N/A          | `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error` | `200 Ok` + `{ data: { user: { id, username, profileImageUri, createdAt, updatedAt }}, meta: { requestId }}` |

### C. Profiles & Preferences

| Endpoint                  | Method | Purpose                                                   | Request Body                                                                                                                                                        | Error Responses                                       | Success Response                                                                                                                                   |
| ------------------------- | ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/users/{userId}/profile` | GET    | View a user's public profile                              | N/A                                                                                                                                                                 | `401 Unauthorized `, `404 Not Found`                  | `200 OK` + `{ data: { user: { username }, profile: { name, summary, bio, keywords, profileImageUri, createdAt, updatedAt }}, meta: { requestId }}` |
| `/users/profile`          | GET    | View the authenticated user's own public profile          | N/A                                                                                                                                                                 | `404 Not Found`, `401 Unauthorized`                   | `200 OK` + `{ data: { user: { username }, profile: { name, summary, bio, keywords, profileImageUri, createdAt, updatedAt }}, meta: { requestId }}` |
| `/users/profile`          | PUT    | Create or replace the entire authenticated user's profile | Required (for updating only part of the user's profile, use the PATCH endpoint, below): `name`, `summary`, `bio`, `keywords[]`, `profileImage`, `resetProfileImage` | `400 Bad Request`, `401 Unauthorized`, `409 Conflict` | `200 OK` + `{ data: { profile: { name, summary, bio, keywords, profileImageUri, createdAt, updatedAt }}, meta: { requestId }}`                     |
| `/users/profile`          | PATCH  | Update select profile fields                              | At least one of: `name`, `summary, `bio`, `keywords[]`, `profileImage`, `resetProfileImage`                                                                         | `400 Bad Request`, `401 Unauthorized`, `409 Conflict` | `200 OK` + `{ data: { profile: { name, summary, bio, keywords, profileImageUri, createdAt, updatedAt }}, meta: { requestId }}`                     |
| `/users/preferences`      | GET    | Retrieve authenticated users's account preferences        | N/A                                                                                                                                                                 | `401 Unauthorized`                                    | `200 OK` + `{ data: { user: { id, username}, account: { visibility, createdAt, updatedAt }}, meta: { requestId }}`                                 |
| `/users/preferences`      | PATCH  | Change authenticated user's account preferences           | `visibility`                                                                                                                                                        | `400 Bad Request`, `401 Unauthorized`, `409 Conflict` | `200 OK` + `{ data: { user: { id, username }, account: { visibility, createdAt, updatedAt }}, meta: { requestId }}`                                |

### D. Notes

| Endpoint          | Method | Purpose                                                                                                                                             | Request Body                                                                                             | Error Responses                                                                                      | Success Response                                                                                                                                                              |
| ----------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/notes`          | POST   | Create a note                                                                                                                                       | Required: `title`, `content`; Optional: `headerImageUri`, `tags`, `visibility`                           | `400 Bad Request`, `401 Unauthorized`, `409 Conflict`                                                | `201 Created` + `{ data: { note: { id, title, content, headerImageUri, tags, visibility, createdAt, updatedAt }}, meta: { requestId } }`                                      |
| `/notes`          | GET    | List the authenticated user's own notes as summaries, newest notes first. If the user has no notes, return the `data.notes` field as an empty array | None; optional query parameters for pagination and filtering. Default filter: by `createdAt` field, DESC | `401 Unauthorized`                                                                                   | `200 OK` + `{ data: { notes: [{ id, title, author: { id, username, profileImageUri }, headerImageUri, tags, createdAt }, {}, {}]}, meta: { requestId } }`                     |
| `notes/{noteId}`  | GET    | Retrieve a single note, including its full content                                                                                                  | N/A                                                                                                      | `401 Unauthorized` if authentication is required by the note's `visibility` setting, `404 Not Found` | `200 OK` + `{ data: { note: { id, title, content, author: { id, username, profileImageUri }, tags, headerImageUri, createdAt, updatedAt }}, meta: { requestId }}`             |
| `/notes/{noteId}` | PATCH  | Edit a note owned by the authenticated user                                                                                                         | Any of: `title`, `content`, `headerImageUri`, `tags`, `visibility`                                       | `400 Bad Request`, `401 Unauthorized`, `404 Not Found`                                               | `200 OK` + `{ data: { note: { id, title, author: { id, username, profileImageUri }, content, tags, headerImageUri, visibility, createdAt, updatedAt }}, meta: { requestId }}` |
| `/notes/{noteId}` | DELETE | Delete a note owned by the authenticated user                                                                                                       | N/A                                                                                                      | `401 Unauthorized`, `404 Not Found`                                                                  | `204 No Content`                                                                                                                                                              |
| `/notes/explore`  | GET    | List public notes from other users for Explore feed                                                                                                 | Optional pagination, tag, and author filters                                                             | `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`                                     | `200 OK` + `{ data: { notes: [{id, title, author: { id, username, profileImageUri}, headerImageUri, tags, createdAt, updatedAt }, {}, {}]}, meta: { requestId }}`             |

A `note`'s visibility is optional when creating it. If ommitted, it inherit's the user's default visibility preference (`noteVisibility`). The visibility of an existing note is independent of subsequent preference changes for now.

For `GET /notes/{noteId}` authentication and checking of user's access to that note (if it is the note owner, they can read it. If not, they cannot - but the API will return a `404 Not Found` for private notes so the API doesn't reveal a private note exists) is required for private notes, but public notes can be read without authentication

### E. Following & Followers

| Endpoint                 | Method | Purpose                                     | Request Body                                      | Error Responses                                                                                | Success Response                                                                                |
| ------------------------ | ------ | ------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/users/{userId}/follow` | PUT    | Follow a user                               | N/A                                               | `400 Bad Request` (self-follow), `401 Unauthorized`, `404 Not Found`(non-existent target user) | `204 No Content`                                                                                |
| `/users/{userId}/follow` | DELETE | Unfollow a user                             | N/A                                               | `401 Unauthorized`, `404 Not Found` (non-existent target user)                                 | `204 No Content`                                                                                |
| `/users/following`       | GET    | List users the authenticated user follows   | None; optional pagination, sorting, and filtering | `401 Unauthorized`                                                                             | `200 OK` + `{ data: { users: [{ id, username, profileImageUri}, {}, {}]}, meta: { requestId }}` |
| `/users/followers`       | GET    | List users following the authenticated user | None; optional pagination, sorting, and filtering | `401 Unauthorized`                                                                             | `200 OK` + `{ data: { users: [{ id, username, profileImageUri}, {}, {}]}, meta: { requestId }}` |

Note that self-following is not allowed and will be rejected with `400 Bad Request` error.

### F. Likes & Saves

| Endpoint               | Method | Purpose                                                                 | Request Body                                                      | Error Responses                                                         | Success Response                                                                                                                                                  |
| ---------------------- | ------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/notes/{noteId}/like` | PUT    | Like a public note written by another user (or yourself)                | N/A                                                               | `401 Unauthorized`, `404 Not Found`                                     | `204 No Content`                                                                                                                                                  |
| `/notes/{noteId}/like` | DELETE | Remove a like of another user's note                                    | N/A                                                               | `401 Unauthorized`, `404 Not Found` (for nonexistent/inaccessible note) | `204 No Content`                                                                                                                                                  |
| `/notes/saved`         | GET    | List saved notes                                                        | None; optional pagination, sorting, and filtering                 | `401 Unauthorized`                                                      | `200 OK` + `{ data: { notes: [{id, title, author: { id, username, profileImageUri}, headerImageUri, tags, createdAt, updatedAt }, {}, {}]}, meta: { requestId }}` |
| `/notes/{noteId}/save` | PUT    | Save a note to a personal collection (can be written by self or others) | None; in the future, allow users to create different collections? | `401 Unauthorized`, `404 Not Found`                                     | `204 No Content`                                                                                                                                                  |
| `/notes/{noteId}/save` | DELETE | Remove a saved note from collection                                     | N/A                                                               | `401 Unauthorized`, `404 Not Found` (for nonexistent/inaccessible note) | `204 No Content`                                                                                                                                                  |

## API Contract and Conventions

### OpenAPI 3.1 YAML document

See the [OpenAPI document](./openapi.yaml)

### Conventions and Style Choices

- Path prefix => all endpoint paths are relative to the `/api/v1` prefix
- Data formats =>
  - For image uploads, utilize `multipart/form-data`
  - JSON requests and responses, via TypeBox and `@fastify/typebox-type-provider`
- Authentication => session cookie
- Resource identifiers => Numeric IDs
- Single `content` field for Markdown note content

### HTTP Response Contract

- `201 Created`: New resource successfully created
- `200 OK`: Successful reads & updates
- `204 No Content`: Successful deletion of a resource
- `400 Bad Request`: Invalid input or malformed request data
- `401 Unauthorized`: Missing or invalid authentication when authentication is required
- `404 Not Found`: Resource not found or deliberately hidden because requester lacks access
- `409 Conflict`: Conflicting state, such as alread-registered email address
- `500 Internal Server Error`: Unexpected server failure

## Response Envelopes

The goal of the following conventions are to create a predictable response structure and to give us room to add additional resources if necessary.

### 1. Successful Response Schema

Successful responses expect the following (general) shape for the response data:

```JSON
{
    "data": {},
    "meta": {
      "requestId": "req_xxxx"
    }
}
```

So, for example, a successful response for a `GET /users/:userId` request would be:

```JSON
{
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@user.com",
    }
  },
  "meta": {
    "requestId": "req_1234"
  }
}
```

### A. Always use `data` for successful responses

The contents of `data` should identify the resource being returned.

#### Examples

Single user:

```JSON
{
  "data": {
    "user": {}
  }
}
```

Single note:

```JSON
{
  "data": {
    "note": {}
  }
}
```

Multiple notes:

```JSON
{
  "data": {
    "notes": []
  }
}
```

### B. Reserve `meta` for information _about_ the response

For example:

```JSON
{
  "data": {
    "notes": []
  },
  "meta": {
    "requestId": "req_122354",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

Some useful future metadata might include:

- `requestId` for debugging and tracing requests
- `pagination` object with details for paginated collections
- `hasMore for determining whether additional results exist

_Note:_ `meta` is not the place for log information -- those belong on the backend (server). Instead, return identifiers and info that would be helpful to the client/developer in understanding the response.

### C. All persistent resources need a `createdAt` field, but only non-relationship resources need both a `createdAt` and `updatedAt` fields.

These fields will be created server side, automatically. However, they can be useful in responses in case the user wants to sort by creation date, recently updated, or to view a note created on a particular date or notes during a specific time range.

**Fields that need both:**

- Users
- Notes
- Profiles

**Fields that only need `createdAt`:**

- Likes
- Follows

So, to recap:

- Persistent resources must include `createdAt` and `updatedAt` fields
- Successful responses will always be wrapped in a `{ data: {} }` envelope, and will have a `meta: {}` field containing relevant metadata (such as `requestId`) for the resource.

For example, instead of a response returning:

```JSON
{
  "userId": 1,
  "username": "testuser",
  "email": "test@email.com"
}
```

We would instead return:

```JSON
{
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@email.com",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-01T12:00:00.000Z"
    }
  },
  "meta": {
    "requestId": "req_123456"
  }
}
```

## Error Envelopes

Error envelopes will include an object which contains`error:` and `meta:` fields. The `error:` field will be an object that contains the following fields:

- `code` - The type of error (i.e. "NOT_FOUND" or "BAD_REQUEST")
- `message` - A slightly longer explanation string (i.e. "The requested resource could not be found.")
- `details` - An optional field that contains an object with further information about the error (if any further information exists). It's exact type is unknown. (optional)

The `meta` field will also be an object that contains the following fields:

- `requestId` - for debugging and tracing requests
- `pagination` - object with details about a paginated collection (optional)
- `filteredBy` - object with array of filters used in queries (optional)

So, for example, for an `HTTP/1.1 404 Not Found` error, we would return:

```JSON
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found."
  },
  "meta": {
    "requestId": "req_1234"
  }
}
```

Or, a validation error could look like:

```JSON
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": {
      "fields": {
        "password": "Must be at least 8 characters."
      }
    }
  },
  "meta": {
    "requestId": "req_123456"
  }
}
```
