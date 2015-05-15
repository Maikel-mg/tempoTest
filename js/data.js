var WEB_SERVICE_URL = 'http://svb00078/sites/coleccionsitios/DesarrolloNuevosProductos/_layouts/SP_Service_Test/Servicio.asmx/Execute';

function noop() {}
function toConsole() { console.log(arguments);}

if (!window.console) {
    window.console = {};
    window.console.log = noop;
}

if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        var i = 0;
        for (i = 0; i < this.length; i += 1) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    }
}

if (!Date.prototype.toISOString) {

    (function () {

        function padding(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }

        Date.prototype.toISOString = function () {
            return this.getUTCFullYear()
                + '-' + padding(this.getUTCMonth() + 1)
                + '-' + padding(this.getUTCDate())
                + 'T' + padding(this.getUTCHours())
                + ':' + padding(this.getUTCMinutes())
                + ':' + padding(this.getUTCSeconds())
                + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                + 'Z';
        };

    }());
}

Date.fromISO = function (s) {
    var day, tz,
        rx = /^(\d{4}\-\d\d\-\d\d([tT ][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
        p = rx.exec(s) || [],
        i = 0,
        L;

    if (p[1]) {
        day = p[1].split(/\D/);
        for (i = 0, L = day.length; i < L; i += 1) {
            day[i] = parseInt(day[i], 10) || 0;
        }
        day[1] -= 1;
        day = new Date(Date.UTC.apply(Date, day));
        if (!day.getDate()) {
            return NaN;
        }
        if (p[5]) {
            tz = (parseInt(p[5], 10) * 60);
            if (p[6]) {
                tz += parseInt(p[6], 10);
            }
            if (p[4] === '+') {
                tz *= -1;
            }
            if (tz) {
                day.setUTCMinutes(day.getUTCMinutes() + tz);
            }
        }
        return day;
    }
    return NaN;
};

/**-
 * Comportamiento para proporcionar la capacidad de gestionar eventos
 * @type {Object}
 */
var WhithEvents = {
    /**
     * Configura un evento para lanzarlo mas tarde
     *
     * @param {string}   event - Nombre del evento
     * @param {Function} callback - Funcion que se va a ejcutar cuando el evento sea lanzado
     * @param [{Object}]   context - Contexto en el que se ejecuta el evento
     */
    on : function (event, callback, context) {
        this.publications = this.publications || [];

        if (this.publications[event]) {
            this.publications[event].push({'context' : context, 'callback' :  callback });
        }
        else {
            this.publications[event] = [];
            this.publications[event].push({'context' : context, 'callback' :  callback });
        }
    },

    /**
     * Desactiva en e evento indicado
     *
     * @param {string} event - Nombre del evento que se quiere desactivar
     */
    off : function (event) {
        if (this.publications[event]) {
            this.publications[event] = [];
        }
    },

    /**
     * Lanza el evento indicado
     *
     * @param {string} event - Nombre del evento que se quiere lanzar
     * @param {Object} args  - Argumentos que se le van a pasar a la llamada del evento
     */
    trigger : function (event, args) {
        if (this.publications &&  this.publications[event]) {
            var evento, i;
            for (i in this.publications[event]) {
                evento = this.publications[event][i];
                if (evento && evento.callback) {
                    evento.callback.apply(this, [args, evento.context]);
                }
            }
        }
    },

    /**
     * Agrega los eventos a la instancia que lo llama
     *
     * @param {Array.<{Object<string, Function>}>} events - Evento que se quieren a�adir a la instancia
     */
    addEvents : function (events) {
        if (events) {
            for (var event in events) {
                this.on(event, _.bind(events[event], this),  this);
            }
        }
    }
};

function guidPart() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
function guid() {
    return guidPart() + guidPart() + '-' + guidPart() + '-' + guidPart() + '-' +
        guidPart() + '-' + guidPart() + guidPart() + guidPart();
}

/**
 * Representa la estructura y el comportamiento de una entidad sobre la que trabajar
 * Los modelos contienen informacion de la entidad sus campos
 *
 * @class Model
 * @type {Model}
 */
Model = Class.extend({
    include: WhithEvents,
    /**
     * Constructor
     * @constructor
     * @this  {Model}
     * @param {Object} params   Parametros de configuracion del registro
     * @param {Array}  data     Datos para rellenar los campos del modelo
     */
    initialize : function(params, data){
        this.config = params;
        this.camposIniciales = {};
        this.campos = {};
        this.metodos = {};
        this.hasChanged = false;

        $.extend(this.camposIniciales, this.config.campos );
        $.extend(this.campos, this.config.campos);
        $.extend(this , this.config.metodos);

        if(this.config.eventos && typeof this.config.eventos == "string")
            this.config.eventos = this.config.eventos.trim();

        if(this.config.eventos !== "{}" && this.config.eventos !== "{ }")
            this.addEvents(this.config.eventos);

        if(data)
            this.setData(data);

        this.trigger('initialized', this);
    },

    /**
     * Nombre de la clase
     *
     * @returns {string}
     */
    toString : function(){
        return "Clase ";
    },

    /**
     * Devuelve el valor de un campo, comprueba que ese campo no tenga una funcion asociada para devolver algo distinto onGet_XXXXXXX en cuyo caso ejecuta esta
     *
     * @function
     * @public
     *
     * @param   {String}    campo   Nombre del campo
     * @returns {*}
     */
    get : function(campo){
        var result = undefined;
        if(this['onGet_' + campo])
            result = this['onGet_' + campo]();
        else
            result = this.campos[campo];

        return result;
    },

    /**
     * Da valor a un campo del modelo
     *
     * @function
     * @public
     *
     * @throws changed
     * @throws Collection#dataChanged
     *
     * @param {String}  campo - Nombre del campo al que se le quiere dar valor
     * @param {*}       valor - Valor que se le va a asignar al campo
     * @returns {*}
     */
    set : function(campo , valor){
        var log = {
            'campo' : campo,
            'old'   : this.campos[campo],
            'nuevo' : valor
        };
        this.campos[campo] = valor;
        if(this.campos[campo] !== this.camposIniciales[campo])
        {
            this.hasChanged = true;
            this.trigger('changed', log, this);
            if(this.coleccion)
                this.coleccion.trigger('dataChanged', this , this.coleccion);
        }

        return this;
    },

    /**
     * Carga los datos en los campos del modelo
     *
     * @function
     * @public
     *
     * @throws setData
     *
     * @param {object} data - Datos a cargar en el modelo
     */
    setData : function(data){
        if(data)
        {
            this._loadData(data);

            this.trigger('changed', this);
            this.trigger('setData', this);
        }

        return this;
    },
    _loadData : function(data){
        var modeloInfo = this.config;
        if(data && !data.id)
            data.id = guid();

        var camposBasicos = _.filter(modeloInfo.configuracion.campos, function(registro){
            return registro.tipo != enums.TipoCampoModelo.Coleccion && registro.tipo != 'referencia' && registro.tipo != 'guid';
        });
        var colecciones = _.filter(modeloInfo.configuracion.campos, function(registro){
            return registro.tipo == enums.TipoCampoModelo.Coleccion;
        });
        var referencias = _.filter(modeloInfo.configuracion.campos, function(registro){
            return registro.tipo == 'referencia';
        });
        var guids = _.filter(modeloInfo.configuracion.campos, function(registro){
            return registro.tipo == 'guid';
        });

        var that = this;

        _.each(camposBasicos, function(campo){

            switch (campo.tipo){
                case enums.TipoCampoModelo.Boolean:
                    that.campos[campo.nombre] = data[campo.nombre];
                    break;
                case enums.TipoCampoModelo.String ||enums.TipoCampoModelo.Datetime:
                    if( Utils.isString(data[campo.nombre]) )
                        that.campos[campo.nombre] = data[campo.nombre];
                    break;
                case enums.TipoCampoModelo.Float ||  enums.TipoCampoModelo.Int:
                    that.campos[campo.nombre] = data[campo.nombre];
                    break;
                default:
                    that.campos[campo.nombre] = data[campo.nombre];
                    break;
            }

        });
        _.each(colecciones, function(coleccion){

            //that.campos[coleccion.nombre] = CollectionStore.crear(coleccion.relacion.modelo, data[coleccion.nombre]);
            that.campos[coleccion.nombre] = Env.CollectionStore.crear(coleccion.idReferencia, data[coleccion.nombre]);
            that.campos[coleccion.nombre].on('dataChanged', function(){
                that.trigger('changed', this , that);
            });


        });
        _.each(referencias, function(refencia){
            that.campos[refencia.nombre] = Env.ModelStore.crear(refencia.relacion.modelo,  data[coleccion.nombre]);
            that.campos[refencia.nombre].on('changed', function(){
                that.trigger('changed', this , that);
            });
        });
        _.each(guids, function(coleccion){
            if(data[coleccion.nombre])
                that.campos[coleccion.nombre] = data[coleccion.nombre];
            else
                that.campos[coleccion.nombre] = guid();

        });
    },

    setFieldsData : function(data){
        if(data)
        {
            var modeloInfo = this.config;
            if(data && !data.id)
                data.id = guid();

            var camposBasicos = _.filter(modeloInfo.configuracion.campos, function(registro){
                return registro.tipo != enums.TipoCampoModelo.Coleccion && registro.tipo != 'referencia' && registro.tipo != 'guid';
            });
            var colecciones = _.filter(modeloInfo.configuracion.campos, function(registro){
                return registro.tipo == enums.TipoCampoModelo.Coleccion;
            });
            var referencias = _.filter(modeloInfo.configuracion.campos, function(registro){
                return registro.tipo == 'referencia';
            });
            var guids = _.filter(modeloInfo.configuracion.campos, function(registro){
                return registro.tipo == 'guid';
            });

            var that = this;

            _.each(camposBasicos, function(campo){
                if(data[campo.nombre])
                    that.campos[campo.nombre] = data[campo.nombre];

                if(data[campo.nombre])
                    that.fields[campo.nombre].set(  data[campo.nombre] );
            });
            _.each(colecciones, function(coleccion){

                //that.campos[coleccion.nombre] = CollectionStore.crear(coleccion.relacion.modelo, data[coleccion.nombre]);
                that.campos[coleccion.nombre] = Env.CollectionStore.crear(coleccion.idReferencia, data[coleccion.nombre]);
                that.campos[coleccion.nombre].on('dataChanged', function(){
                    that.trigger('changed', this , that);
                });

                var col =  Env.colecciones(coleccion.idReferencia, data[coleccion.nombre]);
                col.on('dataChanged', function(){
                    that.trigger('changed', this , that);
                });
                that.fields[coleccion.nombre].set(col);

            });
            _.each(referencias, function(refencia){
                that.campos[refencia.nombre] = Env.ModelStore.crear(refencia.relacion.modelo,  data[coleccion.nombre]);
                that.campos[refencia.nombre].on('changed', function(){
                    that.trigger('changed', this , that);
                });
            });
            _.each(guids, function(coleccion){
                if(data[coleccion.nombre])
                    that.campos[coleccion.nombre] = data[coleccion.nombre];
                else
                    that.campos[coleccion.nombre] = guid();

                if(data[coleccion.nombre])
                    that.fields[coleccion.nombre].set(  data[coleccion.nombre] );
                else
                    that.campos[coleccion.nombre].set( guid() );
            });

            this.trigger('changed', this);
            this.trigger('setData', this);

        }

        return this;
    },
    instantiate: function(){
        this.fields = {};
        var modeloInfo = this.config.configuracion;
        var tipo ="";
        var that = this;
        _.each(modeloInfo.campos , function(element){
            switch (element.tipo) {
                case 'string' :
                    tipo = "Texto";
                    break;
                case 'int' :
                    tipo = "Numerico";
                    break;
                default :
                    tipo = element.tipo.charAt(0).toUpperCase() + element.tipo.slice(1);

                    break;
            }
            that.fields[element.nombre] = new Types[tipo]();
        });


    },

    /**
     * Funcion abstracta a implementar por todos los modelos que tengan validacion
     *
     * @function
     * @public
     *
     * @returns {boolean} Indica si la validacion es correcto o no
     */
    validate : function(){
        return true;
    },

    /**
     * Indica si el model es un modelo nuevo, no una recuperacion de uno ya creado
     *
     * @function
     * @public
     *
     * @returns {boolean}
     */
    isNew : function(){
        return !(this.campos.id && this.campos.id > 0);
    },

    inicializar : function(campos){
        this.campos = campos;
        this.initializated(this);
        return this;
    },

    campoClave : function(){
        return _.find(this.config.configuracion.campos, function(e){ return e.esClave;}).nombre;
    },

    /**
     * Devuelve los campos del modelo un registro plano de formato JSON
     *
     * @funtion
     * @public
     *
     * @param   campos
     * @returns {Object}
     */
    to_JSON : function(campos){
        var serializado = {};

        _.each(this.campos , function(valor, nombre, registro){
            if(typeof valor === 'object' && valor !== null){
                if(valor.config)
                {
                    if(valor.registros && valor.registros.length > 0)
                        serializado[nombre] = valor.to_JSON();
                }

            }
            else{
                serializado[nombre] = valor;
            }
        });

        return serializado;
    },

    /**
     * Busca un modelo en el Store remoto si esta configurado
     *
     * @private
     *
     * @param campo
     * @param valor
     */
    find: function (campo , valor) {
        var ocurrencia = _.find(encuestasBD.IPK_Encuestas, function (e) { return e[campo] == valor; });
        if (ocurrencia)
        {
            this.setData(ocurrencia);
            var that = this;
            var colecciones = _.filter(ModelStore.enumerarCampos(this.config.configuracion.nombre), function (e) { return e.tipo == 'coleccion' });
            _.each(colecciones, function (e) {});
        }
        else
        {
            alert('No se ha encontrado el elemento especificado');
        }
    },

    /** PERSISTIBLE **/
    byId : function(id){
        var filtro = {};
        filtro[this.campoClave()] = (id) ? id : this.valorClave();
        filtro[this.campoClave()] = "'" + filtro[this.campoClave()] + "'";

        return Env.Service_WS.execute(
            {
                operation: 'buscar',
                params : {
                    table: this.config.configuracion.tabla,
                    filter : filtro,
                    Referencias : true,
                    Colecciones : true

                }
            }
        );
    },
    update : function(){
        var actualizacion =  this.to_JSON();
        delete actualizacion[this.campoClave()];

        return Env.Service_WS.execute(
                        {
                            operation: 'update',
                            params : {
                                table: this.config.configuracion.tabla,
                                clave : {
                                    Clave : this.campoClave(),
                                    Valor : this.get(this.campoClave())
                                },
                                datos: actualizacion,
                                grupo : ''
                            }
                        }
        );
    },
    insert : function(){
        var datos =  this.to_JSON();
        return Env.Service_WS.execute(
            {
                operation: 'insert',
                params : {
                    table: this.config.configuracion.tabla,
                    clave : {
                        Clave : this.campoClave(),
                        Valor : this.get(this.campoClave())
                    },
                    datos: datos,
                    grupo : ''
                }
            }
        );
    }
});

/**
 * Gestor de los modelos cargados en la aplicacion
 *
 * @class ModelManager
 * @mixin {WhithEvents}
 * @type {ModelManager}
 */
ModelManager = Class.extend({
    include: WhithEvents,

    /**
     * Constructor
     *
     * @constructor
     * @this  {Model}
     * @param {ModeloConfiguration} params Parametros de configuracion del registro
     */
    initialize : function(params){
        this.config = params;
        this.modelos = {};
        this.trigger('initialized', this);
    },

    /**
     * Devuelve el nombre del tipo la Clase
     *
     * @return {String}
     */
    toString : function(){
        return "ModelManager ";
    },

    /**
     * Carga los modelos que se encuentren en la coleccion que se le pasa por parametro
     *
     * @param {Array} contexto
     */
    load : function(contexto){
        for(var i in contexto)
        {
            this.importar(contexto[i]);
        }
    },

    /**
     * Carga el modelo que se le pasa por parametro
     *
     * @param {Object} informacionModelo Informacion del modelo que se le pasa por parametro
     */
    importar : function(informacionModelo){

        if(!this.modelos[informacionModelo.nombre]){
            var modelo = {};

            if(informacionModelo.metodos)
                informacionModelo.metodos  =  $.extend({} , eval('( function(){ return ' + informacionModelo.metodos + '  })()'));

            informacionModelo.eventos  = informacionModelo.eventos || {};

            _.each(informacionModelo.campos , function(campo){
                var valorDefecto = undefined;
                switch (campo.tipo)
                {
                    case "datetime":
                        valorDefecto = "";
                        break;
                    case "string":
                        valorDefecto = "";
                        break;
                    case "int":
                        valorDefecto = 0;
                        break;
                    case "float":
                        valorDefecto = 0;
                        break;
                    case "guid":
                        valorDefecto = 0;
                        break;
                    case "boolean":
                        valorDefecto = false;
                        break;
                    case "coleccion":
                        valorDefecto = new Collection(campo.relacion);
                        valorDefecto = "";
                        break;
                    case "referencia":
                        valorDefecto = Env.ModelStore.crear(campo.relacion.modelo);
                        valorDefecto = "";
                        break;
            }

                modelo[campo.nombre] = valorDefecto;
            });

            var infoModelo = {
                configuracion : informacionModelo,
                esquema : modelo,
                campos : modelo,
                metodos : informacionModelo.metodos ||{},
                eventos: informacionModelo.eventos || {}
            };
            this.registrar(informacionModelo.nombre, infoModelo);

        }
    },

    importarFromUI : function(informacionModelo){},
    importarFromJSON : function(informacionModelo){
        if(!this.modelos[informacionModelo.nombre]){
            var modelo = {};

            informacionModelo.metodos  = informacionModelo.metodos || {};
            informacionModelo.eventos  = informacionModelo.eventos || {};

            _.each(informacionModelo.campos , function(campo){
                var valorDefecto = undefined;
                switch (campo.tipo)
                {
                    case "datetime":
                        valorDefecto = "";
                        break;
                    case "string":
                        valorDefecto = "";
                        break;
                    case "int":
                        valorDefecto = 0;
                        break;
                    case "guid":
                        valorDefecto = 0;
                        break;
                    case "boolean":
                        valorDefecto = false;
                        break;
                    case "coleccion":
                        valorDefecto = new Collection(campo.relacion);
                        valorDefecto = "";
                        break;
                    case "referencia":
                        valorDefecto = ModelStore.crear(campo.relacion.modelo);
                        valorDefecto = "";
                        break;
                }

                modelo[campo.nombre] = valorDefecto;
            });
            var infoModelo = {
                configuracion : informacionModelo,
                esquema : modelo,
                campos : modelo,
                metodos : informacionModelo.metodos ||{},
                eventos: informacionModelo.eventos || {}
            };
            this.registrar(informacionModelo.nombre, infoModelo);
        }

    },

    /**
     * Registra la informacion del modelo en la coleccion interna para crealo cuando se necesite
     *
     * @function
     * @private
     *
     * @param {String}   nombre     Nombre con el que se va a acceder mas tarde al modelo
     * @param {Object}   extension  Informaci�n para crear el modelo
     */
    registrar : function(nombre, extension){
        this.modelos[nombre] = extension;
    },

    /**
     * Crea una instancia del tipo de modelo que se le indica y con los datos que se le pasan por parametro
     *
     * @param {String} nombre - Nombre del modelo que se quiere instanciar
     * @param {Object} data   - Datos a cargar en la instancia del objecto
     * @returns {Model}
     */
    crear : function(nombre, data){
        var modeloInfo = this.buscarModelo(nombre);
        return new Model(modeloInfo, data);
    },

    buscarModelo :  function (valor, campo){
        if(!campo)
            campo = 'nombre';

        return _.find(this.modelos, function(registro){
            return registro.configuracion[campo]== valor;
        });
    },

    /**
     * Devuelve los nombres de los modelos que estan cargados
     *
     * @function
     * @public
     *
     * @return {Array} Coleccion con los nombres de los modelos que estan cargados
     */
    enumerarModelos : function (){
        var resultado = [];
        _.each(this.modelos, function(modelo, nombre){

            resultado.push( { id: modelo.configuracion.id, nombre : nombre});
        });
        return resultado;
    } ,

    /**
     * Devuelve los campos de el modelo que se indica por parametro
     *
     * @function
     * @public
     *
     * @param  {String} modelo Nombre del modelo del cual queremos obtener los campos
     *
     * @return {Array}  Coleccion con los nombres de los modelos que estan cargados
     */
    enumerarCampos: function (modelo){
        return this.buscarModelo(modelo).configuracion.campos;
    },

    /**
     * Devuelve los metodos de el modelo que se indica por parametro
     *
     * @function
     * @public
     *
     * @param  {String} modelo Nombre del modelo del cual queremos obtener los metodos
     *
     * @return {Array}  Coleccion con los nombres de los metodos
     */
    enumerarMetodos : function (modelo){
        return this.buscarModelo(modelo).configuracion.metodos;
    },

    generateColumns: function (modelo) {
        var campos = this.enumerarCampos(modelo);
        var columnas = [];

        _.each(campos, function (campo) {
            columnas.push({
                propiedad: campo.nombre,
                nombre: campo.nombre,
                titulo: campo.nombre,
                tipoInterno: campo.tipoInterno || campo.tipo,
                esClave: campo.esClave,
                esBusquedaInterna: campo.esBusquedaInterna || false
            })
        });

        return columnas;
    }
});

/**
 * @class   ModelStore
 * @type    {ModelManager}
 *
 */
ModelStore = new ModelManager();

/**
 * Coleccion de modelos que proporciona funciones basicas de busqueda
 *
 * @class
 * @type {Collection}
 */
Collection = Class.extend({
    include: WhithEvents,
    /**
     * Constructor
     * @constructor
     * @this  {Collection}
     * @param {Object} params Parametros de configuracion del registro
     */
    initialize : function(params, data , modelStore){
        this.config = params;

        this.registros = [];
        this.hasChanged = false;
        this.dataHasChanged = function(){};
        this.modelStore = modelStore;

        if(data)
            this.setData(data);

        if(this.config && this.config.eventos)
            this.addEvents(this.config.eventos);

        this.trigger('initialized', this);
        return this;
    },
    toString : function(){
        return "Coleccion ";
    },

    /**
     * Crea una instancia del modelo para el que esta configurada la instancia de la coleccion, con los datos que se le pasen.
     *
     * @throws   dataChanged
     * @throws   Model#changed
     *
     * @param {Object} datos Datos de inicializacion de la instancia
     * @returns {Model}
     */
    crear : function(datos, padre){
        var nuevo = undefined;

        if(this.config.modelo)
        {
            nuevo =  this.modelStore.crear(this.config.modelo, datos);
            nuevo.coleccion = this;
            var that = this;
            var args = (padre) ? [nuevo, padre] : nuevo;
            nuevo.on('changed', function(){
                that.trigger('dataChanged', nuevo , that);
            });
            this.registros.push(nuevo);
            this.trigger('inserted', args , this);
            this.trigger('dataChanged', nuevo , this);
        }
        return nuevo;
    },

    /**
     * A�ade el registro a la coleccion sin que salten eventos
     * @param datos
     * @param padre
     * @returns {undefined}
     **/
    add : function(datos){
        var nuevo = undefined;

        if(this.config.modelo)
        {
            nuevo =  this.modelStore.crear(this.config.modelo, datos);
            nuevo.coleccion = this;
            this.registros.push(nuevo);
        }
        return nuevo;
    },

    fetch : function(){
        this.makeFetch();
    },
    query : function(params){
        this.makeQuery(params);
    },

    /**
     * Inserta el registro en la coleccion, si el parametro es un JSON se crea una instancia del modelo para el que esta configurada la coleccion
     *
     * @throws   dataChanged
     * @throws   Model#changed
     *
     * @param {Object|Model} datos - Registro a insertar en la coleccion
     * @returns {Collection}
     */
    insertar: function (datos, padre) {


        if (datos.toString() == "Clase ")
        {
            nuevo = datos;
        }
        else if(this.config.modelo) {
            nuevo =  this.modelStore.crear(this.config.modelo, datos);
        }

        nuevo.coleccion = this;
        var that = this;
        var args = (padre) ? [nuevo, padre] : nuevo;
        nuevo.on('changed', function () {
            that.trigger('dataChanged', nuevo, that);
        });
        this.registros.push(nuevo);
        this.trigger('inserted', args , this);
        this.trigger('dataChanged', nuevo, this);

        return this;
    },

    /**
     * Elimina el registro de la coleccion buscandolo por el filtro indicado
     *
     * @function
     * @public
     *
     * @param {string} campo - Nombre del campo por el que se va a realizar la busqueda
     * @param {*}      valor - Valor del campo por el que se va a realizar la busqueda
     *
     */
    eliminar : function(campo , valor){
        var $d = new $.Deferred();
        var posicion = this.buscarPosicion(campo, valor);
        var registroEliminado ;
        if(posicion !== -1)
        {
            registroEliminado = this.registros[posicion];
            this.registros.splice(posicion, 1);

            this.trigger('deleted', registroEliminado , this);
            this.trigger('dataChanged', {});

        }

        return $d;
    },

    /**
     * Elimina el registro de la coleccion buscandolo por el filtro indicado
     *
     * @function
     * @public
     *
     * @param {string} campo - Nombre del campo por el que se va a realizar la busqueda
     * @param {*}      valor - Valor del campo por el que se va a realizar la busqueda
     *
     */
    actualizar : function(campo , valor , datos){

        var registro = this.buscar(campo, valor);
        var nuevosDatos;

        if(registro)
        {
            nuevosDatos = $.extend({} , registro.to_JSON() , datos);
            registro.setData(nuevosDatos);

            this.trigger('updated', registro , this);
        }
    },

    /**
     * Busca la posicion del elemento dentro de la coleccion por el filtro indicado
     *
     * @name    buscarPosicion
     * @function
     * @public
     *
     * @param {string} campo - Nombre del campo por el que se va a realizar la busqueda
     * @param {*}      valor - Valor del campo por el que se va a realizar la busqueda
     * @returns {number} Devuelve el la posicion en base 0 del registro o -1 si no se encuentra
     */
    buscarPosicion : function(campo , valor){
        var posicion = 0 , encontrado = false;

        _.each(this.registros, function(r){
                if(r.get(campo) == valor)
                {
                    if(!encontrado)
                        encontrado = true;
                }
                else
                {
                    if(!encontrado)
                        posicion++;
                }

            }
        );

        return (encontrado)? posicion : -1;
    },

    /**
     * Devuelve el registro en la posicion indicada
     *
     * @param {number} posicion - Posicion del registro a recuperar
     * @returns {Model}
     */
    enPosicion : function(posicion){
        var resultado = undefined;
        if(posicion >= 0)
        {
            var cuenta = this.registros.length - 1;
            if(cuenta >= 0 && cuenta >= posicion)
                resultado = _.toArray(this.registros)[posicion];
        }
        else
        {
            alert('La posicion debe ser 0 o mayor.');
        }
        return resultado;
    },

    /**
     * Busca un registro en la coleccion que coincida con los parametros de busqueda
     *
     * @param {string} campo - Nombre del campo por el que se va a realizar la busqueda
     * @param {*}      valor - Valor del campo por el que se va a realizar la busqueda
     * @returns {Model}
     */
    buscar: function (campo , valor) {
        var ocurrencia = _.find(this.registros, function (e) { return e.get(campo) == valor; });
        if (!ocurrencia){
            alert('No se ha encontrado el elemento especificado');
        }

        return ocurrencia;
    },
    /**
     * Busca un registro en la coleccion que coincida con los parametros de busqueda
     *
     * @param {string} campo - Nombre del campo por el que se va a realizar la busqueda
     * @param {*}      valor - Valor del campo por el que se va a realizar la busqueda
     * @returns {Model}
     */
    buscarMultiple: function (filtro) {
        var ocurrencia = _.where(this.to_JSON(), filtro);
        if (!ocurrencia){
            alert('No se ha encontrado el elemento especificado');
        }

        return ocurrencia;
    },

    /**
     * Busca un registro en la coleccion que coincida con los parametros de busqueda
     *
     * @param {string} campo - Nombre del campo por el que se va a realizar la busqueda
     * @param {*}      valor - Valor del campo por el que se va a realizar la busqueda
     * @returns {Model}
     */
    filtrar: function (funcion) {
        var ocurrencias = _.filter(this.to_JSON(), funcion);
        if (!ocurrencias)
            alert('No se ha encontrado el elemento especificado');

        return ocurrencias;
    },

    /**
     * Inicializa la coleccion con los regisrto que se le pasan por parametro
     *
     * @throws   dataChanged
     *
     * @param {Array.<Object>} data Datos a incluir en la coleccion
     */
    setData : function(data, silent){
        var that = this;

        if(data)
        {
            that.registros = [];

            if(this.config.modelo)
            {
                var nuevo;
                _.each(data, function(registro){
                    nuevo =  that.modelStore.crear(that.config.modelo, registro);

                    nuevo.coleccion = that;
                    nuevo.on('changed', function(){
                        that.trigger('dataChanged', nuevo , that);
                    });
                    that.registros.push(nuevo);
                });
            }
            else
                this.registros = data;

            if(!silent)
            {
                this.trigger('dataLoaded', data, this);
                this.trigger('dataChanged', data, this);
            }
        }
    },

    /**
     * Convierte la coleccion en un array de objetos JSON
     *
     * @returns {Array.<Object>}
     */
    to_JSON : function() {
        var serializado = [];

        if(this.registros.length > 0)
            _.each(this.registros, function(registro){
                if(registro.to_JSON)
                    serializado.push(registro.to_JSON());
                else
                    serializado.push(registro);
            });

        return serializado;
    },

    /**
     * Ejecuta sobre los registros de la coleccion una funcion de la libreria Underscore.js
     * El primer parametro es el nombre de la funciones que se va a ejecutar
     * Los demas  parametros de la funcion son los mismo que los de la fucnion Undescore.js
     *
     * @returns {*}
     */
    operation : function(){
        var operacion = arguments[0];
        var newArguments = [].slice.call(arguments, 1, arguments.length);
        newArguments.unshift(this.registros);

        return _[operacion].apply(_, newArguments);
    },

    //TODO : Refactorizar esto sacandolo de la coleccion
    makePersistible : function(params){
        this.service = params.service;
        this.table = (params.table) ? params.table : this.modelStore.buscarModelo(this.config.modelo).configuracion.tabla;

        this.on('updated' , _.bind(this.makeUpdate, this));
        this.on('inserted', _.bind(this.makeInsert, this));
        this.on('deleted' , _.bind(this.makeDelete, this));
    },
    makeFetch : function(){
        var $d = $.Deferred();
        var that = this;
        this.service.execute({operation: 'listado', params : { table: this.table}})
            .done(function(data){ that.trigger('post-fetch', data);});
        return $d;
    },
    makeQuery : function(params){
        var $d = $.Deferred();
        var that = this;
        this.service.execute(
            {
                operation: 'buscar',
                params : {
                    table : this.table,
                    query : params.query,
                    Referencias: params.referencias || false,
                    Colecciones: params.colecciones || false
                }
            }
        )
        .done(
            function(data){
                that.trigger('post-query', data);
                $d.resolve(data);
            });

        return $d;
    },
    makeInsert : function(registro){
        var $d = $.Deferred();
        var that = this;
        if(_.isArray(registro))
            this.service.execute(
                {
                    operation: 'insertHijo',
                    params : {
                        table: this.table,
                        datos: registro[0].to_JSON(),
                        datosPadre : registro[1]
                    }
                }
            ).done(
                function(data){
                    that.trigger('post-inserted', data);
                    that.trigger('dataChanged', data, that);
                    $d.resolve(data);
                });
        else
        {
            /*if(registro.toString().trim() !== 'Clase'){
                registro =  this.modelStore.crear(this.config.modelo, registro);
            }*/

            if(registro.to_JSON){
                this.service.execute( { operation: 'insert', params : { table: this.table, datos: registro.to_JSON()} } )
                    .done(function(data){ that.trigger('post-inserted', data); $d.resolve(data);});
            }
            else{
                this.service.execute( { operation: 'insert', params : { table: this.table, datos: registro} } )
                    .done(function(data){ that.trigger('post-inserted', data); $d.resolve(data);});
            }



        }

        return $d;
    },
    makeUpdate : function(registro){
        var $d = $.Deferred();
        var actualizacion =  registro.to_JSON();
        delete actualizacion.id;
        var that = this;

        this.service.execute(
            {
                operation: 'update',
                params : {
                    table: this.table,
                    clave : {
                        Clave : 'id',
                        Valor : registro.get('id')
                    },
                    datos: actualizacion,
                    grupo : ''
                }
            }
        )
        .done(
            function(data){
                that.trigger('post-updated', data);
                that.trigger('dataChanged', data, that);
                $d.resolve(data);
            });

        return $d;
    },
    makeDelete : function(registro){
        var $d = $.Deferred();
        var that = this;
        this.service.execute(
            {
                operation: '_delete',
                params : {
                    table:this.table,
                    clave : 'id',
                    valor: registro.get('id')
                }
            }
        )
        .done(
            function(data){
                that.trigger('post-deleted', data);
                that.trigger('dataChanged', data, that);
                $d.resolve(data);
            }
        );

        return $d;
    }
});
CollectionManager = Class.extend({
    include: WhithEvents,
    /**
     * Constructor
     * @constructor
     *
     * @throws    initialized
     *
     *
     * @this  {CollectionManager}
     * @param {Object} params Parametros de configuraci�n del registro
     */
    initialize : function(params){
        this.config = params;

        this.modelos = {};
        this.trigger('initialized', this);
    },

    /**
     * Devuelve el nombre de la clase
     *
     * @returns {string}
     */
    toString : function(){
        return "ColectionManager ";
    },

    /**
     * Crear una instancia de una Collection para el modelo indicado
     *
     * @param {string} nombre - Nombre del modelo para crear la Collection
     * @param {Array.<Object>} data - Datos con los que incializar la coleccion
     *
     * @returns {Collection}
     */
    crear : function(nombre, data){
        return new Collection( {modelo: nombre}, data ,this.config.modelStore);
    }
});

/**
 * @class CollectionStore
 * @type {CollectionManager}
 */
CollectionStore = new CollectionManager({modelStore:ModelStore});

Service = Class.extend({
    initialize : function(params){
        //logger.append('Service', 'initialize', '', arguments);
        this.proxy = new  window["Proxy" + params.proxy](params);
    },
    execute  : function(command){
        //logger.append('Service', 'execute', '', arguments);
        return this.proxy[command.operation](command.params);
    }
});
ProxyLocalStorage = Class.extend({
    initialize : function(params){
        this.config = params;
        this.dbName = params.dbName;
        this.db = this.loadDatabase();
    },
    loadDatabase : function(){

        if(localStorage[this.dbName])
            return JSON.parse(localStorage[this.dbName]);
        else
            return {};

    },
    getTable : function(params, shallow){
        var result = undefined;
        if(shallow)
            result = this.db[params.table];
        else
            result = JSON.parse(JSON.stringify(this.db[params.table]));

        return  result;
    },
    saveTable : function(params){
        localStorage[this.dbName] = JSON.stringify(this.db);
    },
    query : function(params){
        var tabla = this.getTable(params);
        var results = [];

        if(!params.fields)
        {
            results = _.filter(tabla, function(row){
                return row[params.field] == params.value;
            });
        }
        else
        {
            results = _.findWhere(tabla, params.fields);
        }

        return  JSON.parse(JSON.stringify(results || []));
    },
    insert   : function(params){
        this.getTable(params, true).push(params.row);
        this.saveTable(params);

        return params.row;
    },
    update  : function(params){
        var registro , nuevosDatos;
        var tabla = this.getTable(params, true);
        var posicion = this._buscarPosicion(params);

        if(posicion !== -1)
        {
            registro = tabla[posicion];
            nuevosDatos = $.extend({} , registro, params.row);
            tabla[posicion] = nuevosDatos;

            this.saveTable(params);
        }

        return nuevosDatos;
    },
    _delete   : function(params){
        var tabla = this.getTable(params , true);
        var posicion = this._buscarPosicion(params);

        if(posicion !== -1)
        {
            //delete tabla[posicion];
            tabla.splice(posicion, 1);
            this.saveTable(params);
        }
    }   ,
    _buscarPosicion : function(params){
        var posicion = 0 , encontrado = false;
        var tabla = this.getTable(params);

        _.each(tabla, function(r){
                if(r[params.field] == params.value)
                {
                    if(!encontrado)
                        encontrado = true;
                }
                else
                {
                    if(!encontrado)
                        posicion++;
                }
            }
        );

        return (encontrado) ? posicion : -1;
    }
});
ProxyWebService = Class.extend({
    initialize : function(params){
        //logger.append('ProxyWebService', 'initialize', '', arguments);
        this.config = params;
        this.url = params.url;
        this.ls_navision = new ProxyLocalStorage({dbName : 'navision_06262014'});
    },
    _ajaxConfig : function(){
        var that = this;
        return {
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: this.url,
            data: '',
            dataType: 'json',
            beforeSend : function(jqXHR, settings){
/*
                console.log('beforeSend');
                console.log(arguments);
                console.log('----------');
*/
            },
            dataFilter: function(data, dataType){
                //console.log('dataFilter');
                //console.log(JSON.parse(data));
                //console.log(that._processData(JSON.parse(data)));
                //console.log(arguments);
                //console.log('----------');
                return JSON.stringify(that._processData(JSON.parse(data)));
            },
            /*
            success : function(data, textStatus, jqXHR) {

                console.log('success');
                console.log(arguments);
                console.log('----------');

            },
            error: function (jqXHR, textStatus, errorThrown) {

                console.log('error');
                console.log(arguments);
                console.log('----------');

            },
            */
            complete : function (jqXHR, textStatus, errorThrown) {
                /*
                console.log('complete');
                console.log(arguments);
                console.log('----------');
                */
            }
        }
    },
    _processData : function(data, textStatus, jqXHR){
        var respuestaJSON = JSON.parse(data.d);

        var resultado = {};
        resultado.estado = respuestaJSON["Estado"];
        resultado.tieneDatos = false;
        resultado.mensaje = '';

        if(resultado.estado === 'OK')
        {
            if(respuestaJSON["Datos"].length > 0)
            {
                resultado.datos = JSON.parse(respuestaJSON["Datos"]);
                resultado.tieneDatos = resultado.datos.length > 0;
            }
            else
            {
                resultado.tieneDatos = false;
                resultado.datos = "";
            }
            resultado.mensaje = respuestaJSON["Mensaje"];
        }
        else if( resultado.estado === 'Empty')
        {
            resultado.mensaje = 'No se han obtenido resultados para la contulta';
        }
        else if( resultado.estado === 'Error')
        {
            resultado.mensaje = 'Ha ocurrido un error: \n ' + respuestaJSON["Mensaje"];
            resultado.llamada = arguments;
            alert(resultado.mensaje);
        }

        return resultado;
    },
    raw : function(params){
        //logger.append('ProxyWebService', 'raw', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'RawSQL',
                params : {
                    texto : params.texto
                }
            }
        };

        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    listado : function(params){
        //logger.append('ProxyWebService', 'listado', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'Listado',
                params : {
                    table: params.table
                }
            }
        };

        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    /**
     *
     * @param params        {Object}
     * @param params.table  {String} Nombre de la table de la base de datos contra la que se va a realizar la insercion
     * @param params.datos  {Object} Datos a insertar en la BBDD
     * @returns {*}
     */
    insert : function(params){
        var ajaxParams = {
            Operacion : {
                operation : 'Insert',
                params : {
                    table: params.table,
                    datos : params.datos,
                    auditoria : {
                        rol : Env.Acl.getRol(),
                        usuario : $('.ms-welcomeMenu').text()
                    }
                }
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            "data": JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    insertHijo : function(params){
        //logger.append('ProxyWebService', 'insertHijo', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'InsertHijo',
                params : {
                    table: params.table,
                    datos : params.datos,
                    datosPadre : params.datosPadre
                }
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    crearRelacion : function(params){
        //logger.append('ProxyWebService', 'crearRelacion', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'CrearRelacion',
                params : {
                    Datos1: params.datos1,
                    Datos2: params.datos2
                }
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    borrarRelacion : function(params){
        //logger.append('ProxyWebService', 'BorrarRelacion', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'BorrarRelacion',
                params : {
                    Datos1: params.datos1,
                    Datos2: params.datos2
                }
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    update : function(params){
        //logger.append('ProxyWebService', 'update', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'Update',
                params : {
                    table: params.table,
                    clave : params.clave,
                    datos :params.datos,
                    auditoria : {
                        rol : Env.Acl.getRol(),
                        usuario : $('.ms-welcomeMenu').text()
                    }
                }
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    _delete   : function(params){
        //logger.append('ProxyWebService', 'delete', '', arguments);

        params.auditoria = {
            rol : Env.Acl.getRol(),
            usuario : $('.ms-welcomeMenu').text()
        };

        var ajaxParams = {
            Operacion : {
                operation : 'Delete',
                params : params
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    buscar : function(params){
        //logger.append('ProxyWebService', 'buscar', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'Buscar',
                params : params
            }
        };
        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    entidades : function(){
        //logger.append('ProxyWebService', 'entidades', '', arguments);

        var ajaxParams = {
            Operacion : {
                operation : 'Entidades',
                params : {}
            }
        };

        var options = $.extend(this._ajaxConfig(), {
            data: JSON.stringify(ajaxParams)
        });

        return $.ajax(options);
    },
    navision : function(params){
        //logger.append('ProxyWebService', 'navision', '', arguments);

        /*if(this.ls_navision.db[JSON.stringify( params )]){
            var $d = $.Deferred();

            $d.resolve(this.ls_navision.db[JSON.stringify( params )]);

            return $d;
        }
        else{*/
            var ajaxParams = {
                Operacion : {
                    operation : 'Navision',
                    params : params
                }
            };
            var options = $.extend(this._ajaxConfig(), {
                data: JSON.stringify(ajaxParams)
            });

            /* var operacion = {
             operation : 'EjecutarFiltro',
             params : {
             Pagina :'ItemValues',
             Filtro: {
             Tipo_tabla: "28"
             },
             Tamanyo : 0,
             Campos : ["Codigo","Descripcion"]
             }
             };*/

            /*Env.Service_WS.execute({
             operation:'navision',
             params : {
             operation : 'EjecutarFiltro',
             params : {
             Pagina :'ItemValues',
             Filtro: {
             Tipo_tabla: "28"
             },
             Tamanyo : 0,
             Campos : ["Codigo","Descripcion"]
             }
             }
             });*/
            var that = this;
            return $.ajax(options);/*.done(
                function(res){
                    console.log('RES');
                    console.log(res)
                    that.ls_navision.db[JSON.stringify( params )] = res;
                    that.ls_navision.saveTable();
                    //localStorage.getItem('navision_06262014')
                });*/
        /*}*/


    }
});

/*var Logger = Class.extend({
    initialize: function(){
        this._log = [];
        this.append('Logger', 'initialize', 'Inicializacion del log');
    },
    append : function(objeto, metodo , mensaje, datos){
        this._log.push({
            time : new Date().toLocaleTimeString(),
            objeto : objeto,
            metodo : metodo,
            mensaje : mensaje,
            datos : datos
        });
    },
    view : function(toString){
        if(console && console.log)
        {
            if(toString)
                _.each(this._log, _.bind(this.toConsoleString, this));
            else
                _.each(this._log, _.bind(this.toConsole, this));
        }
    },
    viewBy : function(filtro, toString){
        if(console && console.log)
        {
            var filtro = _.where(this._log, filtro);
            if(toString)
                _.each(filtro, _.bind(this.toConsoleString, this));
            else
                _.each(filtro, _.bind(this.toConsole, this));
        }
    },
    groupBy : function(campo, toString){
        if(console && console.log)
        {
            var filtro = _.groupBy(this._log, campo);
            _.each(filtro, _.bind(this.toConsoleGroup, this, toString));
        }
    },
    toConsoleGroup : function(toString, datos, grupo ){
        var llamada = '';

        console.log('GRUPO :: ' + grupo);
        if(toString)
            _.each(datos, _.bind(this.toConsoleString, this));
        else
            _.each(datos, _.bind(this.toConsole, this));
        console.log('');
    },
    toConsole : function(elemento){
        if(elemento.datos)
        {
            elemento.llamada = this.formatLlamada(elemento);
        }
        console.log(elemento);
    },
    toConsoleString : function(elemento){
        if(elemento.datos)
        {
            elemento.llamada = this.formatLlamada(elemento);
            //console.log(elemento);

        }
        console.log(this.formatLlamada(elemento));
    },
    formatLlamada : function(elemento){
        var cadena = '';

        _.each(elemento.datos , function(dato){
            if(cadena != '')
                cadena += ',';

            //cadena += (Utils.getType(dato) == 'object') ? JSON.stringify(dato) : dato;
            cadena += dato;
        });

        return elemento.time + ' :: ' + elemento.objeto + '.' +elemento.metodo + '(' + cadena + ')';
    }
});
var logger = new Logger();*/

var ServiciosNavision = Class.extend({
    initialize : function(Service){
        this._service = Service;
    },
    ejecutarFiltro : function(page, filtro, campos){
        return this._service.execute({
                operation:'navision',
                params : {
                    operation : 'EjecutarFiltro',
                    params : {
                        Pagina : page,
                        Filtro: filtro,
                        Tamanyo : 0,
                        Campos : campos || [] // ["No", "Description"]
                    }
                }
            }
        );
    },
    getPages : function(){
        return this._service.execute({
                operation:'navision',
                params : {
                    operation : 'ListadoPaginas',
                    params : {}
                }
            }
        );
    },
    getPageFields : function(nombre){
        return  this._service.execute({
                operation:'navision',
                params : {
                    operation : 'ListadoCampos',
                    params : {
                        Pagina : nombre
                    }
                }
            }
        );
    },
    getPageType : function(nombre){
        return  this._service.execute({
                operation:'navision',
                params : {
                    operation : 'ListadoTipo',
                    params : {
                        Tipo : nombre
                    }
                }
            }
        );
    },
    getEnumValues : function(nombre){
        return  this._service.execute({
                operation:'navision',
                params : {
                    operation : 'EnumValues',
                    params : {
                        Enumeracion : nombre
                    }
                }
            }
        );
    },
    getItem : function(page, filtro){
        return this.ejecutarFiltro(page, filtro);
    },
    toNavision : function(plantilla, camposPlantilla, datos){
        return Env.Service_WS.execute(
            {
                operation:'navision',
                params : {
                    operation : 'toNavision',
                    params : {
                        plantilla : plantilla,
                        camposPlantilla : camposPlantilla,
                        datos : datos
                    }
                }
            });
    },
    crear : function(plantilla, camposPlantilla, datos){
        return Env.Service_WS.execute(
            {
                operation:'navision',
                params : {
                    operation : 'Crear',
                    params : {
                        plantilla : plantilla,
                        camposPlantilla : camposPlantilla,
                        datos : datos
                    }
                }
            });
    },
    actualizar : function(filtro, plantilla, camposPlantilla, datos){
        return Env.Service_WS.execute(
            {
                operation:'navision',
                params : {
                    operation : 'Actualizar',
                    params : {
                        dicFiltro : filtro,
                        plantilla : plantilla,
                        camposPlantilla : camposPlantilla,
                        datos : datos
                    }
                }
            });
    },
    eliminar : function(pagina, filtro){
        return Env.Service_WS.execute(
            {
                operation:'navision',
                params : {
                    operation : 'Eliminar',
                    params : {
                        pagina : pagina,
                        dicFiltro : filtro
                    }
                }
            });
    },
    importar : function(plantilla, filtroNavision, datos){
        return ImportFromNavision(plantilla, filtroNavision, datos);
    },
    exportacionParcial : function(plantilla, datos){
        return this.create(plantilla, datos);
    },
   /* export : function(plantilla, datos, callback){
        var $d = new $.Deferred();
        var administracionFacade = new AdministracionFacade();
        var self = this;

        administracionFacade.obtenerPlantilla(plantilla).done(
            function(res){
                if(callback)
                    callback.apply(this, [res]);

                self
                    .toNavision(
                        Env.modelos('ipk.plantillasNavision',res.datos[0]).to_JSON(),
                        Env.colecciones('ipk.campoPlantillaNavision',res.datos[0].adm_CampoPlantillaNavision).to_JSON(),
                        datos
                    );
            }
        );

        //Env.Service_Navision.export('UomItem_Exportacion', datosInicio, function(res){ console.log('Cambio en la plantilla'); console.log( _.find( res.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'} ).valor = 'V028666' ); }).done( toConsole )

        return $d;
    },*/
    create : function(plantilla, datos, callback){
        var $d = new $.Deferred();
        var administracionFacade = new AdministracionFacade();
        var self = this;

        administracionFacade.obtenerPlantilla(plantilla).done(
            function(res){
                if(callback)
                    callback.apply(this, [res]);

                self
                    .crear(
                        Env.modelos('ipk.plantillasNavision',res.datos[0]).to_JSON(),
                        Env.colecciones('ipk.campoPlantillaNavision',res.datos[0].adm_CampoPlantillaNavision).to_JSON(),
                        datos
                    )
                    .done(function(){
                        $d.resolve();
                    })
                       ;
            }
        );

        //Env.Service_Navision.export('UomItem_Exportacion', datosInicio, function(res){ console.log('Cambio en la plantilla'); console.log( _.find( res.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'} ).valor = 'V028666' ); }).done( toConsole )

        return $d;
    },
    update: function(filtro, plantilla, datos, callback){
        var $d = new $.Deferred();
        var administracionFacade = new AdministracionFacade();
        var self = this;

        administracionFacade.obtenerPlantilla(plantilla).done(
            function(res){
                if(callback)
                    callback.apply(this, [res]);

                self
                    .actualizar(
                        filtro,
                        Env.modelos('ipk.plantillasNavision',res.datos[0]).to_JSON(),
                        Env.colecciones('ipk.campoPlantillaNavision',res.datos[0].adm_CampoPlantillaNavision).to_JSON(),
                        datos
                    )
                    .done(function(){
                        $d.resolve();
                    });
            }
        );

        //Env.Service_Navision.export('UomItem_Exportacion', datosInicio, function(res){ console.log('Cambio en la plantilla'); console.log( _.find( res.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'} ).valor = 'V028666' ); }).done( toConsole )
        /*var datosInicio =  {"ancho":10,"codigo":"CAJA","cantidadPorPalet": 1,"nivelEmbalaje":1,"idArticulo": view.gridArticulos.gridArticulos.tabla.idFilaSeleccionada ,"cantidadPorUnidadMedida": 20 ,"idProyecto": view.srvProyecto.proyecto.id ,"largo":30,"alto":35,"volumen":900,"pesoBruto":1000}
        Env.Service_Navision.update({'Item_No': 'V028666', 'Code': 'CAJA'},'UomItem_Exportacion', datosInicio, function(res){ console.log('Cambio en la plantilla'); console.log( _.find( res.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'} ).valor = 'V028666' ); }).done( toConsole )*/

        return $d;
    }

});
var ServiciosSharepoint = Class.extend({
    initialize : function(){
        this._contexto = null;

    },
    contexto : function(url){
        return new SP.ClientContext(url);
    },
    contextoActual : function(){
        if( !this._contexto)
            this._contexto = SP.ClientContext.get_current();

        return this._contexto;
    },
    getGroups : function(){
        var $d = new $.Deferred();

        var contexto = this.contextoActual();
        var web = contexto.get_web();
        var siteGroups = web.get_siteGroups();
        var arrGrupos = [];

        contexto.load(siteGroups );
        contexto.executeQueryAsync(onLoadGrupos, onFailGrupos);
        function onLoadGrupos(){
            var groupsEnum = siteGroups.getEnumerator();
            while (groupsEnum.moveNext()) {
                var group = groupsEnum.get_current();
                if(group.get_title().indexOf('dnp_', 0) === 0){
                    arrGrupos.push(group.get_title());
                }
            }
            $d.resolve(arrGrupos);
        };
        function onFailGrupos(){};

        return $d;
    },
    getGroupsInfoAll : function(){
        var $d = new $.Deferred();

        var contexto = this.contextoActual();
        var web = contexto.get_web();
        var siteGroups = web.get_siteGroups();
        var arrGrupos = [];

        contexto.load(siteGroups );
        contexto.executeQueryAsync(onLoadGrupos, onFailGrupos);
        function onLoadGrupos(){
            var groupsEnum = siteGroups.getEnumerator();
            while (groupsEnum.moveNext()) {
                var group = groupsEnum.get_current();
                arrGrupos.push([group.get_id(), group.get_title()]);
            }
            $d.resolve(arrGrupos);
        };
        function onFailGrupos(){};

        return $d;
    },
    getGroupsInfo : function(){
        var $d = new $.Deferred();

        var contexto = this.contextoActual();
        var web = contexto.get_web();
        var siteGroups = web.get_siteGroups();
        var arrGrupos = [];

        contexto.load(siteGroups );
        contexto.executeQueryAsync(onLoadGrupos, onFailGrupos);
        function onLoadGrupos(){
            var groupsEnum = siteGroups.getEnumerator();
            while (groupsEnum.moveNext()) {
                var group = groupsEnum.get_current();
                if(group.get_title().indexOf('dnp_', 0) === 0){
                    arrGrupos.push([group.get_id(), group.get_title()]);
                }
            }
            $d.resolve(arrGrupos);
        };
        function onFailGrupos(){};

        return $d;
    },
    getCurrentUserGroups : function(){
        var $d = $.Deferred();

        var contexto = this.contextoActual();
        var web = contexto.get_web();
        var user = web.get_currentUser();
        var siteGroups = web.get_siteGroups();
        var usuarios = undefined;
        var grupos = [];

        contexto.load(user);
        contexto.load(siteGroups );

        contexto.executeQueryAsync(onLoadGrupos, onFailGrupos);

        function onLoadGrupos(){
            var groupsEnum = siteGroups.getEnumerator();

            while (groupsEnum.moveNext()) {
                var group = groupsEnum.get_current();
                if(group.get_title().indexOf('dnp_', 0) === 0){

                    grupos.push($.Deferred());

                    usuarios = group.get_users();
                    contexto.load(usuarios);
                    contexto.executeQueryAsync(_.bind(onLoadUsuarios, this, group.get_title(), usuarios), _.bind(onFailUsuarios, this,  group.get_title()) );
                }
            }
        };
        function onFailGrupos(){ console.log(":("); };
        function onLoadUsuarios(grupoNombre, usuarios){
            var listEnumerator = usuarios.getEnumerator();

            while (listEnumerator.moveNext()) {
                var item = listEnumerator.get_current();

                if (user.get_loginName() == item.get_loginName()) {

                    grupos.push(grupoNombre);
                    $d.resolve(grupoNombre);

                    break;
                }
            }
        };
        function onFailUsuarios(){  console.log(arguments); console.log(":( USU"); };

        return $d;
    },

    getUserInfoByLogin : function(login){
        var $d = new $.Deferred();
        var context = new SP.ClientContext.get_current();
        var web = context.get_web();
        var user = web.ensureUser(login);
        context.load(user);

        context.executeQueryAsync(
            function(sender, args) { $d.resolve( user ); },
            function(sender, args) { $d.reject( args ); }
        );

        return $d;
    },
    getUsersOfGroup : function (groupId) {
        var $d = new $.Deferred();
        var users = [];

        var currentContext = this.contextoActual();
        var currentWeb = currentContext.get_web();

        var currentUser = currentContext.get_web().get_currentUser();
        currentContext.load(currentUser);

        var allGroups = currentWeb.get_siteGroups();
        currentContext.load(allGroups);

        var group = allGroups.getById(groupId);
        currentContext.load(group);

        var groupUsers = group.get_users();
        currentContext.load(groupUsers);

        currentContext.executeQueryAsync(onSuccess,onFailure);

        function onSuccess(sender, args) {
            var userInGroup = false,
                groupUserEnumerator = groupUsers.getEnumerator(),
                groupUser;

            while (groupUserEnumerator.moveNext()) {
                groupUser = groupUserEnumerator.get_current();
                users.push(groupUser.get_loginName());
            }
            $d.resolve(users);
        }
        function onFailure(sender, args) {
            $d.resolve(null);
        }

        return $d;
    },
    IsCurrentUserMemberOfGroup : function (id, OnComplete) {
        var currentContext = this.contextoActual();
        var currentWeb = currentContext.get_web();

        var currentUser = currentContext.get_web().get_currentUser();
        currentContext.load(currentUser);

        var allGroups = currentWeb.get_siteGroups();
        currentContext.load(allGroups);

        var group = allGroups.getById(id);
        currentContext.load(group);

        var groupUsers = group.get_users();
        currentContext.load(groupUsers);

        currentContext.executeQueryAsync(onSuccess,onFailure);

        function onSuccess(sender, args) {
            var userInGroup = false;
            var groupUserEnumerator = groupUsers.getEnumerator();
            while (groupUserEnumerator.moveNext()) {
                var groupUser = groupUserEnumerator.get_current();
                if (groupUser.get_loginName() == currentUser.get_loginName()) {
                    userInGroup = true;
                    break;
                }
            }
            OnComplete(userInGroup);
        }

        function onFailure(sender, args) {
            OnComplete(false);
        }
    },
    getCurrentUserGroups2 : function(){
        var self = this;
        var o = [];
        var $f = $.Deferred();

        self.getGroupsInfo().done(
            function(grupos){
                Utils.Async.eachPromise(grupos,
                    function(grp, salida){
                        var $d = $.Deferred();
                        self.IsCurrentUserMemberOfGroup(grp[0],
                            function (isCurrentUserInGroup) {
                                if(isCurrentUserInGroup)
                                    salida.push(grp[1]);

                                $d.resolve();
                            });
                        return $d;
                    }, o).done(
                        function(){
                            $f.resolve(o);
                        }
                );
        });

        return $f;
    },
    elementosEnLista : function(nombre){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(nombre),
            query = SP.CamlQuery.createAllItemsQuery(),
            items = lista.getItems(query);

        contexto.load(items);

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(items); }, function(){ operacion.reject(arguments); });

        return operacion.promise();
    },
    elementosEnListaQuery : function(nombre, queryXml){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(nombre),
            query = new SP.CamlQuery(),
            items = undefined;

        query.set_viewXml(queryXml);
        items = lista.getItems(query);

        contexto.load(items);

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(items); }, function(){ operacion.reject(arguments); });

        return operacion.promise();
    },
    carpetasEnLista : function(nombre){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(nombre),
            query = SP.CamlQuery.createAllFoldersQuery(),
            items = lista.getItems(query);

        contexto.load(items);

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(items); }, function(){ operacion.reject(arguments); });

        return operacion.promise();
    },
    documentosEnCarpetaQuery : function(nombre, ruta, queryXml){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(nombre),
            query = new SP.CamlQuery();

        query.set_folderServerRelativeUrl(ruta);
        query.set_viewXml(queryXml);

        var items = lista.getItems(query);
        contexto.load(items);

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(items); }, function(){ operacion.reject(arguments); });

        return operacion.promise();
    },
    documentosEnCarpeta : function(nombre, ruta){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(nombre),
            query = SP.CamlQuery.createAllItemsQuery();

        query.set_folderServerRelativeUrl(ruta);

        var items = lista.getItems(query);
        contexto.load(items);

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(items); }, function(){ operacion.reject(arguments); });

        return operacion.promise();
    },
    actualizarElementoEnLista : function(nombre, identificador,  setterFunction, registro){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(nombre),
            elemento = lista.getItemById(identificador);

        if(registro)
            setterFunction(elemento, registro);
        else
            setterFunction(elemento);
        elemento.update();

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(elemento); }, function(){ operacion.reject(arguments); });

        return operacion.promise();
    },
    crearCarpeta : function(Lista, Carpeta){
        var contexto = this.contextoActual(),
            web = contexto.get_web(),
            lista = web.get_lists().getByTitle(Lista),
            listItemCreationInfo = new SP.ListItemCreationInformation();

        listItemCreationInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);
        listItemCreationInfo.set_leafName(Carpeta);

        var newItem = lista.addItem(listItemCreationInfo);

        newItem.update();

        contexto.load(web);
        contexto.load(lista);

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function () { operacion.resolve(newItem); }, function(){ operacion.reject(arguments); });

        return operacion.promise();

        //"http://svb00078/sites/coleccionsitios/DesarrolloNuevosProductos/Documentos/Forms/AllItems.aspx?RootFolder=%2Fsites%2Fcoleccionsitios%2FDesarrolloNuevosProductos%2FDocumentos%2FA0002&FolderCTID=0x01200069FA1FBDFDFA5749AE95A9CD936B194A&View={0A096364-68E8-49EB-B081-7B567A8D9755}&InitialTabId=Ribbon%2EDocument&VisibilityContext=WSSTabPersistence"
    },
    eliminarElemento : function(Lista, Id){
        var contexto = this.contextoActual();
        var item = contexto
            .get_web()
            .get_lists()
            .getByTitle(Lista)
            .getItemById(Id);

        item.deleteObject();

        var operacion = $.Deferred();
        contexto.executeQueryAsync(function(){ operacion.resolve(Id);}, function(){operacion.reject();});

        return operacion.promise();
    },
    enviarCorreo : function(url, subject, texto, rol, responsable){
        var _params = {
            Subject: subject || 'PRUEBA',
            Body : texto || 'TEXTO DEL MENSAJE',
            IsBodyHtml : true,
            From: 'sharepoint@vicrila.com',
            To: responsable || ['karmelo.retolaza@vicrila.com'],
            Grupo: rol || 'dnp_lectores'
        };

        var _ajaxConfig ={

                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: url,
                data: JSON.stringify(_params),
                dataType: 'json'
        };

        return $.ajax(_ajaxConfig);
    }

});

