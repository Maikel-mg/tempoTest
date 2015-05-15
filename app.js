var router = Backbone.Router.extend({
    routes : {
        "" : "login",
        "historico/:id" : "historico"
    },
    login : function () {
        console.log('login');
        indicadores = new IndicadoresCollection(fixtures.indicadores);
        detalles = new PerfilCabeceraView({
            model : indicadores.at(0),
            el : '#detalleIndicador'
        });
        detalles.render();
    },
    historico : function (id) {
        var lenguaje =  {
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
        };
        var grafico;
        var detalles;
        var indicadores;
        var tablaHistoricoIndicadores;

        indicadores = new IndicadoresCollection(fixtures.indicadores);
        detalles = new DetalleIndicadorView({
            model : indicadores.at(0),
            el : '#detalleIndicador'
        });
        detalles.render();
        tablaHistoricoIndicadores = new TablaView({
            el : '#datosHistoricosIdicador',
            cabeceras : [
                "ID",
                "Mes",
                "Año",
                "Valor",
                "Fecha Introduccion",
                "Comentario",
                "Indicador"
            ],
            columns : [
                { data : 'id'},
                { data : 'mes'},
                { data : 'año'},
                { data : 'valor'},
                { data : 'fechaIntroduccion'},
                { data : 'comentario'},
                { data : 'idIndicador'}
            ]
        });
        tablaHistoricoIndicadores.render();
        tablaHistoricoIndicadores.setData(fixtures.valoresIndicadores);

        grafico = new GraficoBarrasHistoricoView({el : '#grafico'});
        grafico.render();
        grafico.setData(fixtures.valoresIndicadores);
    }
});