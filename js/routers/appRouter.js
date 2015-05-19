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
        this.navegacionGlobalView = undefined;

        this.listenTo(Backbone, 'router:go', this.go);

        Backbone.history.start({pushState : false});
    },
    login : function ( ) {
        this.usuario.clear();

        this.view = new LoginPageView({"el": '.page', model : this.usuario});
        this.view.render();
    },
    home : function ( ) {
        if (this.usuario.get('id')) {
            this.navegacionGlobal();
            this.view = new PerfilPageView({"el": '.page', model : this.usuario});
            this.view.render();
        } else {
            Backbone.trigger('router:go', '');
        }
    },
    error : function ( ) {
        this.navegacionGlobal();
        $(document).find('body').html('<h1>ERROR </h1>');
    },
    edit : function ( ) {
        this.navegacionGlobal();
        this.viewEdit = new EditPageView({"el": '.page'});
        this.viewEdit.render();
    },

    go : function (route) {
        console.log('NAVIGATE::', route);
        this.navigate(route, {trigger: true});
    },
    navegacionGlobal : function (){
        if (!this.naveagacionGlobal) {
            this.naveagacionGlobal = new NavegacionGlobalView({"el": '#navegacionGlobal'});
            this.naveagacionGlobal.render();
        }
    }

});
