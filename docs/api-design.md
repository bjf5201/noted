# Noted API Design

## Scope

For now, the API is organized around five specific areas, each with a set of specific features. The project will iteratively add additional features once these initial endpoints are complete:

A. **Authentication & Account Management:**

| Endpoint         | Method | Purpose                                           | Request Body                    | Responses                                                       |
| ---------------- | ------ | ------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `/auth/register` | POST   | Create a new user account                         | `email`, `username`, `password` | `201 Created`, `400 Bad Request`, `409 Conflict`                |
| `/auth/session`  | POST   | Log in and establish an authenticated session     | `email`, `password`             | `200 OK`, `400 Bad Request`, `401 Unauthorized`                 |
| `/auth/session`  | DELETE | Log out and invalidate the current session        | N/A                             | `204 No Content`, `401 Unauthorized`                            |
| `/users/me`      | GET    | Retrieve the authenticated user's account details | N/A                             | `200 OK`, `401 Unauthorized`                                    |
| `/users/me`      | PATCH  | Update account fields, such as email or username  | Fields to update                | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `409 Conflict` |

B. **Profiles and Preferences**

| Endpoint                 | Method | Purpose                                                             | Request Body                                                 | Responses                                                       |
| ------------------------ | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `users/{userId}/profile` | GET    | View a user's public profile                                        | N/A                                                          | `200 OK`, `401 Unauthorized `, `404 Not Found`                  |
| `/users/me/profile`      | GET    | View the authenticated user's own public profile                    | N/A                                                          | `200 OK`, `404 Not Found`, `401 Unauthorized`                   |
| `/users/me/profile`      | PUT    | Create or replace the authenticated user's profile                  | Optional `name`, `summary`, `bio`, `tags`, `profileImageUri` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `409 Conflict` |
| `/users/me/profile`      | PATCH  | Update select profile fields                                        | Fields to update                                             | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `409 Conflict` |
| `/users/me/preferences`  | GET    | Retrieve authenticated users's account preferences                  | N/A                                                          | `200 OK`, `401 Unauthorized`                                    |
| `/users/me/preferences`  | PATCH  | Change default note visibility (or other, future preference fields) | `defaultNoteVisibility: public` or `private`                 | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `409 Conflict` |

|

C. **Notes**

| Endpoint           | Method | Purpose                                                     | Request Body                                                                                           | Responses                                                                                                      |
| ------------------ | ------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `/notes`           | POST   | Create a note                                               | Required: `title`, `content`; Optional: `headerImageUri`, `tags`, `noteVisibility`                     | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `409 Conflict`                                           |
| `/notes`           | GET    | List the authenticated user's own notes, newest notes first | None; optional query parameters for pagination and filtering. Default filter: by `created` field, DESC | `200 OK`, `401 Unauthorized`, `404 Not Found`                                                                  |
| `notes/{noteId}`   | GET    | Retrieve a single note, including its full content          | N/A                                                                                                    | `200 OK`, `401 Unauthorized` if authentication is required by the note's `visibility` setting, `404 Not Found` |
| `/notes/{noteId}`  | PATCH  | Edit a note owned by the authenticated user                 | Any of: `title`, `content`, `headerImageUri`, `tags`, `visibility`                                     | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`                                               |
| `/notes/{notedId}` | DELETE | Delete a note owned by the authenticated user               | N/A                                                                                                    | `204 No Content`, `401 Unauthorized`, `404 Not Found`                                                          |
| `/notes/explore`   | GET    | List public notes from other users for Explore feed         | Optional pagination, tag, and author filters                                                           | `200 OK`                                                                                                       |

A `note`'s visibility is optional when creating it. If ommitted, it inherit's the user's default visibility preference (`noteVisibility`). The visibility of an existing note is independent of subsequent preference changes for now.

For `GET /notes/{noteId}` authentication and checking of user's access to that note (if it is the note owner, they can read it. If not, they cannot - but the API will return a `404 Not Found` for private notes so the API doesn't reveal a private note exists) is required for private notes, but public notes can be read without authentication

D. **Following and Followers**

| Endpoint                 | Method | Purpose                                     | Request Body                                      | Responses                                                                                |
| ------------------------ | ------ | ------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/users/{userId}/follow` | PUT    | Follow a user                               | N/A                                               | `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict` |
| `/users/{userId}/follow  | DELETE | Unfollow a user                             | N/A                                               | `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict` |
| `/users/me/following`    | GET    | List users the authenticated user follows   | None; optional pagination, sorting, and filtering | `200 OK`, `401 Unauthorized`                                                             |
| `/users/me/followers`    | GET    | List users following the authenticated user | None; optional pagination, sorting, and filtering | `200 OK`, `401 Unauthorized                                                              |

Note the self-following is not allowed and will be rejected with `400 Bad Request` or `401 Unauthorized` (TODO: Decide which error message)

E. **Likes and Saves**

| Endpoint               | Method | Purpose                                                             | Request Body                                                                   | Responses                                                                |
| ---------------------- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `/notes/{noteId}/like` | PUT    | Like a public note written by another user                          | N/A                                                                            | `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| `/notes/{noteId}/like` | DELETE | Remove a like of another user's note                                | N/A                                                                            | `204 No Content`, `401 Unauthorized`, `404 Not Found`                    |
| `/users/me/saved`      | GET    | List saved notes                                                    | None; optional pagination, sorting, and filtering                              | `200 OK`, `401 Unauthorized`, `404 Not Found`                            |
| `/notes/{noteId}/save` | PUT    | Save a public note written by another user to a personal collection | None; in the future, allow users to create different collections? TODO: Decide | `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| `/notes/{noteId}/save` | DELETE | Remove a saved note from collection                                 | N/A                                                                            | `204 No Content`, `401 Unauthorized`, `404 Not Found`                    |

## API Contract

### OpenAPI 3.1 YAML document

See the [OpenAPI document](./openapi.yaml)

### Conventions and Style Choices

- Base path => n `/api/v1` prefix
- Data formats => JSON requests and responses, via TypeBox and `@fastify/typebox-type-provider`
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
- `422 Unprocessable Content`: Can be used for semantically invalid input (this or just use `400 Bad Request`)
- `500 Internal Server Error`: Unexpected server failure

## Questions

1. In new OpenAPI spec, userId is returned in the response for `GET /
