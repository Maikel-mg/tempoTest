var TablaView = Backbone.View.extend({
    events : {
        'click tbody tr' : '_onRowClick'
    },
    initialize : function(options){
        this.options = options;
        this.template = JST["templates/componentes/tabla.hbs"];
    },
    render : function (){
        this.$el.html(this.template(this.options));
        this.$tabla = this.$el.find('table');
        this.datatable = this.$tabla.DataTable({
            paging :  this.options.paging || false,
            searching : this.options.searching || false,
            info : this.options.info || false,
            language : {
                "sProcessing":     "Procesando...",
                "sLengthMenu":     "Mostrar _MENU_ registros",
                "sZeroRecords":    "No se encontraron resultados",
                "sEmptyTable":     "Ningún dato disponible en esta tabla",
                "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
                "sInfoPostFix":    "",
                "sSearch":         "Buscar:",
                "sUrl":            "",
                "sInfoThousands":  ",",
                "sLoadingRecords": "Cargando...",
                "oPaginate": {
                    "sFirst":    "Primero",
                    "sLast":     "Último",
                    "sNext":     "Siguiente",
                    "sPrevious": "Anterior"
                },
                "oAria": {
                    "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
                    "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                }
            },
            columns : this.options.columns || null
        });

        return this;
    },

    setData : function (data){
        this.data = data;
        this.refresh();
    },
    refresh : function () {
        this.$tabla.dataTable().fnClearTable();
        this.$tabla.dataTable().fnAddData(this.data);

        return this;
    },

    _onRowClick : function(event) {
        var $target = $(event.currentTarget);

        if ( $target.hasClass('selected') ) {
            $target.removeClass('selected');
        }
        else {
            $target.parent().find('tr.selected').removeClass('selected');
            $target.addClass('selected');
        }

        this.trigger('onRowClick', this.datatable.rows('.selected').data());
    }
});