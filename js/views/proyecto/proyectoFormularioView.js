var ProyectoFormularioView = ItemView.extend({
    events : {
        'click #btnGuardar' : 'onBtnGuardarClick',
        'click #btnCancelar' : 'onBtnCancelarClick'
    },
    initialize : function () {
        _.bindAll(this, 'cargarResponsables', 'cargarEstadosProyecto', 'onResponsablesResponse');
        this.template = JST["templates/proyecto/formulario.hbs"];

        this.responsables = new UsuariosCollection();
        this.estados = ["Creado", "Abierto", "Cerrado", "Cancelado"];

        this.on('viewRendered', this.cargarResponsables);
        this.on('viewRendered', this.cargarEstadosProyecto);
    },

    cargarResponsables : function (){
        this.responsables.fetch().done(this.onResponsablesResponse);
    },
    cargarEstadosProyecto : function (){
        console.log('ProyectoFormularioView :: cargarEstadosProyecto');

        var $estadosControl = this.$el.find('#estado');
        for ( var i = 0; i < this.estados.length; i++) {
            $estadosControl.append('<option value="' +  this.estados[i] + '">' +  this.estados[i] +'</option>');
        }

        if (this.model) {
            console.log('Estado --> ' + this.model.get('estado'));
            $estadosControl.val(this.model.get('estado'));
        }

        $estadosControl.select2();
    },

    onResponsablesResponse : function (data) {
        console.log('ProyectoFormularioView :: onResponsablesResponse', data);

        var $responsablesControl = this.$el.find('#responsable');
        for ( var i = 0; i < data.length; i++) {
            $responsablesControl.append('<option value="' + data[i].id + '">' + data[i].nombre + ' ' +data[i].apellidos  +'</option>');
        }
        if (this.model) {
            console.log('RESPONSABLE --> ' + this.model.get('responsable'));
            $responsablesControl.val(this.model.get('responsable'));
        }

        $responsablesControl.select2();
    },
    onBtnGuardarClick : function (){
        console.log('Maikel');
        console.log('doLogin');

        Backbone.trigger('router:go', '#proyecto');
    },
    onBtnCancelarClick : function (){
        console.log('Maikel');
        console.log('doBack');

        Backbone.trigger('router:go', '#home');
    }
});

