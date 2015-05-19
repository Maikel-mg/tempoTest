var ProyectosModel = Backbone.Model.extend({
    urlRoot : '/api/proyectos',
    defaults: {
        'id' : '',
        'prefijo' : '',
        'nombre' : '',
        'descripcion' : '',
        'estado' : '',
        'responsable' : '',
        'fechaCreacion' : ''
    }
});
