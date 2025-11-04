
#backend
FROM node:20.5.0

WORKDIR /app

# ติดตั้ง Netcat
RUN apt-get update && apt-get install -y netcat-openbsd

COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .

# Copy the entrypoint script into the container
COPY entrypoint.sh ./

# Make sure the entrypoint.sh script is executable
RUN chmod +x entrypoint.sh

# Set the entrypoint to your script
ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 3000

# CMD is the default command to run when the container starts
CMD ["node", "server.js"]

