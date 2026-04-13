

## Delete 4 Users

All four users were found in the database:

| Email | User ID |
|-------|---------|
| concreteandpeaches@gmail.com | d3a48f79-ef4f-482c-b24a-4988bd7bcd02 |
| questjhunter@gmail.com | ed6b3043-65e7-49b3-8ab2-f090ee78c395 |
| movies@crushedvelevetproductions.com | d9b0da85-8f9c-4eda-ba21-b3905ca24cc9 |
| golokolsocial@gmail.com | 1d25b015-b4a0-40c4-9a5f-87cdb6b52202 |

### Steps

1. **Create a one-time edge function** (`delete-users`) that accepts a list of user IDs and deletes them using the Supabase Admin API (`supabase.auth.admin.deleteUser()`)
2. **Deploy and invoke** it with the 4 user IDs above
3. **Clean up** any related records in `artist_profiles` or other tables referencing these users (most have `ON DELETE CASCADE` so this should be automatic)
4. **Delete the edge function** after use — it's a one-time operation

No changes to the app codebase. This is purely a backend admin operation.

