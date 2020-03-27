(async () => {
	require('dotenv').config();

	const parse = require('co-body');
	const http = require('http');
	const url = require('url');
	const querystring = require('querystring');
	const __ = require('./utils');

	/* config */
	const PORT = +process.env.PORT || 3019;
	const DEBUG = process.env.DEBUG || false;
	const TOKEN = process.env.TOKEN || false;

	const TJ_KEY = process.env.TJ_KEY || false;
	const VC_KEY = process.env.VC_KEY || false;
	const DTF_KEY = process.env.DTF_KEY || false;

	console.log('APP_CONFIG', {
		PORT,
		TOKEN: !!DEBUG,
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
				await serve_webhook('tj', request, query);
			}
			if (pathname == '/webhook_dtf') {
				await serve_webhook('dtf', request, query);
			}
			if (pathname == '/webhook_vc') {
				await serve_webhook('vc', request, query);
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

	async function serve_webhook(website, request, query) {
		if (TOKEN && query.token !== TOKEN) return;
		let body = await parse(request);
		console.log('serve_webhook', website, body, query);
	}
})();
