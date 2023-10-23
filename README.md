# MLE - Baja La Bruja
Shopping cart for Baja La Bruja Vintage business.



Installation

* Clone the repo and run npm install
* You will need to create a DotEnv (.env) file and set DB_HOST="mongo source"
* Run npm start


Install Container
* Terminal into the /container directory and run: "docker build -t mle-website ."




Import MongoData and set up DB/Collection by running the script from the root folder
mongoimport --db shop --collection bruja --drop --file ./collections.json --jsonArray

mongoimport --uri "mongodb://192.168.1.3:27017/shop" --collection dummy --drop --file collections.json


Build in OCP
oc new-app \
    -e MONGODB_USER=kube \
    -e MONGODB_PASSWORD=8YxcC?6aex]yDb*[ \
    -e MONGODB_DATABASE=utils \
    -e MONGODB_ADMIN_PASSWORD=admin \
    registry.redhat.io/rhscl/mongodb-26-rhel7