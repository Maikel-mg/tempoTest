var LoginPageView = ItemView.extend({
    events : {
        'click #doLogin' : 'doLogin'
    },
    initialize : function () {
        _.bindAll(this, 'checkLogin');
        this.template = JST["templates/page/login.hbs"];
    },

    doLogin : function (){
        var usuario = this.$('#usuario').val();

        this.model.login(usuario)
            .done( this.checkLogin );
    },
    checkLogin : function (){
        if (this.model.get('id')) {
            Backbone.trigger('router:go', '#home');
        } else {
            Backbone.trigger('router:go', '#error');
        }

    }
});
// TODO : Eliminar esta vist o moverla a otro sitio actualizada
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
