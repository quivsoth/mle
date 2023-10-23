FROM fedora

RUN dnf install -y git nodejs npm
WORKDIR /usr/src/app
RUN git clone https://www.github.com/quivsoth/mle
WORKDIR /usr/src/app/mle
RUN /usr/bin/npm install
#RUN printf "MONGO_DB=mongodb://doom:27017/shop\nPORT=8080" >> .env
RUN npm start
EXPOSE 8080
CMD [ "/usr/bin/npm", "start" ]