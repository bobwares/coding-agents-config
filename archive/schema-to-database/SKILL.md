---
name: schema-to-database
description: Generate database tables, seed data, and entity code from an extended JSON schema.
---

Generate:

- PostgreSQL DDL
- Seed SQL
- detect project type: typescript or java.


Usage:

``` javascript

   node generate-from-schema.js <schema-file> <type>
   
```

Examples:

``` javascript

   node generate-from-schema.js user-schema.json typescript
   
   node generate-from-schema.js user-schema.json java
   
``` 
