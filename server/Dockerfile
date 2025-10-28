# Use official Nakama image
FROM heroiclabs/nakama:3.20.1


# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use entrypoint script for Render
ENTRYPOINT ["/entrypoint.sh"]

# Copy config and game modules
COPY local.yml /nakama/data/local.yml
COPY build/ /nakama/data/modules/build/

# Expose Nakama ports
EXPOSE 10000 10001