/**
 * Clase que carga toda la informaci�n necesaria para el funcionamiento de las aplicacion y lo cachea en memoria
 *
 * @class Contexto
 * @mixin {WithEvents}
 * @type {Contexto}
 */
var Acl = Class.extend({
    initialize : function(){
        this._rolName = undefined;
        this._rolInfo = undefined;
        this._rolAccess = undefined;

        return this;
    },
    setRol : function(rol){
        var $d = $.Deferred();

        if(rol && rol.trim() !== '')
        {
            var self = this;
            var rolInfo = undefined;
            this._rolName = rol;
            this._rolInfo = rolInfo = _.find(Env.Contexto.adm.roles, function(r){ return r.nombre == rol});
            this._rolAccess = _.filter(Env.Contexto.adm.accesos, function(r){ return r.idRol == rolInfo.id});
            var datos = undefined;
            Env.Service_WS.execute(
                {
                    operation: 'buscar',
                    params :
                    {
                        table: 'adm_Roles',
                        filter : { id : "'" + Env.Acl.getRolInfo().id + "'"},
                        Referencias : true,
                        Colecciones: true
                    }
                }
            ).done(
                function(res){
                    self._rolInfo = res.datos[0];
                    $d.resolve(self);
                }
            )
        }

        return $d;
    },
    getRol : function(){
        if(!this._rolName)
            throw("No se ha inicializado el rol actual.");

        return this._rolName;
    },
    getRolInfo : function(){
        if(!this._rolInfo)
            throw("No se ha inicializado la informaci�n del rol.");

        return this._rolInfo;
    },
    getRolAccess : function(idModelo){
        var res = undefined;

        if(!this._rolAccess)
            throw("No se ha inicializado la configuraci�n de accesos del rol.");

        // Si tenemos IdModelo obtenemos solo los del modelo indicado
        if(idModelo){
            if(Env.Global && Env.Global.proyecto ) // BUSCAMOS POR FASE DEL PROYECTO EN CURSO
            {
                if( Env.Global.proyecto.faseActual){
                    var idTmpl = _.find(view.srvProyecto.gestorFases.colFases.to_JSON(), function(reg){ return reg.id ==  Env.Global.proyecto.faseActual}).idFaseTmpl;
                    var tipoFase = _.find(Env.Contexto.list('fases'), function(reg) { return reg.id == idTmpl}).tipo;

                    res = _.find(this._rolAccess, function(a){ return a.idModelo == idModelo && a.tipoFase == tipoFase;});
                    if(!res)
                    {
                        res = _.find(this._rolAccess, function(a){ return a.idModelo == idModelo && a.idFase == null;});
                    }
                }
                else{
                    res = _.find(this._rolAccess, function(a){ return a.idModelo == idModelo && a.idFase == null;});
                }
            }
            else
            {
                res = _.find(this._rolAccess, function(a){ return a.idModelo == idModelo && a.idFase == null;});
            }
        }
        else{
            res = this._rolAccess;
        }

        return res;
    },
    isAdmin : function(){
        return this.getRolInfo().esAdministrador;
    },
    isProyectBoss : function(){
        return this.getRolInfo().esJefeProyecto;
    },
    canSeeCosts : function(){
        return this.getRolInfo().veCostos;
    }
});
var Contexto = Class.extend({
    include: WhithEvents,
    /**
     * @constructor
     * @returns {Contexto}
     */
    initialize : function(){
        this.ls_cache_adm = null; //new ProxyLocalStorage({dbName:'contexto_adm'});
        this.ls_cache_base = null; //new ProxyLocalStorage({dbName:'contexto_base'});

        this.loaded = $.Deferred();
        this.base_loaded = false;
        this.adm_loaded = false;

        this.createVariables();

        return this;
    },
    createVariables : function(){
        this.base = {};
        this.adm = {};

        this.ModelStore =    new ModelManager();
        this.CollectionStore =  new CollectionManager({modelStore : this.ModelStore});

        this.Service = new Service({
            proxy: 'WebService',
            url : WEB_SERVICE_URL
        });

       // this.sincronizar();
    },
    sincronizar : function(){
        this.base = contextoData.base;
        this.adm = contextoData.adm;

        this.adm_loaded = true;
        this.base_loaded = true;
        this.check_status();
    },
    sincronizar_base : function(){
        this.base_loaded = false;

        if( localStorage.getItem('contexto_base') )
        {
            this.ls_cache_base = new ProxyLocalStorage({dbName:'contexto_base'});

            if(! this.ls_cache_base.db.fecha)
            {
                this.sincronizar_base_web();
                return null;
            }


            var fechaISO = new Date();
            var fechaISO_cache = Date.fromISO(this.ls_cache_base.db.fecha);

            if( ((fechaISO - fechaISO_cache) / (60000) ) > 30)
            {
                this.sincronizar_base_web();
                return null;
            }

            this.base.modelos = this.ls_cache_base.getTable( {table :'modelos'});
            this.base.camposModelos = this.ls_cache_base.getTable( {table :'camposModelos' });
            this.base.presentaciones = this.ls_cache_base.getTable( {table :'presentaciones' });
            this.base.camposPresentaciones = this.ls_cache_base.getTable( {table :'camposPresentaciones'});
            this.base.fases = this.ls_cache_base.getTable( {table :'fases'});
            this.base.roles = this.ls_cache_base.getTable( {table :'roles'});
            this.base.accesos = this.ls_cache_base.getTable( {table :'accesos'});
            this.base.usuarios = this.ls_cache_base.getTable( {table :'usuarios'});
            this.base.vistas = this.ls_cache_base.getTable( {table :'vistas'});
            this.base.camposVistas = this.ls_cache_base.getTable( {table :'camposVistas'});

            this.base_loaded = true;
            this.check_status();
        }
        else
        {
            this.sincronizar_base_web();
        }

    },
    sincronizar_base_web : function(){
        $.when(
                this.Service.execute({operation:'listado', params: {table:'base_Modelos'}}),
                this.Service.execute({operation:'listado', params: {table:'base_CamposModelos'}}),
                this.Service.execute({operation:'listado', params: {table:'base_Presentaciones'}}),
                this.Service.execute({operation:'listado', params: {table:'base_CamposPresentacion'}}),
                this.Service.execute({operation:'listado', params: {table:'base_Fases'}}),
                this.Service.execute({operation:'listado', params: {table:'base_Roles'}}),
                this.Service.execute({operation:'listado', params: {table:'base_Accesos'}}),
                this.Service.execute({operation:'listado', params: {table:'base_Usuarios'}}),
                this.Service.execute({operation:'listado', params: {table:'base_VistaPresentacion'}}),
                this.Service.execute({operation:'listado', params: {table:'base_VistaCampoPresentacion'}})
            ).done(
                _.bind(this.cachear_base, this)
            );
    },
    sincronizar_adm : function(){
        //logger.append('Contexto', 'sincronizar_adm', '');

        this.adm_loaded = false;

        if( localStorage.getItem('contexto_adm') )
        {
            this.ls_cache_adm = new ProxyLocalStorage({dbName:'contexto_adm'});


            if(! this.ls_cache_adm.db.fecha)
            {
                this.sincronizar_adm_web();
                return null;
            }


            var fechaISO = new Date();
            var fechaISO_cache =  Date.fromISO(this.ls_cache_adm.db.fecha);

            if( ((fechaISO - fechaISO_cache) / (60000) ) > 5)
            {
                this.sincronizar_adm_web();
                return null;
            }

            this.adm.modelos = this.ls_cache_adm.getTable( {table: 'modelos'});
            this.adm.camposModelos =  this.ls_cache_adm.getTable({table:'camposModelos'});
            this.adm.presentaciones =   this.ls_cache_adm.getTable({table:'presentaciones'});
            this.adm.camposPresentaciones =    this.ls_cache_adm.getTable({table:'camposPresentaciones'});
            this.adm.fases =    this.ls_cache_adm.getTable({table:'fases'});
            this.adm.roles =   this.ls_cache_adm.getTable({table:'roles'});
            this.adm.accesos =    this.ls_cache_adm.getTable({table:'accesos'});
            this.adm.usuarios =    this.ls_cache_adm.getTable({table:'usuarios'});
            this.adm.vistas =    this.ls_cache_adm.getTable({table:'vistas'});
            this.adm.camposVistas =   this.ls_cache_adm.getTable({table:'camposVistas'});
            this.adm.fuentesNavision =   this.ls_cache_adm.getTable({table:'fuentesNavision'});
            this.adm.filtrosFuentesNavision =    this.ls_cache_adm.getTable({table:'filtrosFuentesNavision'});
            this.adm.responsabilidades =   this.ls_cache_adm.getTable({table:'responsabilidades'});
            this.adm.consultas =    this.ls_cache_adm.getTable({table:'consultas'});
            this.adm.fuentesInternas =   this.ls_cache_adm.getTable({table:'fuentesInternas'});
            this.adm.valoresFuentesInternas =   this.ls_cache_adm.getTable({table:'valoresFuentesInternas'});

            this.adm_loaded = true;
            this.check_status();
        }
        else
        {
            this.sincronizar_adm_web();
        }
    },
    sincronizar_adm_web : function(){
        $.when(
                this.Service.execute({operation:'listado', params: {table:'adm_Modelos'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_CamposModelos'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_Presentaciones'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_CamposPresentacion'}}),
                this.Service.execute({operation:'listado', params: {table:'mod_fasesTipoProyecto'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_Roles'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_Accesos'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_Usuarios'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_VistaPresentacion'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_VistaCampoPresentacion'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_FuentesNavision'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_FiltrosFuenteNavision'}}),
                this.Service.execute({operation: 'raw', params :{ texto : 'SELECT * FROM adm_CampoPresentacion_Rol'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_Consultas'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_FuentesInternas'}}),
                this.Service.execute({operation:'listado', params: {table:'adm_FuentesInternasValores'}})
            ).done(
                _.bind(this.cachear_adm, this)
            );
    },
    cachear_base : function(modelos, camposModelos, presentaciones, camposPresentaciones, fases, roles, accesos, usuarios, vistas, camposVistas){
        ////logger.append('Contexto', 'cachear_base', '' ,arguments);

        this.base.modelos = modelos[0].datos;
        this.base.camposModelos = camposModelos[0].datos;
        this.base.presentaciones = presentaciones[0].datos;
        this.base.camposPresentaciones = camposPresentaciones[0].datos;
        this.base.fases = fases[0].datos;
        this.base.roles = roles[0].datos;
        this.base.accesos = accesos[0].datos;
        this.base.usuarios = usuarios[0].datos;
        this.base.vistas = vistas[0].datos;
        this.base.camposVistas = camposVistas[0].datos;

        this.base_loaded = true;
        this.base.fecha = (new Date()).toISOString();
        localStorage.setItem('contexto_base', JSON.stringify(this.base) );

        this.check_status();
    },
    cachear_adm  : function(modelos, camposModelos, presentaciones, camposPresentaciones, fases, roles, accesos, usuarios, vistas, camposVistas, fuentesNavision, filtrosFuentesNavision, responsabilidades, consultas, fuentesInternas, valoresFuentesInternas){

        this.adm.modelos = modelos[0].datos;
        this.adm.camposModelos = camposModelos[0].datos;
        this.adm.presentaciones = presentaciones[0].datos;
        this.adm.camposPresentaciones = camposPresentaciones[0].datos;
        this.adm.fases = fases[0].datos;
        this.adm.roles = roles[0].datos;
        this.adm.accesos = accesos[0].datos;
        this.adm.usuarios = usuarios[0].datos;
        this.adm.vistas = vistas[0].datos;
        this.adm.camposVistas = camposVistas[0].datos;
        this.adm.fuentesNavision = fuentesNavision[0].datos;
        this.adm.filtrosFuentesNavision = filtrosFuentesNavision[0].datos;
        this.adm.responsabilidades = responsabilidades[0].datos;
        this.adm.consultas = consultas[0].datos;
        this.adm.fuentesInternas = fuentesInternas[0].datos;
        this.adm.valoresFuentesInternas = valoresFuentesInternas[0].datos;

        this.adm_loaded = true;
        this.adm.fecha = (new Date()).toISOString();
        localStorage.setItem('contexto_adm', JSON.stringify(this.adm) );

        this.check_status();
    },
    check_status : function(){
        //logger.append('Contexto', 'check_status', '');

        if(this.adm_loaded && this.base_loaded)
        {
            //logger.append('Contexto', 'check_status OK', '');
            this.trigger('loaded', this);
            this.loaded.resolve();
        }
    },
    list : function(tabla, tipo){
        //logger.append('Contexto', 'list', '', arguments);

        var resultado = [];

        if(tipo){
            //final = final.concat(this[tipo][tabla]);
            resultado = resultado.concat(this[tipo][tabla]);

        }
        else{
            resultado = resultado.concat(this.base[tabla]);
            resultado = resultado.concat(this.adm[tabla]);
        }

        return resultado;
    }
});
var Application = Class.extend({
    include: WhithEvents,
    initialize : function(){
        this.loaded = $.Deferred();
        this.createVariables();
    },
    createVariables : function(){
        this.Global = {};

        this.Contexto = new Contexto();
        this.Contexto.on('loaded', _.bind(this.loadModels, this));

        this.Acl = new Acl();
        this.ModelStore =    new ModelManager();
        this.CollectionStore =  new CollectionManager({modelStore : this.ModelStore});

        this.Service_WS = new Service({
            proxy: 'WebService',
            url : WEB_SERVICE_URL
        });
        this.Service_Navision = new ServiciosNavision(this.Service_WS);
        this.Contexto.sincronizar();

/*        this.Service = new Service({
            proxy: 'LocalStorage',
            dbName : AppConfig.dataBD
        });
        this.Service_ADM = new Service({
            proxy: 'LocalStorage',
            dbName : AppConfig.adminBD
        });
        this.Service_BASE = new Service({
            proxy: 'LocalStorage',
            dbName : AppConfig.baseBD
        });*/

    },
    loadModels : function(){
        var that = this;
        var listadoModelos_ADM = this.Contexto.adm.modelos;

        _.each(listadoModelos_ADM, function(modelo){
            modelo.campos = _.filter(that.Contexto.adm.camposModelos, function(campo){
                return campo.idModelo == modelo.id;
            });
        });
        this.ModelStore.load(listadoModelos_ADM);

        var listadoModelos_BASE = this.Contexto.base.modelos;

        _.each(listadoModelos_BASE, function(modelo){
            modelo.campos = _.filter(that.Contexto.base.camposModelos, function(campo){
                return campo.idModelo == modelo.id;
            });
        });
        this.ModelStore.load(listadoModelos_BASE);

        //logger.append('Applicacion', 'loaded trigger', 'Carga de los modelos de la aplicacion');

        //this.Acl.setRol('Sistemas');

        /*var frmRol = new FormSeleccionRol();
        frmRol.open();
        frmRol
            .getPromise()
            .done(
            function(){
                this.trigger('loaded', this);
            }
        );*/
        $('#s4-leftpanel').hide(); $('#MSO_ContentTable').css('margin-left' , '0px');
        this.trigger('loaded', this);
    },
    modelos : function(nombre, datos){
        //logger.append('Applicacion', 'modelos', 'Peticion de creacion de un modelo', arguments);

        return this.ModelStore.crear(nombre, datos);
    },
    colecciones : function(nombre, datos){
        //logger.append('Applicacion', 'colecciones', 'Peticion de creacion de una coleccion', arguments);

        return this.CollectionStore.crear(nombre, datos);
    },
    presentaciones : function(clave, base){
        //logger.append('Applicacion', 'presentaciones', 'Peticion de una presentacion', arguments);

        var presentacion = undefined;
        var service = (base) ? this.Contexto.base : this.Contexto.adm;

        presentacion = _.find(service.presentaciones, function(registro){
            return registro.clave == clave;
        });
        presentacion.campos =_.filter(service.camposPresentaciones, function(registro){
            return registro.idPresentacion == presentacion.id;
        });


        var _presentacion = JSON.parse(JSON.stringify(presentacion));
        var vista = null;
        var tieneVistasPresentacion = _.where(Env.Contexto.adm.vistas, { "idPresentacion" : presentacion.id});
        var tieneVistasPresentacionParaRolActual = _.where(Env.Contexto.adm.vistas, { "idPresentacion" : presentacion.id, "idRol" : Env.Acl.getRolInfo().id});
        var tieneVistasPresentacionParaRolActualParaFase = null;

        if(Env.Global && Env.Global.proyecto && Env.Global.proyecto.faseActual)
        {
            var idTmpl = _.find(view.srvProyecto.gestorFases.colFases.to_JSON(), function(reg){ return reg.id ==  Env.Global.proyecto.faseActual}).idFaseTmpl;
            var tipoFase = _.find(Env.Contexto.list('fases'), function(reg) { return reg.id == idTmpl}).tipo;

            tieneVistasPresentacionParaRolActualParaFase = _.where(Env.Contexto.adm.vistas, { "idPresentacion" : presentacion.id, "idRol" : Env.Acl.getRolInfo().id, "tipoFase": tipoFase});
        }
        else
        {
            if(tieneVistasPresentacionParaRolActual && tieneVistasPresentacionParaRolActual.length > 0)
                vista = tieneVistasPresentacionParaRolActual[0];
        }


        if(tieneVistasPresentacionParaRolActualParaFase != null && tieneVistasPresentacionParaRolActualParaFase.length > 0)
            vista = tieneVistasPresentacionParaRolActualParaFase[0];
        //else if(tieneVistasPresentacionParaRolActual && tieneVistasPresentacionParaRolActual.length > 0)
          //  vista = tieneVistasPresentacionParaRolActual[0];

       /* console.log( '***************************************************************');
        console.log( 'Peticion de presentacion ' );
        console.log( 'Presentacion  : ' + clave + ' :: ' + presentacion.id);
        console.log( 'Rol actual : ' + Env.Acl.getRolInfo().nombre );
        console.log( 'Tiene un proyecto cargado ? ' + (Env.Global.proyecto));
        console.log( 'Tiene el proyecto cargado fase ? ' + ((Env.Global.proyecto) ? Env.Global.proyecto.faseActual :"NO hay proyecto cargado" ));
        console.log( '===============================================================');
        console.log( 'Tiene la presentacion alguna vista? ' + ( tieneVistasPresentacion.length) );
        console.log( 'Tiene la presentacion para el rol actual alguna vista? ' + (tieneVistasPresentacionParaRolActual).length );
        if(Env.Global && Env.Global.proyecto && Env.Global.proyecto.faseActual)
            console.log( 'Tiene la presentacion para el rol actual y la fase actual alguna vista? ' + (tieneVistasPresentacionParaRolActualParaFase).length );
        console.log( '***************************************************************');*/

        var camposVista = [];
        if(vista)
        {
            camposVista = _.where(Env.Contexto.adm.camposVistas, {"idVista" : vista.id});
            camposVista = JSON.parse(JSON.stringify(camposVista));
            _.each(camposVista, function(campo){

                delete campo["id"];
                delete campo["styles"];
                delete campo["eventos"];
                delete campo["metodos"];
                delete campo["adm_VistaPresentacion"];
                delete campo["idVista"];

                var campoPresentacion = _.find( _presentacion.campos, function(e){ return  e["titulo"] == campo["titulo"];});
                campoPresentacion = $.extend( {},campoPresentacion , campo);

                var indice = -1;
                _.each(_presentacion.campos, function(e, i){
                    if(e["titulo"] == campo["titulo"])
                        indice = i;
                });

                if(indice != -1)
                    _presentacion.campos[indice] = campoPresentacion;
            });
        }

        return _presentacion;
    },
    fuenteNavision : function(nombre){
        //logger.append('Applicacion', 'fuenteNavision', 'Peticion de una fuenteNavision ', arguments);

        var fuenteNavision = undefined;

        var service = this.Contexto.adm;

        fuenteNavision = _.find(service.fuentesNavision, function(registro){
            return registro.nombre == nombre;
        });
        fuenteNavision.campos =_.filter(service.filtrosFuentesNavision, function(registro){
            return registro.id_FuenteNavision == fuenteNavision.id;
        });

        return fuenteNavision;
    },
    obtenerFuenteNavision : function(nombre){
        var fuente = this.fuenteNavision(nombre);

        var filtro = {};
        for(var i in fuente.campos)
            filtro[  fuente.campos[i].campo] =  fuente.campos[i].valor;

        return this.Service_WS.execute( {
            operation: 'navision',
            params : {
                operation : 'EjecutarFiltro' ,
                params : {
                    Pagina: fuente.fuente,
                    Filtro: filtro,
                    Tamanyo : 0,
                    Campos : []
                }
            }
        });
    },
    fuenteInterna : function(nombre){
        var fuenteInterna = undefined;

        var service = this.Contexto.adm;

        fuenteInterna = _.find(service.fuentesInternas, function(registro){
            return registro.nombre == nombre;
        });
        fuenteInterna.valores =_.filter(service.valoresFuentesInternas, function(registro){
            return registro.idFuenteInterna == fuenteInterna.id;
        });

        return fuenteInterna;
    },
    query: function(nombre, params){
        var _query = undefined;

        var consulta = _.find(this.Contexto.adm.consultas, function(registro){
            return registro.nombre == nombre;
        });

        if(consulta)
        {
            if(params)
                _query = new Query({
                    sql : consulta.sql,
                    params : params
                });
            else
                _query = new Query({
                    sql : consulta.sql
                });

        }


        return _query;
    }

});
var Env = new Application();
var Query = Class.extend({
    initialize: function(params){
        this.regExpParams = new RegExp(/@\w+/g);
        this._defaults = {
            sql  : '',
            params : undefined,
            preparedSql : ''
        };

        $.extend(this, this._defaults, params);
    },
    execute : function(){
        var $promise = $.Deferred();

        if( this.hasParams() && this.params !== undefined)
        {
            this.replaceParams();
            $promise = Env.Service_WS.execute(
                {
                    operation : 'raw' ,
                    params : {
                        texto : this.preparedSql
                    }
                }
            );
        }
        else
        {
            $promise = Env.Service_WS.execute(
                {
                    operation : 'raw' ,
                    params : {
                        texto : this.sql
                    }
                }
            );
        }


        return $promise;
    },
    hasParams: function(){
        return (new RegExp(/@\w+/g)).test(this.sql);
    },
    resetParams : function(newParams){
        this.params = newParams;
    },
    collectParams : function(){
        var params = [];
        var flag = this.regExpParams.exec(this.sql);

        while(flag != null) {
            params.push(flag[0]);
            flag = this.regExpParams.exec(this.sql);
        }

        return params;
    },
    replaceParams : function(){
        var tmpSQL = this.sql;
        var paramsCol = this.collectParams();
        _.each(paramsCol, _.bind(function(p){
            if(this.params[p])
                tmpSQL = tmpSQL.replace(p, this.params[p]);
            else
            {
                var valor = prompt("Introduce el valor para el parametro '" + p + "'");
                if(valor)
                    tmpSQL = tmpSQL.replace(p, valor);
                else
                    throw new Error("No se ha encontrado valor para el parametro '" + p + "'");
            }
        }, this));

        this.preparedSql = tmpSQL;
    }
});

Types = {};
Types.Base = Class.extend({
    include: WhithEvents,
    initialize: function(){
        this.nullable = false;
        this.valor = undefined;
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate())
            this.valor = valor;
    },
    validate : function(){
        return true;
    }
});
Types.Guid = Class.extend(Types.Base , {
    initialize: function(config){
        this.parent(config);
        this.valor = undefined;
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate(valor))
            this.valor = valor;
        else
            throw  new Error('No se puede asignar el valor a un campo guid.');
    },
    validate : function(valor){
        var resultado = false;
        var valorAComprobar = (valor) ? valor : this.valor;

        return _.isString(valorAComprobar);
    }
});
// TODO: Diferenciar entre int float
Types.Numerico = Class.extend(Types.Base , {
    initialize: function(config){
        this.parent(config);
        this.valor = 0;
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        var fmtValue = valor;

        if(!Utils.isNull(valor) && !Utils.isUndefined(valor) && Utils.isString(valor))
            fmtValue = Utils.parseToFloat(valor);

        if(this.validate(fmtValue))
            this.valor = fmtValue;
        else
            throw  new Error('No se puede asignar el valor a un campo n�mero.');
    },
    validate : function(valor){
        var resultado = false;
        var valorAComprobar = (valor) ? valor : this.valor;

        return Validator.number(valorAComprobar);
    }
});
Types.Texto = Class.extend(Types.Base , {
    initialize: function(config){
        this.defaults = {
            defaultValue : "",
            required : false
        };
        this.parent(config);

        this.config = $.extend({}, this.defaults, config);
        this.valor = this.config.defaultValue;
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate(valor))
            this.valor = valor;
        else
            throw  new Error('No se puede asignar el valor a un campo texto.');
    },
    validate : function(valor){
        var resultado = false;
        var valorAComprobar = (valor) ? valor : this.valor;

        return _.isString(valorAComprobar);
    }
});
Types.Boolean = Class.extend(Types.Base , {
    initialize: function(config){
        this.parent(config);
        this.valor = false;
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate(valor))
            this.valor = valor;
        else
            throw  new Error('No se puede asignar el valor a un campo boolean.');
    },
    validate : function(valor){
        var resultado = false;

        var valorAComprobar = (valor) ? valor : this.valor;

        return _.isBoolean(valorAComprobar);
    }
});
Types.DateTime= Class.extend(Types.Base , {
    initialize: function(config){
        this.parent(config);
        this.valor = "";
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate(valor))
            this.valor = valor;
        else
        {
            throw  new Error('No se puede asignar el valor a un campo DateTime.');
        }

    },
    validate : function(valor){
        var resultado = false;

        var valorAComprobar = (valor) ? valor : this.valor;

        return _.isDate(valorAComprobar);
    }
});
Types.Coleccion = Class.extend(Types.Base , {
    initialize: function(config){
        this.parent(config);
        this.valor = "";
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate(valor))
            this.valor = valor;
        else
            throw  new Error('No se puede asignar el valor a un campo DateTime.');
    },
    validate : function(valor){
        var resultado = false;

        var valorAComprobar = (valor) ? valor : this.valor;

        return _.isObject(valorAComprobar);
    }
});
Types.Referencia = Class.extend(Types.Base , {
    initialize: function(config){
        this.parent(config);
        this.valor = "";
    },
    get: function(){
        return this.valor;
    },
    set: function(valor){
        if(this.validate(valor))
            this.valor = valor;
        else
            throw  new Error('No se puede asignar el valor a un campo DateTime.');
    },
    validate : function(valor){
        var resultado = false;

        var valorAComprobar = (valor) ? valor : this.valor;

        return _.isDate(valorAComprobar);
    }
});

