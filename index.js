/* eslint-env node */
'use strict';

// This is ember-cli related stuffs
// If required, these may eventually move into ember-tradegecko-fonts
const path = require('path');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

const defaultOptions = {
  importTradegeckoFont: true,
};

// For ember-cli < 2.7 findHost doesnt exist so we backport from that version
// for earlier version of ember-cli.
// https://github.com/ember-cli/ember-cli/blame/16e4492c9ebf3348eb0f31df17215810674dbdf6/lib/models/addon.js#L533
function findHostShim() {
  let current = this;
  let app;
  do {
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));
  return app;
}

module.exports = {
  name: '@tradegecko/fonts',

  included() {
    this._super.included.apply(this, arguments);
    let findHost = this._findHost || findHostShim;
    let app = findHost.call(this);
    this.app = app;
    this.addonOptions = Object.assign({}, defaultOptions, app.options['ember-tradegecko-fonts']);
    let vendorDirectory = this.treePaths.vendor;
    app.import(path.join(vendorDirectory, 'tradegecko-fonts.css'));
  },

  treeForVendor(tree) {
    let trees = [];
    trees.push(new Funnel(this._tradegeckoFontPath(), {
      include: [
        '*.css'
      ],
      srcDir: 'styles'
    }));
    if (tree) {
      trees.push(tree);
    }
    return mergeTrees(trees, { overwrite: true })
  },

  treeForPublic: function(tree) {
    let trees = [];
    if (this.addonOptions.importTradegeckoFont) {
      trees.push(new Funnel(this._tradegeckoFontPath(), {
        destDir: 'fonts',
        srcDir: 'fonts'
      }));
    }
    if (tree) {
      trees.push(tree);
    }
    return mergeTrees(trees, { overwrite: true });
  },

  _tradegeckoFontPath: function() {
    let source;
    try {
      let resolve = require('resolve');
      source = resolve.sync('./package.json');
    } catch (error) {
      source = require.resolve('./package.json');
    }
    return path.dirname(source);
  },
};
