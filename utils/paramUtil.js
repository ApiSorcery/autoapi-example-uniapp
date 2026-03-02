/**
 * 解析参数
 * @param {*} 
 */
const getQueryVariable = (url, variable) => {
	var query = url
	console.log(url)
	let params = query.slice(query.indexOf('?') + 1)
	var vars = params.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return (false);
}

export default {
	getQueryVariable
}