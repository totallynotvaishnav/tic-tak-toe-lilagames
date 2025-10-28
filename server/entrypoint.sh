#!/bin/sh
set -e

echo "==========================================="
echo "🚀 Nakama Render Entrypoint"
echo "==========================================="
echo ""
echo "--- ENVIRONMENT VARIABLES ---"
env
echo "-----------------------------"
echo ""

# Check if DATABASE_ADDRESS is set
if [ -z "$DATABASE_ADDRESS" ]; then
    echo "❌ ERROR: DATABASE_ADDRESS environment variable is not set!"
    echo ""
    echo "Available environment variables:"
    env | grep -i database || echo "No DATABASE related variables found"
    echo ""
    echo "Please set DATABASE_ADDRESS in Render dashboard"
    exit 1
fi

echo "✅ DATABASE_ADDRESS is set"
echo "Database host: ${DATABASE_ADDRESS#*@}"
echo ""

# Add sslmode=require if not present
DB_URL="$DATABASE_ADDRESS"
case "$DB_URL" in
    *"?sslmode="*)
        echo "✓ SSL mode already configured"
        ;;
    *"?"*)
        DB_URL="${DB_URL}&sslmode=require"
        echo "✓ Added sslmode=require to existing params"
        ;;
    *)
        DB_URL="${DB_URL}?sslmode=require"
        echo "✓ Added sslmode=require"
        ;;
esac

echo ""
echo "Waiting for database to be ready..."
sleep 3

# Run migrations
echo "Running database migrations..."
/nakama/nakama migrate up --database.address "$DB_URL"
echo "✅ Migrations complete"

echo ""
echo "==========================================="
echo "Starting Nakama server..."
echo "Config: /nakama/data/local.yml"
echo "Database: ${DB_URL%%@*}@***"
echo "==========================================="
echo ""

exec /nakama/nakama --config /nakama/data/local.yml --database.address "$DB_URL"