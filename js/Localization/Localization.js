//多語系

var LocalLib = {
    resource: undefined,
    set: function (lib) {
        var result = undefined;
        if (typeof lib == 'object') {
            result = {};
            for (var id in lib) {
                var txtObj = lib[id];
                result[id] = txtObj;
            }
        }
        this.resource = result;
    },
    has: function (id) {
        return (this.resource != undefined && id in this.resource);
    },
    get: function (id) {
        if (this.has(id)) return this.resource[id];
        return '---';
    }
};

function UIText(Txtobj) {
    $(Txtobj || '[data-lang]').each(function (index, element) {
        var $self = $(element),
            this_id = $self.data('lang');
        if (LocalLib.has(this_id)) $self.html(LocalLib.get(this_id.toString()));
    });
}