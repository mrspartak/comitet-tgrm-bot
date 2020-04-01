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
	const WEBHOOK_URL = process.env.WEBHOOK_URL || false;

	const TJ_KEY = process.env.TJ_KEY || false;
	const VC_KEY = process.env.VC_KEY || false;
	const DTF_KEY = process.env.DTF_KEY || false;

	const logInstance = require('./utils/log');
	const log = new logInstance({
		level: DEBUG ? 'debug' : 'info',
	});

	log.info('APP_CONFIG', {
		PORT,
		TOKEN: !!TOKEN,
		WEBHOOK_URL: !!WEBHOOK_URL,
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
		dtf: DTF_KEY,
		vc: VC_KEY,
	};

	let STATS = {
		tj: 0,
		dtf: 0,
		vc: 0,
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

		if (request.method == 'GET') {
			if (pathname == '/webhook_subscribe') {
				if (!TOKEN || query.token == TOKEN) {
					if (query.website) await webhookSubscribe(query.website);
				}
			}
			if (pathname == '/webhook_unsubscribe') {
				if (!TOKEN || query.token == TOKEN) {
					if (query.website) await webhookUnsubscribe(query.website);
				}
			}
		}

		response.setHeader('status', 200);
		response.end('OK');
	});

	const STATS_INTERVAL = 10;
	setInterval(() => {
		console.log(`${STATS_INTERVAL} min stats | TJ ${STATS.tj} | DTF ${STATS.dtf} | VC ${STATS.vc}`);

		Object.keys(STATS).forEach(async website => {
			if (STATS[website] == 0 && !!TOKENS[website] && WEBHOOK_URL) {
				console.log(`NO COMMENTS in ${STATS_INTERVAL} min`, website);

				await webhookSubscribe(website);
			}

			if (STATS[website] > 0 && !!TOKENS[website] == false) {
				console.log(`GOT COMMENTS in ${STATS_INTERVAL} min BUT NO TOKEN`, website);

				await webhookUnubscribe(website);
			}

			STATS[website] = 0;
		});
	}, 1000 * 60 * STATS_INTERVAL);

	/* start server */
	server.listen(PORT, err => {
		if (err) return log.error('something bad happened', err.message);
		log.info(`server is listening on ${PORT}`);
	});

	async function serve_webhook(website, request, query) {
		STATS[website]++;

		if (TOKEN && query.token !== TOKEN) return;
		let body = await parse(request);
		if (!body || body.type != 'new_comment' || !body.data.text) return;

		log.debug('serve_webhook', 'new_comment', website);

		let text = body.data.text;

		let matches = __.findMatches(/t\.me\/([a-zA-Z0-9\/_]+)/gm, text);
		if (matches && matches.length) {
			log.info('serve_webhook_matched', website, text);

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

		log.debug('sendReply', postID, commentID, text);

		var [err, resp] = await __.to(
			axios.request({
				method: 'POST',
				baseURL: url,
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
		if (err) log.error('sendReply.err', err.message);
		else log.debug('sendReply.success');
	}

	async function webhookSubscribe(website) {
		var [err, resp] = await __.to(
			axios.request({
				method: 'POST',
				baseURL: ENDPOINTS[website],
				url: 'webhooks/add',

				data: querystring.stringify({
					event: 'new_comment',
					url: `${WEBHOOK_URL}/webhook_${website}?token=${TOKEN}`,
				}),

				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'X-Device-Token': TOKENS[website],
					'User-agent': 'tgrm-bot/v0.0.1',
				},
			}),
		);
		if (err) log.error('webhookSubscribe.err', err.message);
		else log.debug('webhookSubscribe.success', website);
	}
	async function webhookUnsubscribe(website) {
		var [err, resp] = await __.to(
			axios.request({
				method: 'POST',
				baseURL: ENDPOINTS[website],
				url: 'webhooks/del',

				data: querystring.stringify({
					event: 'new_comment',
				}),

				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'X-Device-Token': TOKENS[website],
					'User-agent': 'tgrm-bot/v0.0.1',
				},
			}),
		);
		if (err) log.error('webhookUnsubscribe.err', err.message);
		else log.debug('webhookUnsubscribe.success', website);
	}
})();
