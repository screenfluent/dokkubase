# Database Directory

This directory contains SQLite database files:

- `dokkubase.db` - Main database file containing sessions
- `.gitkeep` - Keeps the directory in git (database files are ignored)

## Notes

- Database is created automatically on app start
- All tables are created if they don't exist
- Database files (*.db) are ignored by git
- Don't commit any database files to version control 