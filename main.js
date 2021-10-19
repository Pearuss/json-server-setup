const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const queryString = require('query-string');

server.use(middlewares);

server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  } else if (req.method === 'PATCH') {
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCountHeader = headers['x-total-count'];
  //   for (const key in totalCountHeader) {
  //     console.log(key);
  //   }
  //   console.log(count);

  if (req.method === 'GET' && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedUrl.query);
    const totalHeaderArray = totalCountHeader['__wrapped__'];
    let count = 0;
    for (const key in totalHeaderArray) {
      totalHeaderArray[key].map(() => {
        count++;
      });
    }
    // console.log(i);
    // const count = totalHeaderArray.cities.length + totalHeaderArray.students.length;

    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 10,
        _totalRow: Number.parseInt(count),
      },
    };
    // console.log(results);
    return res.jsonp(result);
  }
  res.jsonp(res.locals.data);
};

// Use default router
server.use(router);
server.listen(3001, () => {
  console.log('JSON Server is running');
});
