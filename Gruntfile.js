/*
 * grunt-checkfile
 * https://github.com/hankpillow/grunt-checkfile

,
					"static2" : "http://static2.netshoes.net",
					"static3" : "http://static3.netshoes.net",
					"static4" : "http://static4.netshoes.net",
					"static5" : "http://static5.netshoes.net"

 */
module.exports = function(grunt) {
'use strict';
	grunt.initConfig({
		"matchfiles" : {
			"desktop": {
				"hosts" : ["http://static1.netshoes.net"],
				"svn" : {
					"url" : "http://192.168.172.127:8080/svn/Netshoes/branch/{{branch}}/netshoes/modules/estore/j2ee/Netshoes.war",
					"inspect" : [{
						"path" : "/assets/js-min",
						"match" : "\.js$"
					}]
				}
			}
		}
	});
	grunt.loadTasks('task');
};