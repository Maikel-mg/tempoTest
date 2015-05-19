var ProyectosCollection = Backbone.Collection.extend({

    model : ProyectosModel,

    porEstado : function (estado) {
        return this.where({'estado': estado});
    }
});
