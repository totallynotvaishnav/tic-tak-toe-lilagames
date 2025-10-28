# Use official Nakama image
FROM heroiclabs/nakama:3.17.1

# Use your config (rename railway.yml to local.yml if needed!)
COPY local.yml /nakama/data/local.yml

# Copy game module code (your build/index.js and dependencies)
COPY build/ /nakama/data/modules/build/

# Expose Nakama ports (API, console, and GRPC if needed)
EXPOSE 7349 7350 7351

# Entrypoint uses the DATABASE_ADDRESS env variable passed from Render
CMD ["/bin/sh", "-ecx", "/nakama/nakama migrate up --database.address $DATABASE_ADDRESS && exec /nakama/nakama --config /nakama/data/local.yml --database.address $DATABASE_ADDRESS"]
