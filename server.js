const express = require("express");
const path = require('path');
const redis = require("redis");
const jsrender = require("jsrender");

const app = express();
const redisClient = redis.createClient(process.env.REDIS_URL);

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, './order.html'));
});

app.get('/order/cached', async (req,res) => {
	const data = req.query;
	const cached = {...data, date: new Date().getTime()};
	await redisClient.lpush("cached", JSON.stringify(cached));
	res.sendFile(path.join(__dirname, './order.html'));
});

app.get('/Admin', async (req,res) => {
    // Get cached orders
    await redisClient.lrange("cached", 0, -1, function(err, items){
        const cached = items.map((order) => JSON.parse(order));
        // Using JSRender render template with results from cached orders
        var tmpl = jsrender.templates('./Admin.html');
        var html = tmpl.render({orders: cached}); // Render
        res.send(html);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})