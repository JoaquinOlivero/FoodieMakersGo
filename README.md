# FoodieMakersGo

FoodieMakers is a "marketplace" for food manufacturers where they can publish their products and increase their reach to new potential clients.

## FoodieMakers' main user features:
- Account creation.
- Registered users can create a "store" that will allow them to publish products with images and a description.
- Chat system where potential clients can contact manufacturers and establish a back and forth conversation.
- Published products can receive reviews from logged in users and get a rating that will help them show up in the front page.
- All users can search for products using the search bar.

## Tech used:
### Go
- The Fiber framework was used for the REST api and the websocket server.
- JWT encrypted authentication.

### PostgreSQL
- To communicate betweeen Go and PostgreSQL I used the Go [sql package](https://pkg.go.dev/database/sql) so that I could write and practice SQL queries instead of using an ORM.

### TypeScript - Next.js
- Next.js was the choice for the frontend framework.
- No other 3rd party library, package or framework was used besides Next.js.
