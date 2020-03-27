(async () => {
	require('dotenv').config();

	const http = require('http');
	const url = require('url');
	const querystring = require('querystring');
	const __ = require('./utils');

	/* config */
	const PORT = +process.env.PORT || 3019;
	const DEBUG = process.env.DEBUG || false;

	const TJ_KEY = process.env.TJ_KEY || false;
	const VC_KEY = process.env.VC_KEY || false;
	const DTF_KEY = process.env.DTF_KEY || false;

	console.log('APP_CONFIG', {
		PORT,
		DEBUG: !!DEBUG,
		TJ_KEY: !!TJ_KEY,
		VC_KEY: !!VC_KEY,
		DTF_KEY: !!DTF_KEY,
	});

	/* serve requests */
	const server = http.createServer(async (request, response) => {
		let { pathname, query } = url.parse(request.url);
		query = querystring.parse(query);

		/* GET */
		if (request.method == 'GET') {
			if (pathname == '/webhook_test') {
				serve_webhook('test', request, query);
			}
		}

		/* POST */
		if (request.method == 'POST') {
			if (pathname == '/webhook_tj') {
				serve_webhook('tj', request, query);
			}
			if (pathname == '/webhook_dtf') {
				serve_webhook('dtf', request, query);
			}
			if (pathname == '/webhook_vc') {
				serve_webhook('vc', request, query);
			}
		}

		response.setHeader('status', 200);
		response.end('OK');
	});

	/* start server */
	server.listen(PORT, err => {
		if (err) return console.log('something bad happened', err.message);
		console.log(`server is listening on ${PORT}`);
	});

	function serve_webhook(website, request, query) {
		console.log('serve_webhook', website, request.body, query);
	}
})();
