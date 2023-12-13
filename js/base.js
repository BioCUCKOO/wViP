function set_cookie(x) {
    $.post("/client/set_cookie/",
    {
        x:x,
    },
    function(data){
        $('#Modal_cookie').modal('hide');
    });
}
