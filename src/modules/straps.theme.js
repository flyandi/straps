/**
 * Straps Library
 * @version: v1.0.0
 * @author: Andy Gulley
 *
 * Created by Andy Gulley. Please report any bug at http://github.com/flyandi/straps
 *
 * Copyright (c) 2014 Andy Gulley http://github.com/flyandi
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */



/**
 * (__straps_instance_mask) Object
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
            this.target = target;

            // get 
            var theme = (this.parent.attribute(this.target, 'theme')).value;

            // assign
            this.target.className += '-straps-theme ' + theme; 

        },

    };

    return __straps_instance_theme;
})();


/**
 * (register instance)
 */

Straps.register('theme', {

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_theme(origin);
    },
});