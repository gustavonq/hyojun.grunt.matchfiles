exports.check = function (config, done, grunt) {
//libs
	var request = require("request"),
		crypto  = require('crypto'),
		md5sum;
	// 	StringDecoder  = require('string_decoder').StringDecoder,
	// 	decoder        = new StringDecoder("utf8"),
	// 	forEach        = require("mout/array/forEach"),
	// 	map            = require("mout/array/map"),
	// 	compact        = require("mout/array/compact");
	// 	unique         = require("mout/array/unique");
	// 	trim           = require("mout/string/trim");

	if (!config){
		grunt.fail.fatal("Missing hosts to test");
		return;
	}

	var hosts = [], file_queue, ok, nok;

	function check_host_file(host, blob){
		var url = (host + blob.file),
			checksum, passed;
		request(url, function(error, resp, body){
			if (error) {
				grunt.log.writeln("[FAILED] file:" + url);
			}
			if ( !!resp && resp.statusCode !== 200){
				grunt.log.writeln("  [FAILED] status: "+ resp.statusCode);
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
				grunt.log.writeln(rep);
			}
			check_files(host);
		});
	}

	function check_files(host){
		if (!file_queue || !file_queue.length){
			grunt.log.writeln("---");
			grunt.log.writeln((ok + " files passed").green);
			grunt.log.writeln((nok + " files failed").red);
			pick_host();
			return;
		}
		check_host_file(host, file_queue.shift());
	}

	function inspect_list(item){
		grunt.log.writeln(("- " + item).magenta);
		grunt.log.writeln("  svn/git                          host                             file".grey);
		file_queue = [].concat(config.files);
		ok = 0; nok = 0;
		check_files(item);
	}

	function pick_host () {
		if (!hosts.length){
			grunt.log.writeln("done");
			done();
			return;
		}
		inspect_list(hosts.shift());
	}

	for (var h in config.hosts){
		hosts.push(config.hosts[h]);
	}

	pick_host();
};