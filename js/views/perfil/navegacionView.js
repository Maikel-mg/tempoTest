var PerfilNavegacionView = ItemView.extend({
    initialize : function () {
        _.bindAll(this, 'createEvents');
        this.template = JST["templates/perfil/navegacion.hbs"];

        this.on('viewRendered', this.createEvents);
    },
    createEvents : function (){
        console.log('pageRendered 2');
        $('#navegacionPerfil a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        $('#navegacionPerfil a:first').tab('show');
    }
});
