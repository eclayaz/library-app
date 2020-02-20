# Library APP

### Project setup 
```
docker-compose up -d --build
```
### Configurations
I have included the `.env.loccal` file with this project. Change this file if you want to change the CouchDB endpoint.
```
VUE_APP_COUCH_DB_BASEURL = http://localhost:5984
```
##### CouchDB
configuration file - `./data/couchdb/config/local.ini`
admin - `root:root`

### Sample data
Librarian usernames
- librarian1
- librarian2
- librarian3

Readers usernames
- reader1
- reader2
- reader3

**`123` is the password for all the logins**

### Features!
- Login
- Register as Reader

Libarian
  - CRUD on Books
  - Search Books
  - Assign Books to Registered users

Reader:
  - Search Books
  - Checkout Books
  - Return Books