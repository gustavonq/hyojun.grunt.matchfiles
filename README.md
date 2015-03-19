grunt-matchfiles
==================
*version*: **0.2.0**

grunt task designed to list files on svn/git repo, grab the md5 hash and compare those into a list of remote hosts. Good for making sure that you versioned code is the same you have on remote hosts.

##install

```bash
npm install https://bitbucket.org/fbiz/hyojun.grunt.matchfiles/get/0.2.0.tar.gz --save-dev
```

##usage

```js
grunt.initConfig({
	"matchfiles" : {
		"desktop": {
			"hosts" : ["http://static1.my-project.com","http://static2.my-project.com"],
			"git" : {
				"inspect" : [{
					"path" : "/assets/js-min",
					"match" : "\.js$"
				}]
			}
		}
	}
});

grunt.loadNpmTasks('hyojun.grunt.matchfiles');
```

##config

```
	"matchfiles" : {
		"desktop": {
			"hosts" : [String, String, ...]
			"git" : {
				"inspect" : [{
					"path" : String, 
					"match" : String
				}]
			},
			"svn" : {
				"inspect" : [{
					"path" : String, 
					"match" : String
				}]
			}
		}
```

The `matchfiles` is [multitask](http://gruntjs.com/api/grunt.task) so the first level of the config defines just the target that will be used.

###hosts

This is an Array of hosts you want to check.

If you have the host `http://foo.com` and you are listing the files (svn or git) on `/assets/foo/*.js`, this means that the code will fetch the assets on `http://foo.com/assets/foo/*.js`

> for hosts urls we have wildcards called {{branch}} and {{rev}}, that will be filled with command line arguments. By default branch is empty string and rev is HEAD (both svn and git)

For the given url:

`http://foo.com/{{branch}}/`
	
Calling the task like that:

```js
grunt matchfiles:git-target -rev ABC123
```

Will result in:

`http://foo.com/ABC123`


###svn/git

Use this object when your project is being versioned by SVN.

```js
{
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

* `inspect` Array

	The file list to check the md5 hash will be defined by these targets.

	The object inside this array must follow the pattern:

	```js
	{
		"path" : "path-to-inpect",
		"match" : "regex to match files"
	}
	```

	* `path` : the trailing path that will be applied when listing files (`svn = svn ls`, `git = git ls-tree`) 

	* `match`: a String that will be tested as regex on files, by this way you can define the sort/range of files you want to list.


