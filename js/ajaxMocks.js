/**
 *  USUARIO
 */
/**
 * POST /api/usuario/login
 */
$.mockjax({
    url: "/api/usuario/login",
    type: 'POST',
    response: function(options) {
        console.log('POST LOGIN', options.data);
        this.responseText = _.where(fixtures.usuarios, {nombre : options.data.usuario})[0];
    }
});
/**
 * GET /api/usuario
 */
$.mockjax({
    url: "/api/usuario/",
    type: 'GET',
    response: function() {
        console.log('GET', arguments);
        this.responseText = fixtures.usuarios;
    }
});
/**
 * GET /api\/usuario\/([0-9]{1,4})+/
 */
$.mockjax({
    url: /api\/usuario\/([0-9]{1,4})+/,
    urlParams: ["id"],
    responseTime: 3000,
    type: 'GET',
    response: function(settings) {
        console.log('GET ID', settings);
        this.responseText = _.where(fixtures.usuarios, {id : settings.urlParams.id})[0];
    }
});
/**
 * PUT /api/usuario/*
 */
$.mockjax({
    url: "/api/usuario/*",
    type: 'PUT',
    response: function(options) {
        console.log('PUT', options);
        this.responseText = fixtures.usuarios;
    }
});


/**
 * PROYECTOS
  */
/**
 * GET /api/proyectos
 */
$.mockjax({
    url: "api/proyectos",
    type: 'GET',
    response: function() {
        this.responseText = fixtures.proyectos;
    }
});
/**
 * GET /api\/proyectos\/([0-9]{1,4})+/
 */
$.mockjax({
    url: /api\/proyectos\/([0-9]{1,4})+/,
    urlParams: ["id"],
    type: 'GET',
    response: function(settings) {
        console.log('GET ID', settings);
        this.responseText = _.where(fixtures.proyectos, {id : settings.urlParams.id})[0];
    }
});

