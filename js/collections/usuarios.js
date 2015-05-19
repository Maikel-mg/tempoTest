var UsuariosCollection = Backbone.Collection.extend({
    url : '/api/usuario/',
    model : UsuarioModel,
    obtenerNombres : function (){
        return this.pluck('nombre');
    },
    porDepartamento : function (idDepartamento) {
        return this.where({'id_Departamento': idDepartamento});
    }
});
