(async () => {
	require('dotenv').config();

	const parse = require('co-body');
	const axios = require('axios');

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
		TOKEN: !!TOKEN,
		DEBUG: !!DEBUG,
		TJ_KEY: !!TJ_KEY,
		VC_KEY: !!VC_KEY,
		DTF_KEY: !!DTF_KEY,
	});

	const ENDPOINTS = {
		tj: 'https://api.tjournal.ru/v1.8/',
		dtf: 'https://api.dtf.ru/v1.8/',
		vc: 'https://api.vc.ru/v1.8/',
	};
	const TOKENS = {
		tj: TJ_KEY,
		dtf: VC_KEY,
		vc: DTF_KEY,
	};

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
		if (!body || body.type != 'new_comment' || !body.data.text) return;

		if (DEBUG) console.log('serve_webhook', 'new_comment');

		let text = body.data.text;

		let matches = __.findMatches(/t\.me\/([a-z0-9\/]+)/gm, text);
		if (matches && matches.length) {
			if (DEBUG) console.log('serve_webhook_matched', website, text);

			let reply = `Зеркало t.me:`;
			matches.forEach(match => {
				reply += `\nhttps://tgrm.cc/${match[1]}`;
			});
			sendReply(website, body.data.content.id, body.data.id, reply);
		}
	}

	async function sendReply(website, postID, commentID, text) {
		let url = ENDPOINTS[website];
		let token = TOKENS[website];

		if (!url || !token) return;

		if (DEBUG) console.log('sendReply', postID, commentID, text);

		var [err, resp] = await __.to(
			axios.request({
				method: 'POST',
				baseUrl: url,
				url: 'comment/add',

				data: querystring.stringify({
					id: postID,
					text,
					reply_to: commentID,
				}),

				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'X-Device-Token': token,
					'User-agent': 'tgrm-bot/v0.0.1',
				},
			}),
		);
		if (err) console.error('sendReply.err', err.message);
		if (DEBUG) console.log('sendReply.success');
	}
})();
