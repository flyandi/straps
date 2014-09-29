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

var LSFILTER_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


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

        },

        // (__autosize)
        __autosize: function() {

            // get aspects
            var that = this, aspects = {
                width: this.target.clientWidth,
                ratioLabel: this.parent.attribute(this.target, 'ratio-label', 3),
                ratioInput: this.parent.attribute(this.target, 'ratio-input', 6)
            };

            // find fields
            this.parent.find("field", this.target, function(field) {

                // initial
                var label = that.parent.find("label", field, 0),
                    inputs = that.parent.find("input:not([type=submit]),select", field);


                // calculate
                var labelWidth = aspects.width * 0.3,
                    inputWidth = Math.round(((aspects.width * 0.6) - ((inputs.length - 1) * 3)) / inputs.length);

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


    /*


$(function(){
    //original field values
    var field_values = {
        'username': 'username',
        'password'  : 'password',
        'cpassword' : 'password',
        'firstname'  : 'first name',
        'lastname'  : 'last name',
        'email'  : 'email address'
    };

    $.each(field_values, function(name, value) {
        $("#"+name).inputfocus({value: value });
    });

    //reset progress bar
    $('#progress').css('width','0px');
    $('#progress_text').html('0% Complete');

    //first_step
    $('form').submit(function(){ return false; });
    // initialize
    var validatorEmail = 
  

    var validatorSections = function(sections) {

        $.each(sections, function(index, section) {    
            // prepare section
            var section = $.extend({}, {progress: false, progressText: false, nextbutton: '.next_btn', prevbutton: '.pre_btn'}, section);

            // validator
            $(section.target).find(section.nextbutton).bind("click", function(ev) {
                // event handler
                ev.stopPropagation();

                // process errors 
                $(section.target).find("input:not([type=button]),textarea,select").removeClass("error valid").each(function() {
                    // get value
                    var value = $(this).val(), error = false;
                    // check field properties
                    switch(true) {

                        // (email validation)
                        case $(this).hasClass("validate-email") || $(this).attr("validate") == "email":
                            error = !validatorEmail.test(value);
                            break;

                        // (select)
                        case $(this).attr("tagName").toLowerCase() == "select":
                            error = value == "";
                            break;

                        // (default) string
                        default:
                            // optional exception test;
                            if($(this).attr("validate") != "optional") {
                                error = value.length < 4 || value == field_values[$(this).attr("id")];
                            }
                            break;
                    }

                    // process 
                    switch(error) {
                        case true: 
                            $(this).addClass("error").effect("shake", { times:3 }, 50);
                            break;
                        default:
                            $(this).addClass("valid");
                            break;
                    }
                });


                // analyse
                if($(section.target).find(".error").length == 0) {
                    // process to text
                    if(section.progress) {
                        $("#progress_text").html(section.progressText);
                        $("#progress").css("width", section.progress);
                    }

                    // switch page
                    $(section.target).slideUp();
                    $(section.target).next().slideDown();
                };

                // cap events
                return false;
            });

            // prev button
            $(section.target).find(section.prevbutton).bind("click", function(ev) {
                // event handler
                ev.stopPropagation();
                // cycle    
                $(section.target).slideUp();
                $(section.target).prev().slideDown();
            });
        });
    };


    // (bootstrap)
    validatorSections([
        {target: '#first', progress: 105, progressText: '50% Complete'},
        {target: '#second', progress: 210, progressText: '100% Complete'},
        {target: '#third'}
    ]);



});*/



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
