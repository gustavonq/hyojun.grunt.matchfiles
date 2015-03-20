exports.check = function (config, done, grunt) {
//libs
	var request = require("request");
	var crypto  = require('crypto');
	var md5sum;

	if (!config){
		grunt.fail.fatal("Missing hosts to test");
		return;
	}

	var hosts = [];
	var	file_queue;
	var ok;
	var nok;
	var rev = grunt.option("rev") || "HEAD";
	var branch = grunt.option("branch")||"";

	var opt = null;
	var user = grunt.option("user");
	var pass = grunt.option("pass") || grunt.option("password");

	if (!!user){
		opt = {
			"auth" : {
				"user" : user,
				"pass" : pass
			}
		}
	}

	function check_host_file (host, blob){

		var url = (host + blob.file);
		var checksum;
		var	passed;

		function log_report(value){
			grunt.log.writeln(value);
			check_files(host);
		}

		request.get(url, opt)

			.on("error", function(err){

				grunt.log.writeln(("Error fetching url:"+url).red);
				grunt.log.writeln("check if your host is expecting user and password");
				grunt.fail.fatal(err);
				done();

			})

			.on("response", function (resp) {
				var rep = "couldn't create report for:" + url;

				if (resp.statusCode === 200){
					resp.on("data", function (chunk) {

						md5sum = crypto.createHash("md5");
						md5sum.update(chunk.toString());
						checksum  = md5sum.digest('hex');
						passed = checksum === blob.md5;

						rep = [
							blob.md5,
							checksum,
							blob.file
						].join(" ");

						if (passed) { ok++; rep = rep.green; }
						else { nok++; rep = rep.red; }

						log_report(rep);

					});

				} else {

					nok++;
					rep = [
						blob.md5,
						"--------------" + resp.statusCode + "--------------",
						blob.file
					].join(" ").red;

					log_report(rep);
				}

			});

	}

	function check_files(host){
		if (!file_queue || !file_queue.length){
			grunt.log.writeln("_____________________".grey);
			grunt.log.writeln((ok + " file(s) passed").green);
			grunt.log.writeln((nok + " file(s) failed").red);
			pick_host();
			return;
		}
		check_host_file(host, file_queue.shift());
	}

	function inspect_list(url) {
		grunt.log.writeln("- " + url);
		grunt.log.writeln(("("+config.cmd+")                            (hosted)                        (file)").grey);
		file_queue = [].concat(config.files);
		ok = 0; nok = 0;
		check_files(url);
	}

	function pick_host () {
		if (!hosts.length){
			grunt.log.writeln("done");
			done();
			return;
		}
		inspect_list(hosts.shift());
	}

	for (var index in config.hosts){
		var host = config.hosts[index]
				host = host
								.replace(/{{rev}}/gm,rev)
								.replace(/{{branch}}/gm, branch);
		hosts.push(host);
	}

	pick_host();
};
