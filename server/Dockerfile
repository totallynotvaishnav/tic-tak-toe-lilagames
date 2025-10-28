# Use official Nakama image
FROM heroiclabs/nakama:3.20.1

# Copy config and game modules
COPY local.yml /nakama/data/local.yml
COPY build/ /nakama/data/modules/build/

# Expose Nakama ports
EXPOSE 7349 7350 7351

# Use DATABASE_ADDRESS from environment
CMD /bin/sh -ecx "echo Using DATABASE_ADDRESS=\$DATABASE_ADDRESS && \
    /nakama/nakama migrate up --database.address \$DATABASE_ADDRESS && \
    exec /nakama/nakama --config /nakama/data/local.yml --database.address \$DATABASE_ADDRESS"
