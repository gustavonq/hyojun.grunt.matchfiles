//	var http = require("http");
//	http.request({
//		hostname:"multiplus-marketplace.aceite.fbiz.com.br",
//		path:"/guideline",
//    auth:"multiplus:multiplus2015",
//	},	function(res){
//			console.log('STATUS: ' + res.statusCode);
//			console.log('HEADERS: ' + JSON.stringify(res.headers));
//			res.setEncoding('utf8');
//			res.on('data', function (chunk) {
//				console.log('BODY: ' + chunk);
//			});
//	});
//
var request = require("request");
		//request({
		//	url:"http://multiplus-marketplace.aceite.fbiz.com.br/guideline",
		//  uth:"multiplus||multiplus2015",
		//  auth:"multiplus2015||multiplus",
		//}, function(error, resp, body){
		//	console.log(resp.statusCode);
		//});
		request.get("http://multiplus-marketplace.aceite.fbiz.com.br/guidelineaasa",{
			"auth" : {
				"user" : "multiplus",
				"pass" : "multiplus2015",
			}
		}).on("response", function (resp){
			if (resp.statusCode === 200){
				resp.on("data",function(chunk){
					console.log(chunk.toString());
				});
			} else {
				console.log("error requesting page");
			}
		}).on("error", function(err){
			console.log("ERROROROROROR");
			console.log(err);
		});
