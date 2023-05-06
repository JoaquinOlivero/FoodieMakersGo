#! /bin/bash

# Start first process. Golang API.
cd /app/bin/
./FoodieMakersGo-arm64-linux &

# Start second process. Next.js front-end.
cd ../src/
npm run start &

# Wait for any process to exit
wait -n
  
# Exit with status of process that exited first
exit $?