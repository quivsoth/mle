using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using MongoDB.Driver;
using MongoDB.Bson;

using MongoDB.Driver.Linq;

namespace workerConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            var client = new MongoClient("mongodb://192.168.1.3:27017/shop");
            IMongoDatabase db = client.GetDatabase("shop");


            db.DropCollection("dummy");
            db.CreateCollection("dummy");



            // var bruja = db.GetCollection<BsonDocument>("bruja");
            // var documents = bruja.Find(new BsonDocument()).ToList();

            //  var doc = new BsonDocument
            // {
            //     {"name", "BMW"},
            //     {"price", 34621}
            // };

            // var dummy = db.GetCollection<BsonDocument>("dummy");
            // dummy.InsertOne(doc);

            // foreach (BsonDocument doc in documents)
            // {
            //     Console.WriteLine(doc.ToString());
            // }




            // var filter = Builders<BsonDocument>.Filter.Eq("price", 29000);


            // var doc = shop.Find(null).FirstOrDefault();
            // Console.WriteLine(doc.ToString());


            // const string workerPath = "/worker/check_please";
            // const string storingFolder = "check_please/";
            // string productName = "Check Please! ";
            // int seeder = 1;
            // List<Product> products = new List<Product>();
            // DirectoryInfo dir = new DirectoryInfo(Path.Combine(Directory.GetCurrentDirectory() + workerPath));

            // var listDir  = dir.GetDirectories("*",SearchOption.AllDirectories)
            //     .Where(dir=>!dir.GetDirectories().Any())
            //     .ToList();

            // foreach(DirectoryInfo d in listDir) {
            //     Product p = new Product(seeder, productName, "Description", 111, 4, true);

            //     seeder++;
            //     IEnumerable<System.IO.FileInfo> fileList = d.GetFiles("*.*", System.IO.SearchOption.AllDirectories);
            //     foreach(FileInfo f in fileList) {
            //         p.productThumbs.Add(storingFolder + f.Name);
            //     }
            //     products.Add(p);
            // }
            // var json = JsonSerializer.Serialize(products);
            // Console.WriteLine(json);
        }
    }

    public class Product
    {
        private int _productId;
        public int productId
        {
            get { return _productId; }   // get method
            set { _productId = value; }  // set method
        }

        private string _productName;
        public string productName
        {
            get { return _productName; }   // get method
            set { _productName = value; }  // set method
        }

        private string _description;
        public string description
        {
            get { return _description; }   // get method
            set { _description = value; }  // set method
        }

        private List<string> _productThumbs;
        public List<string> productThumbs
        {
            get { return _productThumbs; }
            set { _productThumbs = value; }
        }

        private int _price;
        public int price
        {
            get { return _price; }   // get method
            set { _price = value; }  // set method
        }

        private int _size;
        public int size
        {
            get { return _size; }   // get method
            set { _size = value; }  // set method
        }

        private bool _active;
        public Boolean active
        {
            get { return _active; }
            set { _active = value; }
        }



        public Product(int productId, string productName, string description, int price, int size, bool active)
        {
            this.productId = productId;
            this.productName = productName;
            this.description = description;
            this.productThumbs = new List<string>();
            this.price = price;
            this.size = size;
            this.active = active;
        }
        public Product(){
            productThumbs = new List<string>();
        }
    }
}