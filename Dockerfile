FROM ubuntu:latest

RUN apt-get update && apt-get install -y npm

ENV STATIC_IMAGES_DIRECTORY /app/images

COPY start.sh /app/
ADD bin/ /app/bin/
ADD src/ /app/src/

WORKDIR /app/src

RUN npm install && npm run build

WORKDIR /

CMD /app/./start.sh