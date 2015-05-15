$.mockjax({
    url: "/api/usuario/login",
    type: 'POST',
    response: function(options) {
        console.log('POST LOGIN', options.data);
        this.responseText = _.where(fixtures.usuarios, {nombre : options.data.usuario})[0];
    }
});

$.mockjax({
    url: "/api/usuario/",
    type: 'GET',
    response: function() {
        console.log('GET', arguments);
        this.responseText = fixtures.usuarios;
    }
});

$.mockjax({
    url: /api\/usuario\/([0-9]{1,4})+/,
    urlParams: ["id"],
    responseTime: 3000,
    type: 'GET',
    response: function(settings) {
        console.log('GET ID', settings);
        this.responseText = _.where(fixtures.usuarios, {id : settings.urlParams.id})[0];
    }
});

$.mockjax({
    url: "/api/usuario/*",
    type: 'PUT',
    response: function(options) {
        console.log('PUT', options);
        this.responseText = fixtures.usuarios;
    }
});


var LoginPageView = ItemView.extend({
    events : {
        'click #doLogin' : 'doLogin'
    },
    initialize : function () {
        _.bindAll(this, 'checkLogin');
        this.template = JST["templates/page/login.hbs"];
    },

    doLogin : function (){
        console.log('doLogin');

        var usuario = this.$('#usuario').val();

        this.model.login(usuario)
            .done( this.checkLogin );
    },
    checkLogin : function (){
        console.log('checkLogin');
        console.log(this.model);
        console.log(this.model.get('id'));

        if (this.model.get('id')) {
            Backbone.trigger('router:go', '#home');
        } else {
            Backbone.trigger('router:go', '#error');
        }

    }
});
var EditPageView = ItemView.extend({
    events : {
        'click #doLogin' : 'doLogin',
        'click #doBack' : 'doBack'
    },
    initialize : function () {
        this.template = JST["templates/page/edit.hbs"];
    },
    doLogin : function (){
        console.log('Maikel');
        console.log('doLogin');

        Backbone.trigger('router:go', '#home');
    },
    doBack : function (){
        console.log('Maikel');
        console.log('doBack');

        Backbone.trigger('router:go', '#home');
    }
});
var LoginRouter = Backbone.Router.extend({
    routes: {
        '' : 'login',
        'home' : 'home',
        'error' : 'error',
        'edit' : 'edit'
    },
    initialize : function (){
        this.view = null;
        this.usuario = new UsuarioModel();

        this.listenTo(Backbone, 'router:go', this.go);

        Backbone.history.start({pushState : false});
    },
    login : function ( ) {
        this.usuario.clear();

        this.view = new LoginPageView({"el": '.page', model : this.usuario});
        this.view.render();
    },
    home : function ( ) {

        this.view = new HistoricoIndicadorView({"el": '.page'});
        this.view.render();
    },
    error : function ( ) {
        $(document).find('body').html('<h1>ERROR </h1>');
    },
    edit : function ( ) {
        this.viewEdit = new EditPageView({"el": '.page'});
        this.viewEdit.render();
    },
    go : function (route) {
        console.log('NAVIGATE::', route);
        this.navigate(route, {trigger: true});
    }

});