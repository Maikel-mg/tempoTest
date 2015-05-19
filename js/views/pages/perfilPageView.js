var PerfilPageView = ItemView.extend({
    initialize :
        function () {
        _.bindAll(this, 'createSubViews');
        this.template = JST["templates/page/perfil.hbs"];

        this.on('viewRendered', this.createSubViews );
    },
    createSubViews : function (a) {
        this.cabeceraview = new PerfilCabeceraView({"el": '#cabeceraPerfil', model : this.model});
        this.navegacionView = new PerfilNavegacionView({"el": '#navegacionPerfil', model : this.model});
        this.cabeceraview.render();
        this.navegacionView.render();
    }
});

