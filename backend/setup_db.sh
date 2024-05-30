# Load environment variables from the root .env file
set -o allexport; . ../.env; set +o allexport

# Run schema files
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_DATABASE -f db/schema/shelters.sql
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_DATABASE -f db/schema/books.sql

# Run seed files
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_DATABASE -f db/seeds/shelters.sql
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_DATABASE -f db/seeds/books.sql