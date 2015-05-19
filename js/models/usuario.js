var UsuarioModel = Backbone.Model.extend({
    urlRoot : '/api/usuario',
    defaults: {
        'id' : '',
        'nombre' : '',
        'apellidos' : '',
        'email' : '',
        'id_Departamento' : ''
    },

    login : function (usuario) {
        var options = {
            type : 'POST',
            url : this.urlRoot + "/login",
            data : {
                usuario : usuario
            }
        };

        return this.fetch(options);
    }
});
