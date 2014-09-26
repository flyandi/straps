/**
 * Straps - a modern approach for Affiliate Lead Marketing Landing Pages
 * Copyright (c) 2014 - All rights reserved
 * 
 * written by Andy Gulley (http://www.github.com/flyandi/straps/)
 * 
 * License: http://www.gnu.org/licenses/gpl.html GPL version 2 or higher
 */


/**
 * (constants)
 */

/**
 * (__straps_instance_theme) Object
 */
 
var __straps_instance_theme = (function(){

    function __straps_instance_theme(origin) {
        // settings
        this.parent = origin;

        // run construct
        this.__construct();
    }

    __straps_instance_theme.prototype = {

        // (constructor)
        __construct: function() {

        },

        // (attach)
        attach: function(target) {
            // initialize
            var that = this;
        }
    };

    return __straps_instance_theme;
})();


/**
 * (register instance)
 */

Straps.register('theme', {

    // (hooks)
    hooks: ['theme'],

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_theme(origin);
    },
});
