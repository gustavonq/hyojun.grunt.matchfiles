var
		StringDecoder  = require('string_decoder').StringDecoder,
		decoder        = new StringDecoder("utf8"),
		forEach        = require("mout/array/forEach"),
		map            = require("mout/array/map"),
		compact        = require("mout/array/compact"),
		unique         = require("mout/array/unique"),
		trim           = require("mout/string/trim"),
		crypto         = require('crypto') ;

exports.list_files = function (type, config, done, grunt) {
"use strict";

	var spawn = require("child_process").spawn;
	var path_to_list = [];
	var file_list = [];
	var	rev = grunt.option("rev") || "HEAD";
	var	branch = grunt.option("branch") || "trunk";
	var reports = [];

	grunt.log.writeln(("Listing " + type + " files:").yellow);

	if (!config.inspect) {
		grunt.fail.fatal("Target has no 'inspect' property. this must be an object")
		return;
	}

	forEach(config.inspect, function(value){
		if (typeof value === "string"){
			value = {
				path : value
			};
		}
		path_to_list.push(value);
	});

	function notify_local_done () {
		if (!reports || !!reports && !reports.length){
			grunt.fail.fatal("No file to check!");
			return;
		}
		done(reports);
	}

	function get_cmd_for(cmd, blob){
		var bash;
		var	args;
		if (cmd === "git") {
			args = ["ls-tree", "-r", "--name-only", rev, "--", blob.path ];
		} else {
			args = ["ls", blob.path, "-r", rev];
		}
		grunt.log.writeln("_____________________".grey);
		grunt.log.writeln([cmd, args.join(" ")].join(" ").grey);
		try { bash = spawn(cmd, args);
		} catch (err) { grunt.log.writeln(err);
			return null;
		}
		return bash;
	}

	function inspect_next_path (rep) {
		if (rep){
			reports = reports.concat(rep);
		}
		if (!!path_to_list && !path_to_list.length) {
			grunt.log.writeln("_____________________".grey);
			notify_local_done();
			return;
		}
		list_files(path_to_list.pop());
	}

	function list_files (blob) {

		if (!blob){
			grunt.fail.fatal("got invalid blob to inspect");
			return;
		}

		var cmd = get_cmd_for(type, blob);
		var filtered_list = [];

		cmd.stdout.on("data", function (data) {

			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files one '" + blob.path + "'");
				return;
			}

			filtered_list = decoder.write(data).split("\n");
			filtered_list = map(filtered_list, function (value) {

				value = trim(value || "");
				if (!!value.match( blob.match || "" )) {

					var asset_path = blob.path;
							asset_path += !!asset_path.match(/\/$/) ? "" : "/";
							asset_path = type === "git" ? "" : asset_path;

					var foo = {
						"file" : asset_path + value,
						"path" : asset_path,
						"rev" : rev,
						"branch" : branch
					};

					return foo;
				}
				return null;
			});

			filtered_list = compact(filtered_list);
			file_list = file_list.concat(filtered_list);
		});

		cmd.stderr.on("data", function (data) {
			grunt.log.writeln(data);
			grunt.fail.fatal("stderr:: failed to list files '" + blob.path + "'");
			return;
		});

		cmd.on('close', function () {
			file_list = unique(filtered_list);
			if (file_list.length){
				grunt.log.writeln(("("+file_list.length+") matching " + (blob.match||"") + " under: " + blob.path).green);
			} else {
				grunt.log.writeln(("(0) matching " + (blob.match||"") + " under: " + blob.path).red);
			}
			check_md5(type, file_list, inspect_next_path.bind(this), grunt)
		});
	}

	inspect_next_path();

};

function check_md5 (type, file_list, done, grunt) {
"use strict";
	var spawn = require("child_process").spawn;
	var queue =  [].concat(file_list);
  var report = [];
	var md5sum;

	function get_cat_cmd(cmd, blob){
		var bash;
		var	args;
		if (cmd === "git") {
			args = ["show", blob.rev + ":" + blob.file];
		} else{
			args = ["cat", blob.file, "-r", blob.rev];
		}
		try { bash = spawn(cmd, args); }
		catch (err) { console.log(err); return null; }
		return bash;
	}

	function cat_file (item) {

		var cmd = get_cat_cmd(type, item);
		var hash = "";

		if (!cmd){
			grunt.fail.fatal("Failed during command spawn.");
			return;
		}

		cmd.stdout.on("data", function(data){
			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files on: '" + item.file + "'");
				return;
			}
			hash += decoder.write(data);
		});

		cmd.stderr.on("data", function (data) {
			grunt.log.writeln(("("+report.length+"/"+file_list.length+") @stderr: " + trim(data.toString())).red );
				//var blob = {
				//	file : item.file,
				//	md5 : "--------------------------------"
				//};
				//report.push(blob);
			return;
		});

		cmd.on('close', function () {

			if (!!hash) {
				md5sum = crypto.createHash("md5");
				md5sum.update(hash);

				var blob = {
					file : item.file,
					md5 : md5sum.digest('hex')
				};

				report.push(blob);
				grunt.log.writeln([blob.md5.grey, item.file].join(" "));
			}
			hash = null;
			check_next_file();
		});
	}

	function check_next_file () {
		if (!queue.length){
			done(report);
			return;
		}
		cat_file(queue.shift());
	}

	check_next_file();
};
