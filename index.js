var express = require("express");
var app = express();
var redis = require("redis");
const client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

// initialize values for: header, left, right, article and footer using the redis client

(async () => {

  client.on('error', (err) => console.log('Redis Client Error', err));

  client.on('ready', () => console.log('Redis is ready'));

  await client.connect()

  await client.MSET({'header': 0, 'left': 0,  'article': 0, 'right': 0, 'footer': 0})

  const value = await client.MGET(['header', 'left', 'article', 'right', 'footer']);

  console.log(value)
})();

async function data() {
  try {
    const value = await client.MGET(['header', 'left', 'article', 'right', 'footer']);
    console.log("got data")
    console.log(value)
    const data = {
      header: Number(value[0]),
      left: Number(value[1]),
      article: Number(value[2]),
      right: Number(value[3]),
      footer: Number(value[4]),
    };
    return data;
  }
    catch (err) {next(err)}
}
    
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log("Get data");
    console.log(data);
    res.send(data);
  });
});

// add new values
app.get("/update/:key/:value", async (req, res) => {
    const key = req.params.key;
    let value = Number(req.params.value);
    console.log("updatekeyvalue")
      // new value
      const reply = await client.get(key);
      console.log(reply)
      value = Number(reply) + value;
      await client.set(key, value);

      // return data to client
      data().then((data) => {
        console.log("return data")
        console.log(data);
        res.send(data);
      })
    });

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  console.log("client quit");
  client.quit();
});

