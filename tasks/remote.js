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
	var rev = grunt.option("rev")||"";
	var branch = grunt.option("branch")||"";

	function check_host_file(host, blob){
		var url = (host + blob.file),
			checksum, passed;
		request(url, function(error, resp, body){
			if (error || (!!resp && resp.statusCode !== 200)){
				nok++;
				var rep = [" ",
									blob.md5,
									"--------------" + resp.statusCode + "--------------",
									blob.file].join(" ").red;
			} else {
				md5sum = crypto.createHash("md5");
				md5sum.update(body);
				checksum  = md5sum.digest('hex');
				passed = checksum === blob.md5;
				var rep = [" ", blob.md5, checksum, blob.file].join(" ");
				if (passed) {
					ok++;
					rep = rep.green;
				} else {
					nok++;
					rep = rep.red;
				}
			}
			grunt.log.writeln(rep);
			check_files(host);
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
		grunt.log.writeln(("  ("+config.cmd+")                            (hosted)                        (file)").grey);
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
