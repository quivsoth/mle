var express = require('express');
var router = express.Router();
const {MongoClient} = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Baja La Bruja - ', collections: collection101 });
});

/* GET Collections page. */
router.get('/collections', function(req, res, next) {

  (async function() {
    const collections = await getCollections();
console.log(collections);
    var productChunks = [];
    var chunkSize = 3;
    for (let i = 0; i < collections.length; i+= chunkSize) {
      productChunks.push(collections.slice(i, i + chunkSize));
    }

    res.render('shop/collections', { title: 'Baja La Bruja - Collections', collections: productChunks });
  })();
});

async function getCollections(){
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  var uri = `mongodb://192.168.1.3:27017`;
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
      // Connect to the MongoDB cluster
      await client.connect();
      const cursor = client.db("shop").collection("collections").find({active: true});
      const results = await cursor.toArray();
      return results;
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}

module.exports = router;