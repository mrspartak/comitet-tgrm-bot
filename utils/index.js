/* promise */
exports.to = function(promise) {
	return promise
		.then(data => {
			return [null, data];
		})
		.catch(err => [err]);
};

exports.findMatches = function(regex, str, matches = []) {
	const res = regex.exec(str);
	res && matches.push(res) && findMatches(regex, str, matches);
	return matches;
};
