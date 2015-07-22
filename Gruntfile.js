module.exports = function(grunt) {
'use strict';
	grunt.initConfig({
		"matchfiles" : {
			"bitbucket": {
				"hosts" : ["https://bitbucket.org/fbiz/hyojun.grunt.matchfiles/raw/{{rev}}/"],
				"git" : {
					"inspect" : [{
						"path" : "./",
						"match" : "\.js$"
					}]
				}
			}
		}
	});
	grunt.loadTasks('tasks');
};
