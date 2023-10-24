FROM fedora

RUN dnf install -y git nodejs npm
WORKDIR /usr/src/app
RUN git clone https://www.github.com/quivsoth/mle
WORKDIR /usr/src/app/mle
RUN /usr/bin/npm install
EXPOSE 8081
CMD [ "/usr/bin/npm", "start" ]