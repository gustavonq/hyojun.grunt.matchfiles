grunt-matchfiles
==================
*version*: **0.2.4**

this is a grunt task designed to list files inside your svn/git repository, grab the md5 hash and compare those with the files on your remote server.

Good for checking if your code is the one that is running on your servers.

##install

Considering that this is a **grunt task**, you must have **nodejs** and everything required to run the **grunt** command.

```bash
npm install https://bitbucket.org/fbiz/hyojun.grunt.matchfiles/get/0.2.4.tar.gz --save-dev
```

##task example

```js
grunt.initConfig({
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
});

grunt.loadNpmTasks('hyojun.grunt.matchfiles');
```

running:

```bash
grunt matchfiles -rev 61a4a5e
```

will only list ".js" files inside the whole project and match with the the ones hosted by https://bitbucket.org/fbiz/hyojun.grunt.matchfiles/raw/**61a4a5e**/ 

##config

The `matchfiles` is [multitask](http://gruntjs.com/api/grunt.task) so the first level of the config defines just the target that will be used. (grunt matchfiles:<my-target>).

Each target expect an object following this schema:

```json
{
"hosts" : Array<String>,
"git|svn" : Array<Object>
}
```

###target.hosts

This is an Array with the hosts you want

> hosts urls accept wildcards called {{branch}} and {{rev}} that will be replaced with values from commandline. By default {{branch}} is empty string (`""`) and {{rev}} is `"HEAD"`.

###target.svn and target.git

```json
'git|svn' : {
	"inspect" : [{
		"path" : "/assets/js/dist/",
		"match" : "\.js$"
	},{
		"path" : "/assets/css-min",
		"match" : "\.css$"
	},
	...]
}
```

The difference by "git" or "svn" is command that will be trigged for checking the local files (remote files are checked in the same way). For "svn" the command is `svn ls` and for "git" is `git ls-tree`.
Local files always use the "head/trunk" version of the code.

* `inspect` Array<Object>

	The file list to check the md5 hash will be defined by these targets.

	The object inside this array must follow the pattern:

	`path` : the trailing path that will be appended on "hosts" and from the place where the task is being called. 

	`match`: a String that will be tested as regex on files list.