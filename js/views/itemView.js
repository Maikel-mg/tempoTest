var ItemView = Backbone.View.extend({
    render : function () {

        if (this.model) {
            this.$el.html(this.template(this.model.attributes));
        } else {
            this.$el.html(this.template({}));
        }

        this.trigger('viewRendered');

        return this;
    }
});
