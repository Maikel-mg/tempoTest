var UsuariosCollection = Backbone.Collection.extend({

    model : UsuarioModel,
    obtenerNombres : function (){
        return this.pluck('nombre');
    },
    porDepartamento : function (idDepartamento) {
        return this.where({'id_Departamento': idDepartamento});
    }
});