/*MiModelo = Class.extend({
    initialize: function(){
        this._guid = new Types.Guid();
        this._numero = new Types.Numerico();
        this._string = new Types.Texto();
        this._bool = new Types.Boolean();
        this._dateTime = new Types.DateTime();
    }
});*/

var _admin = {
    modelos : [],
    campos_modelo : [],
    presentaciones : [],
    campos_presentacion : [],
    vista_presentacion : [],
    campos_vista_presentacion : [],
    roles : [],
    accesos : [],
    usuarios : [],
    fases : []
};

var _Validator = Class.extend({
    initialize: function(){},
    /**
     * Comprobaci�n de que el tipo es un string
     *
     * @param v {Object}  Valor a comprobar si es un string
     * @returns {boolean} Resultado de la validaci�n
     */
    string : function(v) {
        if (v == null) return true;
            return (typeof v === "string");
    },
    /**
     *
     * @param v {Object}    Valor a comprobar si es un string
     * @param ctx {Object}
     * @param ctx.allowEmptyStrings {Boolean} Flag que indica si se permiten cadenas vacias
     * @returns {boolean} Resultado de la validaci�n
     */
    required  :function (v, ctx) {
        if (typeof v === "string") {
            if (ctx && ctx.allowEmptyStrings) return true;
            return v.length > 0;
        } else {
            return v != null;
        }
    },
    /**
     *
     * @param v {Object}    Valor a comprobar si es un n�mero
     * @param ctx {Object}
     * @param ctx.allowString {Boolean} Flag que indica si se permiten cadenas
     * @returns {boolean} Resultado de la validaci�n
     */
    number : function (v, ctx) {
        if (v == null) return true;
        if (typeof v === "string" && ctx && ctx.allowString) {
            v = parseInt(v, 10);
        }
        return (typeof v === "number" && !isNaN(v));
    },
    /**
     *
     * @param v {Object}    Valor a comprobar si es un boolean
     * @returns {boolean} Resultado de la validaci�n
     */
    bool : function (v) {
        if (v == null) return true;
        return (v === true) || (v === false);
    },
    /**
     *
     * @param v {Object}    Valor a comprobar si es un entero
     * @param ctx {Object}
     * @param ctx.allowString {Boolean} Flag que indica si se permiten cadenas
     * @returns {boolean} Resultado de la validaci�n
     */
    integer : function (v, ctx) {
        if (v == null) return true;
        if (typeof v === "string" && ctx && ctx.allowString) {
            v = parseInt(v, 10);
        }
        return (typeof v === "number") && (!isNaN(v)) && Math.floor(v) === v;
    },
    /**
     *
     * @param v {Object}    Valor a comprobar si una cadena tiene el tama�ao adecuado
     * @param ctx {Object}
     * @param ctx.minLength {int} N�mero minimo de caracteres
     * @param ctx.maxLength {int} N�mero maximo de caracteres
     * @returns {boolean} Resultado de la validaci�n
     */
    stringLength : function (v, ctx) {
        if (v == null) return true;
        if (typeof (v) !== "string") return false;
        if (ctx.minLength != null && v.length < ctx.minLength) return false;
        if (ctx.maxLength != null && v.length > ctx.maxLength) return false;

        return true;
    }
});
var _Converters = Class.extend({
    initialize: function(){}
});
var Validator = new _Validator();
var Utils = {
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
        return Utils.getType(o) === "string";
    },
    isDate : function(o) {
        return Utils.getType(o) === "date" && !isNaN(o.getTime());
    },
    isFunction: function(o) {
        return Utils.getType(o) === "function";
    },
    isGuid : function(value) {
        return Utils.getType(value) && /[a-fA-F\d]{8}-(?:[a-fA-F\d]{4}-){3}[a-fA-F\d]{12}/.test(value);
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
    stringPaddingLeft: function(str, character, num){
        var mask = "";
        while(num > 0)
        {
            mask += character;
            num--;
        }

        return String(mask + str).slice(-mask.length);
    },
    stringPaddingRight: function(str, character, num){
        var mask = "";
        while(num > 0)
        {
            mask += character;
            num--;
        }


        return String(str + mask ).slice(0,mask.length);
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
            var val = parseFloat(src);
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
                return value;
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

    //Utils.stringPaddingLeft('1.000.000', '0', 0) + "," + Utils.stringPaddingLeft('500', '0', 3) + " €"
};

// TODO: VALIDAR ESTO O BORRAR
var AdministracionFacade = Class.extend({
    initialize : function(){},

    obtenerModelo : function(modelo){
        return Env.Service_WS.execute(
            {
                operation: 'buscar',
                params: {
                    Entidad: 'adm_Modelos',
                    Where: {
                        "nombre": Utils.Types.formatString(modelo)
                    },
                    Referencias: false,
                    Colecciones: true
                }
            });
    },
    obtenerPresentacion : function(presentacion){
        return Env.Service_WS.execute(
            {
                operation: 'buscar',
                params: {
                    Entidad: 'adm_Presentaciones',
                    Where: {
                        "clave": Utils.Types.formatString(presentacion)
                    },
                    Referencias: false,
                    Colecciones: true
                }
            });
    },
    obtenerVista : function(vista){
        return Env.Service_WS.execute(
            {
                operation: 'buscar',
                params: {
                    Entidad: 'adm_VistaPresentacion',
                    Where: {
                        "nombre": Utils.Types.formatString(vista)
                    },
                    Referencias: false,
                    Colecciones: true
                }
            });
    },
    obtenerPlantilla : function(plantilla){
        return Env.Service_WS.execute(
            {
                operation: 'buscar',
                params: {
                    Entidad: 'adm_PlantillasNavision',
                    Where: {
                        "nombre": Utils.Types.formatString(plantilla)
                    },
                    Referencias: false,
                    Colecciones: true
                }
            });
    }

});

var AplicacionFacade = Class.extend({
    initialize : function(){},
    getProducto : function(idProducto){}
});

var ExportacionProductoANavisionFacade = Class.extend({
    initialize : function(){
        this.plantilla = '';
        this.validador = new ValidadorProductoANavision();
    },

    //PUBLICAS
    exportacionParcial : function(idProducto, tipo){
        if(Validator.required(idProducto) && Validator.required(tipo)){
            this.plantilla = this._getNombrePlantillaExportacion(tipo);
            return this._exportacionParcialArticulo(idProducto);
        }
        else{
            alert('Faltan parámetros para realizar la exportacion a NAVISION');
        }
    },
    exportacion : function(idProducto, tipo){
        if(Validator.required(idProducto) && Validator.required(tipo)){
            this.plantilla = this._getNombrePlantillaExportacion(tipo);
             return this._exportacionArticulo(idProducto);
        }
        else{
            alert('Faltan parámetros para realizar la exportacion a NAVISION');
        }
    },

    // PRIVADAS
    _getProductoConColecciones : function(idProducto){
        var articulos = Env.modelos('vcl.mod_Articulo');
        return articulos.byId(idProducto);
    },
    _getNombrePlantillaExportacion : function(tipo){
        return "ItemCard_" + tipo;
    },
    _exportacionArticulo : function(idProducto){
        var $d = new $.Deferred();
        this._getProductoConColecciones(idProducto)
            .pipe(_.bind( this._articuloToNavision, this ))
            .pipe(_.bind( function(){
                $d.resolve();
            }, this ));

        return $d;
    },
    _exportacionParcialArticulo : function(idProducto, tipo){
        var $d = new $.Deferred();
        this._getProductoConColecciones(idProducto)
            .pipe(_.bind( this._articuloParcialToNavision, this ))
            .pipe(_.bind( function(){
                $d.resolve();
            }, this ));

        return $d;
    },
    _articuloParcialToNavision : function(resultado){
        if (resultado.tieneDatos) {
            alert('Iniciamos el traspasado  parcial del producto a NAVISION');

            this.datosArticulo = resultado.datos[0];

            return Env.Service_Navision
                .exportacionParcial('ItemCard_Soporte_ExportacionParcial', Env.modelos('vcl.mod_Articulo', this.datosArticulo).to_JSON())
                .pipe(_.bind( this._refrescarArticulo, this))
                .pipe(_.bind( this._marcarExportadoParcialNAV, this, this.datosArticulo))
                .done( function(){ alert('El producto se ha traspasado a NAVISION'); });
        }
    },
    _articuloToNavision : function(resultado){
        if(resultado.tieneDatos) {
            alert('Iniciamos el traspasado del producto a NAVISION');

            this.datosArticulo = resultado.datos[0];

            if (!this.validador.validar(this.datosArticulo)) {
                return new $.Deferred().reject();
            }

            if (this.datosArticulo.exportadoParcialNAV === true) {
                var filtro = {
                    'No' :  this.datosArticulo.referencia
                };

            return Env.Service_Navision
                    .update(filtro, this.plantilla, Env.modelos('vcl.mod_Articulo', this.datosArticulo).to_JSON())
                    .pipe(_.bind( this._refrescarArticulo, this))
                    .pipe(_.bind( this._unidadesDeMedidaToNavision,  this, this.datosArticulo))
                    .pipe(_.bind( this._referenciasCruzadasToNavision, this, this.datosArticulo))
                    .pipe(_.bind( this._gamasDePersonalToNavision, this, this.datosArticulo))
                    .pipe(_.bind( this._gamasTecnicasToNavision, this, this.datosArticulo))
                    .pipe(_.bind( this._productoAlmacenToNavision, this, this.datosArticulo))
                    .pipe(_.bind( this._marcarExportadoNAV, this, this.datosArticulo))
                    .done( function(){ alert('El producto se ha traspasado a NAVISION'); });
            } else {
                return Env.Service_Navision
                        .create(this.plantilla, Env.modelos('vcl.mod_Articulo', this.datosArticulo).to_JSON())
                            .pipe(_.bind( this._refrescarArticulo, this))
                            .pipe(_.bind( this._unidadesDeMedidaToNavision,  this, this.datosArticulo))
                            .pipe(_.bind( this._referenciasCruzadasToNavision, this, this.datosArticulo))
                            .pipe(_.bind( this._gamasDePersonalToNavision, this, this.datosArticulo))
                            .pipe(_.bind( this._gamasTecnicasToNavision, this, this.datosArticulo))
                            .pipe(_.bind( this._productoAlmacenToNavision, this, this.datosArticulo))
                            .pipe(_.bind( this._marcarExportadoNAV, this, this.datosArticulo))
                            .done( function(){ alert('El producto se ha traspasado a NAVISION'); });
        }
        }
    },
    _refrescarArticulo : function(){
        var that = this;
        var $d = $.Deferred();
        console.log('_refrescarArticulo');
        console.log(this.datosArticulo);
        Env.Service_Navision.getItem('ItemCardVCL', { No: this.datosArticulo["referencia"]}).done(
            function(arg){
                console.log('CAMBIAMOS EL ARTICULO');
                console.log(arg);
                that.itemCardVCL  = arg.datos[0];
                $d.resolve( arg.datos[0]);
            }
        );

        return $d;
    },
    _unidadesDeMedidaToNavision: function(){
        console.log('_UNIDADESDEMEDIDATONAVISION');
        if(this.datosArticulo.mod_Articulos_UnidadesMedida.length == 0)
            return new $.Deferred().resolve();
        else
            return Utils.Async.eachPromise(this.datosArticulo.mod_Articulos_UnidadesMedida, this._unidadDeMedidaToNavision, this.datosArticulo);
    },
    _unidadDeMedidaToNavision: function(unidadMedida, articulo){
        console.log('_unidad_de_medida_to_navision_');
        console.log(unidadMedida);

        if(unidadMedida.codigo == 'UD'){
            return Env.Service_Navision.update({'Item_No': articulo.referencia, 'Code': unidadMedida.codigo},'UomItem_Exportacion',
                Env.modelos('vcl.mod_Articulo_UnidadMedida',unidadMedida).to_JSON(),
                function(res){  _.find( res.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = articulo.referencia; }
            );
        }
        else{
            return Env.Service_Navision.create( 'UomItem_Exportacion',
                Env.modelos('vcl.mod_Articulo_UnidadMedida',unidadMedida).to_JSON(),
                function(res){  _.find( res.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = articulo.referencia; }
            );
        }
    },
    _referenciasCruzadasToNavision: function(){
        console.log('_REFERENCIASCRUZADASTONAVISION');
        if(this.datosArticulo.mod_Articulos_ReferenciasCruzadas.length == 0)
            return new $.Deferred().resolve();
        else
            return Utils.Async.eachPromise(this.datosArticulo.mod_Articulos_ReferenciasCruzadas, this._referenciaCruzadasToNavision, this.datosArticulo);
    },
    _referenciaCruzadasToNavision: function(referencia, articulo){
        var traducciones = {
            "Ref. Cliente" : "Customer",
            "Código de Barras" : "Bar_Code"
        };
        var referenciaModelo = Env.modelos('vcl.mod_Articulo_ReferenciaCruzada',referencia);

        if(referenciaModelo.get("descripcion") == "")
            referenciaModelo.set("descripcion", null);

        if(referenciaModelo.get("codigoVariante") == "")
            referenciaModelo.set("codigoVariante", null);

        if(referenciaModelo.get("numTipoReferencia") == "")
            referenciaModelo.set("numTipoReferencia", null);

        console.log('_referenciaCruzadasToNavision');
        console.log(referencia);

        return Env.Service_Navision.create('ItemCrossReference_Exportacion',
            referenciaModelo.to_JSON(),
            function(respuesta){
                    _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = articulo.referencia;
                    _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Cross_Reference_Type'}).valor = traducciones[referencia.tipoReferencia];
            }
        );
    },
    _gamasDePersonalToNavision: function(){
        console.log('_GAMASDEPERSONALTONAVISION');
        if(this.datosArticulo.mod_Articulos_GamaPersonal.length == 0)
            return new $.Deferred().resolve();
        else {
            return Utils.Async.eachPromise(this.datosArticulo.mod_Articulos_GamaPersonal, this._gamaDePersonalToNavision, this.datosArticulo);
        }
    },
    _gamaDePersonalToNavision: function(gamaPersonal, articulo){
        console.log('_gamaDePersonalToNavision');
        console.log(gamaPersonal);

        return Env.Service_Navision.create('ItemPersonnel_Exportacion',
            Env.modelos('vcl.mod_Articulo_GamaPersonal',gamaPersonal).to_JSON(),
            function(respuesta){
                _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = articulo.referencia;
            }
        );
    },
    _gamasTecnicasToNavision: function(){
        console.log('_GAMASTECNICASTONAVISION');
        if(this.datosArticulo.mod_Articulos_GamaTecnicaRuta.length == 0)
            return new $.Deferred().resolve();
        else
            return Utils.Async.eachPromise(this.datosArticulo.mod_Articulos_GamaTecnicaRuta, this._gamasTecnicaToNavision, this.datosArticulo);
    },
    _gamasTecnicaToNavision: function(gamaTecnica, articulo){
        console.log('_gamasTecnicaToNavision');
        console.log(gamaTecnica);

        return Env.Service_Navision.create('ItemRouting_Exportacion',
            Env.modelos('vcl.mod_Articulo_GamaTecnicaRuta',gamaTecnica).to_JSON(),
            function(respuesta){
                _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = articulo.referencia;
            }
        );
    },
    _productoAlmacenToNavision: function () {
        var that = this;
        console.log('_productoAlmacenToNavision');
        console.log(this.itemCardVCL);

        if(this.datosArticulo.tipoArticulo == 'Terminado')
        {
            var m_articulo = Env.modelos('vcl.mod_Articulo', this.datosArticulo).to_JSON();
            var m_articulo2 = Env.modelos('vcl.mod_Articulo', this.datosArticulo).to_JSON();

            //m_articulo.almacenDefecto = this.itemCardVCL.Almacen_defecto;
            m_articulo.almacenDefecto = "21";
            m_articulo2.almacenDefecto = "26";

            return $.when(
                        Env.Service_Navision.create('ItemLocation_Exportacion', m_articulo,
                                    function(respuesta){
                                        _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = that.datosArticulo.referencia;
                                    }),
                        Env.Service_Navision.create('ItemLocation_Exportacion', m_articulo2,
                                    function(respuesta){
                                            _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = that.datosArticulo.referencia;
                                            _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Replenishment_System'}).valor = 'Transfer';
                                    })
                    );
        }
        switch (this.datosArticulo.tipoArticulo) {
            case "Soporte" :
                this.datosArticulo.almacenDefecto = "25";
                break;
            case "Semiterminado" :
                this.datosArticulo.almacenDefecto = "22";
                break;
            case "Embalaje" :
                this.datosArticulo.almacenDefecto = "01";
                break;
        }

        return Env.Service_Navision.create('ItemLocation_Exportacion',
            Env.modelos('vcl.mod_Articulo', this.datosArticulo).to_JSON(),
            function(respuesta){
                _.find( respuesta.datos[0].adm_CampoPlantillaNavision, function(e){ return e.campoDestino == 'Item_No'}).valor = that.datosArticulo.referencia;
            }
        );
    },
    _marcarExportadoNAV : function() {
        var modelo =  Env.modelos('vcl.mod_Articulo', this.datosArticulo);
        modelo.set('exportadoNAV', true);
        return modelo.update();
    },
    _marcarExportadoParcialNAV : function() {
        var modelo =  Env.modelos('vcl.mod_Articulo', this.datosArticulo);
        modelo.set('exportadoParcialNAV', true);
        return modelo.update();
    },

    _validarArticulo : function(articulo) {
        var resultado = true,
            resultadoUnidadesMedida = false;

        resultadoUnidadesMedida = this._validarUnidadesMedida(articulo.mod_Articulos_UnidadesMedida);
        return resultado && resultadoUnidadesMedida;
    },

    _validarUnidadesMedida : function(unidadesMedida) {
        var resultado = true;
        _.each(unidadesMedida, _.bind( function(unidadMedida) {
            resultado = resultado && this._validarUnidadMedida(unidadMedida);
        }, this));
        return resultado
    },
    _validarUnidadMedida : function(unidadMedida) {
        if (Utils.Types.isNumeric(unidadMedida.alto) && Utils.Types.isNumeric(unidadMedida.ancho) && Utils.Types.isNumeric(unidadMedida.largo)) {
            return true
        }
        return false;
    }
});
var ExportacionEmbalajesANavisionFacade = Class.extend({
    initialize : function(){
        this.plantilla = '';
    },

    //PUBLICAS
    exportacion : function(idProducto){
        if(Validator.required(idProducto)){
            this.plantilla = this._getNombrePlantillaExportacion();
            return this._exportacionArticulo(idProducto);
        }
        else{
            alert('Faltan parámetros para realizar la exportación a NAVISION');
        }
    },
    exportacionParcial : function(idProducto){
        if(Validator.required(idProducto)){
            return this._exportacionParcialArticulo(idProducto);
        }
        else{
            alert('Faltan parámetros para realizar la exportacion a NAVISION');
        }
    },

    // PRIVADAS
    _getProductoConColecciones : function(idProducto){
        var articulos = Env.modelos('vcl.mod_Embalaje');
        return articulos.byId(idProducto);
    },
    _getNombrePlantillaExportacion : function(){
        return "ItemCard_Embalaje";
    },
    _refrescarArticulo : function(){
        var that = this;
        var $d = $.Deferred();
        console.log('_refrescarArticulo');
        console.log(this.datosArticulo);
        Env.Service_Navision.getItem('ItemCardVCL', { No: this.datosArticulo["referencia"]}).done(
            function(arg){
                console.log('CAMBIAMOS EL ARTICULO');
                console.log(arg);
                that.itemCardVCL  = arg.datos[0];
                $d.resolve( arg.datos[0]);
            }
        );

        return $d;
    },
    _exportacionArticulo : function(idProducto){
        return this._getProductoConColecciones(idProducto)
            .done(_.bind( this._articuloToNavision, this ));
    },
    _exportacionParcialArticulo : function(idProducto, tipo){
        var $d = new $.Deferred();
        this._getProductoConColecciones(idProducto)
            .pipe(_.bind( this._articuloParcialToNavision, this ))
            .pipe(_.bind( function(){
                $d.resolve();
            }, this ));

        return $d;
    },
    _articuloParcialToNavision : function(resultado){
        if (resultado.tieneDatos) {
            alert('Iniciamos el traspasado  parcial del producto a NAVISION');

            this.datosArticulo = resultado.datos[0];

            return Env.Service_Navision
                .exportacionParcial('ItemCard_Embalaje_ExportacionParcial', Env.modelos('vcl.mod_Embalaje', this.datosArticulo).to_JSON())
                .pipe(_.bind( this._refrescarArticulo, this))
                .pipe(_.bind( this._marcarExportadoParcialNAV, this, this.datosArticulo))
                .done( function(){ alert('El producto se ha traspasado a NAVISION'); });
        }
    },
    _articuloToNavision : function(resultado){
        if (resultado.tieneDatos){
            this.datosArticulo = resultado.datos[0];
            if (this.datosArticulo.exportadoParcialNAV === true) {
                var filtro = {
                    'No' :  this.datosArticulo.referencia
                };

                return Env.Service_Navision
                    .update(filtro, this.plantilla, Env.modelos('vcl.mod_Embalaje', this.datosArticulo).to_JSON())
                    .pipe(_.bind( this._refrescarArticulo, this))
                    .pipe(_.bind( this._marcarExportadoNAV, this, this.datosArticulo))
                    .done( function(){ alert('El producto se ha traspasado a NAVISION'); });
            } else {
                return Env.Service_Navision
                    .create(this.plantilla, Env.modelos('vcl.mod_Embalaje', this.datosArticulo).to_JSON())
                    .pipe(_.bind( this._refrescarArticulo, this))
                    .pipe(_.bind( this._marcarExportadoNAV, this, this.datosArticulo))
                    .done( function(){ alert('El producto se ha traspasado a NAVISION'); });
            }
        }
    },
    _marcarExportadoNAV : function() {
            var modelo =  Env.modelos('vcl.mod_Embalaje', this.datosArticulo);
            modelo.set('exportadoNAV', true);
            return modelo.update();
        },
    _marcarExportadoParcialNAV : function() {
        var modelo =  Env.modelos('vcl.mod_Embalaje', this.datosArticulo);
        modelo.set('exportadoParcialNAV', true);
        return modelo.update();
    }
});

var ValidadorProductoANavision = Class.extend({
    initialize : function() {

    },
    validar : function (articulo){
        this.articulo = articulo;
        this.mensajes = [];

        this._validarPresenciaUnidadesMedida();
        this._validarUnidadesMedida();
        this._validarPresenciaReferenciasCruzadas();
        this._validarReferenciasCruzadas();
        this._validarGamaPersonal();
        this._validarGamaTecnica();

        if (this.mensajes.length > 0) {
            alert("Errores en la validación del producto\n========================\n\n" + this._crearMensajeDeErrores());
            return false;
        } else {
            return true;
        }
    },
    _validarPresenciaUnidadesMedida : function() {
        var unidadesPresentes = _.pluck(this.articulo.mod_Articulos_UnidadesMedida, 'codigo'),
            unidadesPresentesResultado;
        switch (this.articulo.tipoArticulo) {
            case "Soporte":
                unidadesPresentesResultado = (_.indexOf(unidadesPresentes, 'UD') !== -1 );
                if (_.indexOf(unidadesPresentes, 'UD') === -1 ) {
                    this.mensajes.push("Falta la unidad de medida 'UD'");
                }

                break;
            case "Semiterminado":
                unidadesPresentesResultado = (_.indexOf(unidadesPresentes, 'UD') !== -1  && _.indexOf(unidadesPresentes, 'PALET') !== -1);
                if (_.indexOf(unidadesPresentes, 'UD') === -1 ) {
                    this.mensajes.push("Falta la unidad de medida 'UD'");
                }
                if (_.indexOf(unidadesPresentes, 'PALET') === -1 ) {
                    this.mensajes.push("Falta la unidad de medida 'PALET'");
                }
                break;
            case "Terminado":
                unidadesPresentesResultado = (_.indexOf(unidadesPresentes, 'UD') !== -1  && _.indexOf(unidadesPresentes, 'PALET') !== -1 && _.indexOf(unidadesPresentes, 'CAJA') !== -1);
                if (_.indexOf(unidadesPresentes, 'UD') === -1 ) {
                    this.mensajes.push("Falta la unidad de medida 'UD'");
                }
                if (_.indexOf(unidadesPresentes, 'PALET') === -1 ) {
                    this.mensajes.push("Falta la unidad de medida 'PALET'");
                }
                if (_.indexOf(unidadesPresentes, 'CAJA') === -1 ) {
                    this.mensajes.push("Falta la unidad de medida 'CAJA'");
                }
                break;
        }
    },
    _validarUnidadesMedida : function() {
        _.each(this.articulo.mod_Articulos_UnidadesMedida, _.bind( function(unidadMedida) {
            this._validarUnidadMedida(unidadMedida);
        }, this));
    },
    _validarUnidadMedida : function(unidadMedida) {
        if (Utils.Types.isNumeric(unidadMedida.alto) && Utils.Types.isNumeric(unidadMedida.ancho) && Utils.Types.isNumeric(unidadMedida.largo)) {
            return true
        }

        this.mensajes.push("Revisar la unidad de medida " + unidadMedida.codigo);
        return false;
    },
    _validarPresenciaReferenciasCruzadas : function() {
        var unidadesPresentes = _.pluck(this.articulo.mod_Articulos_ReferenciasCruzadas, 'unidadMedida'),
            unidadesPresentesResultado;
        switch (this.articulo.tipoArticulo) {
            case "Soporte":
                unidadesPresentesResultado = (_.indexOf(unidadesPresentes, 'UD') !== -1 );
                if (_.indexOf(unidadesPresentes, 'UD') === -1 ) {
                    this.mensajes.push("Falta la referencia cruzada 'UD'");
                }

                break;
            case "Semiterminado":
                unidadesPresentesResultado = (_.indexOf(unidadesPresentes, 'UD') !== -1  && _.indexOf(unidadesPresentes, 'PALET') !== -1);
                if (_.indexOf(unidadesPresentes, 'UD') === -1 ) {
                    this.mensajes.push("Falta la referencia cruzada 'UD'");
                }
                if (_.indexOf(unidadesPresentes, 'PALET') === -1 ) {
                    this.mensajes.push("Falta la referencia cruzada 'PALET'");
                }
                break;
            case "Terminado":
                unidadesPresentesResultado = (_.indexOf(unidadesPresentes, 'UD') !== -1  && _.indexOf(unidadesPresentes, 'PALET') !== -1 && _.indexOf(unidadesPresentes, 'CAJA') !== -1);
                if (_.indexOf(unidadesPresentes, 'UD') === -1 ) {
                    this.mensajes.push("Falta la referencia cruzada 'UD'");
                }
                if (_.indexOf(unidadesPresentes, 'PALET') === -1 ) {
                    this.mensajes.push("Falta la referencia cruzada 'PALET'");
                }
                if (_.indexOf(unidadesPresentes, 'CAJA') === -1 ) {
                    this.mensajes.push("Falta la referencia cruzada 'CAJA'");
                }
                break;
        }
    },
    _validarReferenciasCruzadas : function (){
        var resultado = true;

        _.each(this.articulo.mod_Articulos_ReferenciasCruzadas, _.bind( function(referencia) {
            this._validarReferenciaCruzada(referencia);
        }, this));

        return resultado
    },
    _validarReferenciaCruzada : function (referencia){
        if ( (Utils.Types.isString(referencia.numReferencia) && !Utils.Types.stringIsEmptyOrNull(referencia.numReferencia)) &&
             (Utils.Types.isString(referencia.tipoReferencia) && !Utils.Types.stringIsEmptyOrNull(referencia.tipoReferencia)) &&
             (Utils.Types.isString(referencia.unidadMedida) && !Utils.Types.stringIsEmptyOrNull(referencia.unidadMedida)) ) {
            return true
        }

        this.mensajes.push("Revisar la referencia cruzada " + referencia.unidadMedida);
        return false;
    },
    _validarGamaPersonal : function () {
        if (this.articulo.mod_Articulos_GamaPersonal && this.articulo.mod_Articulos_GamaPersonal.length > 0) {
            return true;
        }

        this.mensajes.push("El producto no tiene creada gama de personal.");
        return false;
    },
    _validarGamaTecnica : function () {
        if (this.articulo.mod_Articulos_GamaTecnicaRuta && this.articulo.mod_Articulos_GamaTecnicaRuta.length > 0) {
            return true;
        }
        this.mensajes.push("El producto no tiene creada gama ruta técnica.");
        return false;
    },
    _crearMensajeDeErrores : function () {
        return this.mensajes.join('\n');
    }
});

//TODO: REFACTORIZAR ESTAS FUNCIONES DENTRO DE LAGUNA CLASE (25/04/2014)
function makeMasterDetail(master, detail, detailColumn){
    master.tabla.on('rowClick', function(){
        showDetailData();
    });
    master.tabla.on('rowDblClick', function(){
        showDetailData();
    });

    detail.ficha.on('opened', function(){
        setFK();
    });

    function showDetailData(){
        var filterData = {};
        filterData[detailColumn] = Utils.Types.formatString(master.tabla.valorClave());

        var query = {
            query : filterData,
            referencias: false,
            colecciones:false
        };

        detail.tabla.collection.makeQuery(query)
            .done(function(res){
                detail.tabla.collection.setData(res.datos);
            });
    };
    function setFK(){
        if(detail.ficha.modo == "Alta")
        {
            detail.ficha.find(detailColumn).Value(master.tabla.valorClave());
            //detail.ficha.find(detailColumn).show();
        }
        else
            detail.ficha.find(detailColumn).hide();
    };

};
function ImportFromNavision(plantilla, filtroNavision, datos){
    function obtenerPlantilla(nombre){

        return Env.Service_WS.execute(
            {
                operation: 'buscar',
                params: {
                    Entidad: 'adm_PlantillasNavision',
                    Where: {
                        "nombre": "'" + nombre + "'"
                    },
                    Referencias: false,
                    Colecciones: true
                }
            });
    };
    function fromNavision(plantilla){

        return Env.Service_Navision.getItem(plantilla, filtroNavision);
    };
    function formatData(navData, tmplFields){
        var o = {};
        _.each(tmplFields, function(field){

            if(field.campoOrigen)
            {
                if(field.origen == 'Manual')
                    o[field.campoOrigen] = field.valor;
                else
                    o[field.campoOrigen] = navData[field.campoDestino];
            }

        });
        return o;
    }

    var $obtenerPlantilla = $.Deferred(),
        $obtenerDatosNavision = $.Deferred(),
        $transformarDatos = $.Deferred(),
        $finalizado = $.Deferred();

    var result = [];

    obtenerPlantilla(plantilla)
        .done(
        function(res){
            if(res && res.tieneDatos)
            {
                $obtenerPlantilla.resolve(
                    Env.modelos('ipk.plantillasNavision',res.datos[0]).to_JSON(),
                    Env.colecciones('ipk.campoPlantillaNavision',res.datos[0].adm_CampoPlantillaNavision).to_JSON()
                );
            }
        }
    );

    $obtenerPlantilla.done(
        function(plantilla, camposPlantilla){
            fromNavision(plantilla.page).done(function(res){
                 if(res.tieneDatos) {
                     //_.each(res.datos , function(e){console.log(e);});
                     $obtenerDatosNavision.resolve(res.datos, plantilla, camposPlantilla);
                 }
                 else{
                     alert('No se ha encontrado producto con el código indicado.');
                 }
            });
        }
    );

    $obtenerDatosNavision.done(
        function(datosNav, tmplHeader, tmplFields){

            _.each(datosNav, function(reg){
                result.push( formatData(reg, tmplFields) );
            });

            $finalizado.resolve(result);
        }
    );


    return $finalizado;
};