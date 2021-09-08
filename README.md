# MLE - Baja La Bruja
Shopping cart for Baja La Bruja Vintage business.



Installation

* Clone the repo and run npm install
* You will need to create a DotEnv (.env) file and set DB_HOST="mongo source"
* Run npm start


Import MongoData and set up DB/Collection by running the script
mongoimport --uri "mongodb://192.168.1.3:27017/shop" --collection dummy --drop --file collections.json