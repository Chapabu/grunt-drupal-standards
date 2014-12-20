# grunt-drupal-standards
======================

Gruntfile for checking Drupal coding standards and running CasperJS tests.

## Roadmap

* Actually add the task for running CasperJS tests
* Add a base path variable so it's easier to store these tasks outside of `sites/all`

## Installation

* Clone into your Drupal `sites/all` directory (or the multisite directory if you're on a multisite).
* Update any paths that you need to. At a minimum, you'll want to correct `themepath: 'themes/THEMEPATH',` on line 9.
* Run `npm install`
* Run `composer install`
* Go and make a cup of tea.

## Usage

Run `grunt watch` to watch your PHP/JS/SASS files as you're working on them. `Grunt watch` will also watch for any changes to `template.php` and any template files. If it detects any, then the theme registry will be cleared for you.

Any individual tasks can be found by reading the Gruntfile.
