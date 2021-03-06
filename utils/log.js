const dayjs = require('dayjs');

function log(options) {
	this.options = Object.assign(
		{},
		{
			prefix: false,
			level: 'info',
			dateformat: 'DD.MM | HH:mm:ss |',
			subscribe: function() {},
		},
		options,
	);

	const LEVEL_HIERARCHY = {
		debug: 10,
		info: 20,
		warn: 30,
		error: 40,
	};
	this._checkLevel = function(level) {
		return LEVEL_HIERARCHY[level] >= LEVEL_HIERARCHY[this.options.level];
	};
	this._ts = function() {
		return dayjs().format(this.options.dateformat);
	};

	if (!LEVEL_HIERARCHY[this.options.level]) throw new Error('level does not supported');

	this.debug = function() {
		if (!this._checkLevel('debug')) return;

		let args = Array.from(arguments);

		let prefixes = ['\x1b[35m%s', this._ts(), 'DEBUG |', '\x1b[0m'];
		if (this.options.prefix) prefixes.push(this.options.prefix);
		args.unshift(...prefixes);

		this.options.subscribe('debug', args);

		console.debug.apply(console, args);
	};

	this.info = function() {
		if (!this._checkLevel('info')) return;

		let args = Array.from(arguments);

		let prefixes = ['\x1b[34m%s', this._ts(), 'INFO |', '\x1b[0m'];
		if (this.options.prefix) prefixes.push(this.options.prefix);
		args.unshift(...prefixes);

		this.options.subscribe('info', args);

		console.info.apply(console, args);
	};

	this.warn = function() {
		if (!this._checkLevel('warn')) return;

		let args = Array.from(arguments);

		let prefixes = ['\x1b[33m%s', this._ts(), 'WARN |', '\x1b[0m'];
		if (this.options.prefix) prefixes.push(this.options.prefix);
		args.unshift(...prefixes);

		this.options.subscribe('warn', args);

		console.warn.apply(console, args);
	};

	this.error = function() {
		if (!this._checkLevel('error')) return;

		let args = Array.from(arguments);

		let prefixes = ['\x1b[31m%s', this._ts(), 'ERROR |', '\x1b[0m'];
		if (this.options.prefix) prefixes.push(this.options.prefix);
		args.unshift(...prefixes);

		this.options.subscribe('error', args);

		console.error.apply(console, args);
	};

	return this;
}

module.exports = log;
