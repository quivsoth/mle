FROM fedora as build
WORKDIR /usr/src/build
RUN dnf install -y git npm && dnf clean all

RUN git clone https://www.github.com/quivsoth/mle.git
WORKDIR /usr/src/build/mle
RUN /usr/bin/npm install


FROM node:16.15.1-alpine as production

RUN apk add iputils
ARG DBNAME=pkmongo
ARG PORT=8080
ARG MONGOPORT=27017
ARG STARTDB=shop

ENV PORT=${PORT}
ENV MONGO_DB=mongodb://${DBNAME}:${MONGOPORT}/${STARTDB}

COPY --from=build /usr/src/build/mle /usr/src/mle
WORKDIR /usr/src/mle
EXPOSE ${PORT}
ENTRYPOINT ["npm", "start"]