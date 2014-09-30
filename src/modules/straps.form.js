/**
 * Straps - a modern approach for Affiliate Lead Marketing Landing Pages
 * Copyright (c) 2014 - All rights reserved
 * 
 * written by Andy Gulley (http://www.github.com/flyandi/straps/)
 * 
 * License: http://www.gnu.org/licenses/gpl.html GPL version 2 or higher
 */


/**
 * (__straps_instance_form) Object
 */
 
var __straps_instance_form = (function(){

    function __straps_instance_form(origin) {
        // settings
        this.parent = origin;

        // run construct
        this.__construct();
    }

    __straps_instance_form.prototype = {

        // (private)
        strapsform: false,

        // (constructor)
        __construct: function() {

        },

        // (attach)
        attach: function(target) {
            // initialize
            var that = this;

            // assign reference
            this.target = target;


            // check attributes
            this.parent.cycleAttributes(target, {
                autosize: ['true', function() {
                    // add class
                    that.__autosize();
                }]
            });

            // hook submit
            this.target.addEventListener("submit", function(event) {
                // run validation process
                if(!that.__submithandler()) {
                    event.preventDefault();
                }
            });

        },

        // (__submithandler)
        __submithandler: function() {
            // initialize
            var that = this, violations = 0;


            // get all input
            this.parent.find("input:not([type=submit]),select,textarea", this.target, function(input) {

                // get value of input
                var value = input.value;

        
                // check straps field
                that.parent.cycleAttributes(input, {
                    required: function(filter) {
                        if(!that.__filterstring(value, filter)) {
                            // reported rule violation
                            that.parent.classnames(input, 'straps-violation');
                            // count up
                            violations++;
                        }
                    }
                });


            });

            // validate
            alert(violations);

            return false;
        },




        // (__filterinput)
        __filterstring: function(s, filter, settings) {
            // initialize
            var that = this, result = false;

            // (true)
            switch(true) {

                case (/email/gi).test(filter):
                    result = (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(s);
                    break;

                // (zip)
                case (/zip/gi).test(filter): 
                    result = (/(^\d{5}$)|(^\d{5}-\d{4}$)/).test(s);
                    break;


                // (default) checks if the input is non empty
                case (/true|notempty/gi).test(filter): 
                    result = s || s === 0;  // 0 fix
                    break;

                // default filter
                default:
            } 

            // return filter result
            return result;  
        },

        // (__autosize)
        __autosize: function() {

            // get aspects
            var that = this, aspects = {
                width: this.target.clientWidth,
                ratioLabel: this.parent.attribute(this.target, 'ratio-label', 3) * 0.1,
                ratioInput: this.parent.attribute(this.target, 'ratio-input', 6) * 0.1,
            };

            // find fields
            this.parent.find("field", this.target, function(field) {

                // initial
                var label = that.parent.find("label", field, 0),
                    inputs = that.parent.find("input:not([type=submit]),select", field);


                // calculate
                var labelWidth = aspects.width * aspects.ratioLabel,
                    inputWidth = Math.round(((aspects.width * aspects.ratioInput) - ((inputs.length - 1) * 3)) / inputs.length);

                // assign
                if(label) {
                    label.style.width = labelWidth + "px";
                }

                // cycle inputs
                inputs.cycle(function(i, p) {
                    p.style.width = inputWidth + "px";
                });

            });

        },
    };

    return __straps_instance_form;
})();




/**
 * (register instance)
 */

Straps.register('form', {

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_form(origin);
    },
});
