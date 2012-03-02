if (typeof Meteor === "undefined") Meteor = {};

(function() {

  Meteor._partials = {};

  Meteor._hook_handlebars_each = function () {
    Meteor._hook_handlebars_each = function(){}; // install the hook only once

    var orig = Handlebars._default_helpers.each;
    Handlebars._default_helpers.each = function (arg, options) {
      if (!(arg instanceof Collection.Cursor))
        return orig(arg, options);

      return Meteor.ui.listChunk(arg, options.fn, options.inverse, null);
    };
  };



  Meteor._def_template = function (name, raw_func, data) {
    Meteor._hook_handlebars_each();

    window.Template = window.Template || {};

    var partial = function(data) {
      var getHtml = function() {
        return raw_func(data, {
          helpers: name ? Template[name] : {},
          partials: Meteor._partials
        });
      };


      var react_data = { events: (name ? Template[name].events : {}),
                         event_data: data,
                         template_name: name };

      return Meteor.ui.chunk(getHtml, react_data);
    };

    if (name) {
      if (Template[name])
        throw new Error("There are multiple templates named '" + name +
                        "'. Each template needs a unique name.");

      Template[name] = partial;

      // XXX hack.. copy all of Handlebars' built in helpers over to
      // Template.foo. it would be better to hook helperMissing (or
      // something like that?) so that Template.foo is searched only
      // if it's not a built-in helper.
      _.extend(Template[name], Handlebars.helpers);
    }

    if (name) {
      Meteor._partials[name] = partial;
    }

    if (!name)
      return partial;
    else
      return null;
  };

})();




