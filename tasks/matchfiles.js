module.exports = function(grunt) {
'use strict';

	var mixIn        = require("mout/object/mixIn"),
		spawn          = require("child_process").spawn,
		local          = require("./local"),
		remote         = require("./remote"),
		StringDecoder  = require('string_decoder').StringDecoder,
		decoder        = new StringDecoder("utf8"),
		forEach        = require("mout/array/forEach");

	grunt.registerMultiTask('matchfiles',
		 	'Match files against svn/git and hosted files. -branch for branch name and -rev for revision',
	function() {

		var config = mixIn({
			hosts : null,
			svn : null,
			git : null
		},this.data);

		if (!config.hosts || !!config.hosts && !config.hosts.length){
			grunt.fail.fatal("No 'hosts' found. this must be an array os strings");
			return;
		}

		if (!config.svn && !config.git){
			grunt.fail.fatal("No 'svn' or 'git' found.");
			return;
		}

		var done = this.async();
		var cmd = config.svn ? "svn" : "git";

		function check_remote_files (value) {
			grunt.log.writeln(("\nMatching md5 across hosts (" + config.hosts.length + ")").yellow);
			remote.check({
				cmd : cmd,
				files : value,
				hosts : config.hosts
			}, done, grunt);
		}

		local.list_files(cmd, config.git || config.svn, check_remote_files, grunt);
	});
};
