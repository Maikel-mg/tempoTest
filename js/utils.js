var Utils = {};
Utils.Types = {
    getType : function(o){
        if (o === null) {
            return "null";
        }
        if (o === undefined) {
            return "undefined";
        }
        return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
    },
    isString : function(o) {
        return Utils.Types.getType(o) === "string";
    },
    isDate : function(o) {
        return Utils.Types.getType(o) === "date" && !isNaN(o.getTime());
    },
    isFunction: function(o) {
        return Utils.Types.getType(o) === "function";
    },
    isGuid : function(value) {
        return Utils.Types.getType(value) && /[a-fA-F\d]{8}-(?:[a-fA-F\d]{4}-){3}[a-fA-F\d]{12}/.test(value);
    },
    isNumeric: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    isNull: function(n) {
        return n == null;
    },
    isUndefined: function(n) {
        return n == undefined;
    },

    stringStartsWith: function(str, substr) {
        if ((!str) || !prefix) return false;
        return str.indexOf(prefix, 0) === 0;
    },
    stringConstains: function(str, substr) {
        if ((!str) || !substr) return false;
        return str.indexOf(substr) !== -1;
    },
    stringEndsWith : function(str, suffix) {
        if ((!str) || !suffix) return false;
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    stringFormat: function(str) {
        var args = arguments;
        var pattern = RegExp("%([1-" + (arguments.length - 1) + "])", "g");
        return str.replace(pattern, function (match, index) {
            return args[index];
        });
    },
    stringPaddingLeft: function(str, char, num){
        var mask = "";
        while(num > 0)
        {
            mask += char;
            num--;
        }

        return String(mask + str).slice(-mask.length);
    },
    stringPaddingRight: function(str, char, num){
        var mask = "";
        while(num > 0)
        {
            mask += char;
            num--;
        }


        return String(str + mask ).slice(0,mask.length);
    },
    stringIsEmptyOrNull : function (str){
        return str == "" || str == null || str == undefined;
    },
    parseToString : function(value){
        return (value == null) ? value : value.toString();
    },
    parseToInt : function(value){
        var type = Utils.getType(value);
        if (type=== "string") {
            var src = value.trim();
            if (src === "") return null;

            var val = parseInt(src, 10);
            return isNaN(val) ? value : val;
        } else if (type === "number") {
            return Math.round(value);
        }
        return value;
    },
    parseToFloat : function(value){
        var type = Utils.getType(value);

        if (type === "string") {
            var src = value.trim();
            if (src === "") return null;
            //var val = parseFloat(src);
            var val = parseFloat(src.replace(',','.'));
            return isNaN(val) ? value : val;
        }
        return value;
    },
    parseToDate : function(value){
        var type = Utils.getType(value);
        var val;

        if (type === "string") {
            var src = value.trim();
            if (src === "")
                return null;

            val = new Date(Date.parse(src));
            return Utils.isDate(val) ? val : value;
        } else if (type === "number") {
            val = new Date(value);
            return Utils.isDate(val) ? val : value;
        }
        return source;
    },
    parseToBool : function(value){
        var type = Utils.getType(value);

        if (type === "string") {
            var src = value.trim().toLowerCase();
            if (src === "false" || src ==="") {
                return false;
            } else if (src === "true") {
                return true;
            } else {
                return false;
            }
        }
        return value;
    },

    formatString : function (value) {
        return Utils.isNull(value) ? null : "'" + value + "'";
    },
    formatInt : function (value) {
        return Utils.isNull(value) ? null : ((Utils.getType(value) === "string") ? Utils.parseToInt(value) : value);
    },
    formatFloat : function (value) {
        return Utils.isNull(value) ? null : ((Utils.getType(value) === "string") ? Utils.parseToFloat(value) : value);
    },
    formatBool : function (value) {
        return Utils.isNull(value) ? null : ((Utils.getType(value) === "string") ? Utils.parseToBool(value) : value);
    },
    formatDate: function (value) {
        return Utils.formatString(value);
    }
};
Utils.String = {
    rellenar : function (cadena, numero) {
        var res = '' ;
        for(i = 0; i < numero; i++)
            res= res + cadena;
        return res;
    },
    capitalize : function(cadena){
        var resultado;
        resultado = cadena[0].toUpperCase() + cadena.substr(1);
        return resultado;
    }
};
Utils.Componentes = {
    recursive : function(elemento, level) {
        if (elemento.props.controls){
            level++;
            elemento.props.controls.forEach(
                function(item){
                    if(elemento.props.controls)
                        Utils.Componentes.recursive(item, level);
                }
            )
        }
    },
    recursive2 : function(elemento, level) {
        if (elemento.controls){
            level++;
            elemento.controls.forEach(
                function(item){
                    if(elemento.controls)
                        Utils.Componentes.recursive(item, level);
                }
            )
        }
    }
};
Utils.Fecha = {
    Now: function () {
        var fecha = new Date();
        return Utils.Fecha.format(fecha);
    },
    AddDays: function (fecha, dias) {
        var from = Utils.Fecha.create(fecha);

        from.setDate(from.getDate() + dias);
        return Utils.Fecha.format(from);
    },
    diferencia : function(fechaInicio, fechaFin){
        var f1 = Utils.Fecha.create(fechaInicio);
        var f2 = Utils.Fecha.create(fechaFin);
        return Math.floor ( (f2.getTime() - f1.getTime()) / (((1000*60) * 60) * 24) )
    },
    create: function () {
        var descomponerFecha = function (fecha) {
            return {
                dia: parseInt(fecha.substr(0, 2)),
                mes: parseInt(fecha.substr(3, 2)) - 1,
                anyo: parseInt(fecha.substr(6, 4))
            };
        };

        var resultado = undefined;

        if (arguments.length == 1) {
            //var fecha = descomponerFecha(arguments[0]);
            var fecha = Utils.Fecha.extraer(arguments[0]);
            resultado = new Date(fecha.anyo, fecha.mes, fecha.dia, 0, 0, 0, 0);
        }
        else {
            resultado = new Date(arguments[2], arguments[1], arguments[0], 0, 0, 0, 0);
        }

        return resultado;
    },
    extraer: function (fecha) {
        return {
            dia: parseFloat(fecha.substr(0, 2)),
            mes: parseFloat(fecha.substr(3, 2)) - 1,
            anyo: parseFloat(fecha.substr(6, 4))
        };
    },
    format : function(fecha){
        var dia = fecha.getDate();
        var mes = fecha.getMonth() + 1;

        if (dia.toString().length == 1)
            dia = "0" + dia;

        if (mes.toString().length == 1)
            mes = "0" + mes;

        return dia + "/" + mes + "/" + fecha.getFullYear();
    },
    fromDateTime : function(fecha){
        var hora = "";

        var strHora = Utils.Types.stringPaddingLeft(fecha.getHours(), '0', 2);
        var strMinutos = Utils.Types.stringPaddingLeft(fecha.getMinutes(), '0', 2);

        hora = strHora + ":" + strMinutos;

        return Utils.Fecha.format(fecha) + " " + hora
    },
    toSQLformat : function(fecha){
        var dia = fecha.getDate();
        var mes = fecha.getMonth() + 1;

        if (dia.toString().length == 1)
            dia = "0" + dia;

        if (mes.toString().length == 1)
            mes = "0" + mes;

        return fecha.getFullYear() + mes + dia;
    },
    timeStamp : function(){
        var d = new Date();
        var tiempo = Utils.Types.stringPaddingLeft(d.getHours(), '0', 2) + ':' + Utils.Types.stringPaddingLeft(d.getMinutes(), '0', 2) + ':' +  Utils.Types.stringPaddingLeft(d.getSeconds(), '0', 2);

        return Utils.Fecha.Now() + ' ' + tiempo;
    }
};
Utils.Async = {
    eachPromise: function(arrColeccion, operation, extraParams){

        var $operacion = $.Deferred();
        var numero = arrColeccion.length;
        var indice = 0;
        _.each( arrColeccion ,
            function(e){
                operation.call(this, e, extraParams).done(
                    function(){
                        indice++; if(indice == numero) $operacion.resolve();
                    }
                )
            }
        );

        return $operacion;
    }
};
Utils.Converters = {
    comboboxToME : {
        _obtenerColumnasDeCombo : function( fuenteDatos){
            //var claves = _.keys(registro);
            //var columnas = _.difference(claves, _.without(claves, fuenteDatos.campoClave, fuenteDatos.campoValor));
            var claves = [fuenteDatos.campoClave, fuenteDatos.campoValor];

            return claves;
        },
        _crearColumnasDeCombo: function(fuenteDatos){
            var headers = [];
            headers.push({
                propiedad : fuenteDatos.campoClave,
                nombre : fuenteDatos.campoClave,
                nombreInterno : fuenteDatos.campoClave,
                titulo : fuenteDatos.campoClave,
                esClave : true
            });
            headers.push({
                propiedad : fuenteDatos.campoClave,
                nombre : fuenteDatos.campoClave,
                nombreInterno : fuenteDatos.campoClave,
                titulo : fuenteDatos.campoClave,
                esClave : false
            });
            headers.push({
                propiedad : fuenteDatos.campoValor,
                nombre : fuenteDatos.campoValor,
                nombreInterno : fuenteDatos.campoValor,
                titulo : fuenteDatos.campoValor,
                esClave : false
            });


            return headers;
        },
        _createME: function(columnas, datos){
            var me = undefined;
            if(datos && datos.length > 0)
            {
                var table = {
                    columns : columnas,
                    toolbarTmpl : Controls.Toolbar.MostrarElegir
                };

                me = new MostrarElegirCombo({
                    tableConfig : table
                });

                me.render();
                me.tabla.setData(datos);
            }
            return me;
        },
        _crearMostrarElegirNavision: function(control){
            var columnas = Utils.Converters.comboboxToME._crearColumnasDeCombo(control.fuenteDatos);
            return Utils.Converters.comboboxToME._createME(columnas, control.data);
        },
        convert: function(control){
            var me = undefined;
            if(control.fuenteDatos)
                me  = Utils.Converters.comboboxToME._crearMostrarElegirNavision(control);

            return me;
        }
    },
    dataToTable : {
        _crearColumnasDeTabla: function(columnas){
            var headers = [];
            for(var i in columnas)
            {
                if(columnas[i] != "Key")
                    headers.push({
                        nombre : columnas[i],
                        nombreInterno : columnas[i],
                        titulo : columnas[i],
                        esClave : false
                    });
            }

            return headers;
        },
        _createTabla : function(columnas, datos){
            var tabla = undefined;
            if(datos && datos.length > 0)
            {
                tabla  = new Table({
                    nombre:'tablaResultados',
                    nombreInterno:'tablaResultados',
                    columns : Utils.Converters.dataToTable._crearColumnasDeTabla(columnas)
                });

                tabla.render();
                tabla.setData(datos);
                tabla.showHeaderFilter();

            }
            return tabla;
        },
        convert : function(data){
            var columnas = [];

            if(data && data.length > 0)
                columnas = _.keys(data[0]);

            return Utils.Converters.dataToTable._createTabla(columnas, data)
        }
    }
};
Utils.Sorters = {
    getSorter : function(tipoDato){
        switch (tipoDato) {
            case enums.TipoCampoModelo.Datetime :
                return Utils.Sorters.DatetimeSorter;
                break;
            default :
                return Utils.Sorters.commonSorter;
                break;

        }
    },
    commonSorter : function (campo, registro) {
        return registro[campo];
    },
    DatetimeSorter : function (campo, registro) {
        if (registro[campo] == undefined || registro[campo].length < 10 ) {
            return Utils.Fecha.create('01/01/2100');
        } else {
            return Utils.Fecha.create(registro[campo]);
        }
    }
};
Utils.Objects = {
    copy : function(obj){
        return JSON.parse(JSON.stringify(obj));
    }
};
Utils.UI = {
    dobleConfirmacion : function (texto, texto2){
        if( confirm(texto) )
            if( confirm( (texto2) ? texto2 : texto ) )
                return true;

        return false;
    },
    eaconderBarraNavegacionSharepoint : function(){
        $('#s4-leftpanel').hide();
        $('#MSO_ContentTable').css('margin-left' , '0px');
        $('#s4-topheader2').hide();
    }
};
