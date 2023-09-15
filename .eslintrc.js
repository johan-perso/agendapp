module.exports = {
	"env": {
		"commonjs": true,
		"es2021": true,
		"node": true,
		"browser": true
	},
	"ignorePatterns": [
		"node_modules/"
	],
	"extends": "eslint:recommended",
	"overrides": [
		{
			"env": {
				"node": true,
			},
			"files": [
				".eslintrc.{js,cjs}"
			],
			"parserOptions": {
				"sourceType": "script"
			}
		}
	],
	"parserOptions": {
		"ecmaVersion": "latest"
	},
	"rules": {
		"indent": [
			"warn",
			"tab"
		],
		"linebreak-style": [
			"warn",
			"windows"
		],
		"quotes": [
			"warn",
			"double"
		],
		"semi": [
			"warn",
			"never"
		],
		"implicit-arrow-linebreak": [
			"warn",
			"beside"
		],
		"dot-notation": [
			"warn"
		],
		"no-unused-vars": [
			"warn",
			{ "args": "none" }
		],
		"no-unneeded-ternary": [
			"warn"
		],
		"no-mixed-operators": [
			"warn"
		],
		"nonblock-statement-body-position": [
			"warn",
			"beside"
		],
		"spaced-comment": [
			"warn",
			"always"
		],
		"no-multi-spaces": [
			"warn"
		],
		"space-infix-ops": [
			"warn"
		],
		"comma-spacing": [
			"warn"
		],
		"key-spacing": [
			"warn"
		],
		"space-in-parens": [
			"warn"
		],
		"array-bracket-spacing": [
			"warn"
		],
		"object-curly-spacing": [
			"warn",
			"always"
		],
		"no-trailing-spaces": [
			"warn"
		],
		"comma-style": [
			"warn"
		],
		"no-array-constructor": [
			"warn"
		],
		"prefer-template": [
			"warn"
		],
		"template-curly-spacing": [
			"warn"
		],
		"no-new-object": [
			"warn"
		],
		"no-useless-concat": [
			"warn"
		],
		"no-useless-return": [
			"warn"
		],
		"no-useless-escape": [
			"warn"
		],
		"no-useless-constructor": [
			"warn"
		],
		"default-param-last": [
			"warn"
		],
		"no-new-func": [
			"warn"
		],
		"no-dupe-class-members": [
			"warn"
		],
		"no-duplicate-imports": [
			"warn"
		],
		"function-paren-newline": [
			"warn",
			"multiline"
		],
		"prefer-arrow-callback": [
			"warn"
		],
		"arrow-spacing": [
			"warn"
		],
		"no-empty": [
			"warn",
			{ "allowEmptyCatch": true }
		],
		"no-multiple-empty-lines": [
			"warn",
			{ "max": 1 }
		],
		"no-undef": "off",
		"no-redeclare": "off",
		"no-control-regex": "off",
		"no-prototype-builtins": "off"
	}
}